-- ============================================================
-- Dishio AI Phase 1 Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Extend the existing clients table
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS logo_url     TEXT,
  ADD COLUMN IF NOT EXISTS slug         TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  ADD COLUMN IF NOT EXISTS created_by   UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 2. User profiles (one per auth.users row)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','manager','viewer')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  invited_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Per-client user assignments
CREATE TABLE IF NOT EXISTS public.user_client_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id     UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('manager','viewer')),
  assigned_by   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, client_id)
);
ALTER TABLE public.user_client_assignments ENABLE ROW LEVEL SECURITY;

-- 4. OAuth integrations per client
CREATE TABLE IF NOT EXISTS public.integrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL CHECK (provider IN ('google_ads','meta_ads','google_drive','toast','square')),
  status          TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected','disconnected','error')),
  access_token    TEXT,
  refresh_token   TEXT,
  token_expires_at TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  connected_by    UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, provider)
);
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- 5. Revenue entries (manual + POS)
CREATE TABLE IF NOT EXISTS public.revenue_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  period_start  DATE NOT NULL,
  period_end    DATE NOT NULL,
  revenue       NUMERIC(12,2) NOT NULL,
  ad_spend      NUMERIC(12,2),
  source        TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','toast','square','import')),
  notes         TEXT,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;

-- 6. Audit log
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   UUID,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: is the current user an admin?
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
  );
$$;

-- ============================================================
-- RLS Policies
-- ============================================================

-- profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can update their own profile; admins can update any"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_admin());

-- user_client_assignments
CREATE POLICY "Users see their own assignments; admins see all"
  ON public.user_client_assignments FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage assignments"
  ON public.user_client_assignments FOR ALL
  USING (public.is_admin());

-- integrations
CREATE POLICY "Users see integrations for their assigned clients"
  ON public.integrations FOR SELECT
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.user_client_assignments
      WHERE user_id = auth.uid() AND client_id = integrations.client_id
    )
  );

CREATE POLICY "Admins and managers can manage integrations"
  ON public.integrations FOR ALL
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.user_client_assignments
      WHERE user_id = auth.uid()
        AND client_id = integrations.client_id
        AND role = 'manager'
    )
  );

-- revenue_entries
CREATE POLICY "Users see revenue for their assigned clients"
  ON public.revenue_entries FOR SELECT
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.user_client_assignments
      WHERE user_id = auth.uid() AND client_id = revenue_entries.client_id
    )
  );

CREATE POLICY "Admins and managers can manage revenue entries"
  ON public.revenue_entries FOR ALL
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.user_client_assignments
      WHERE user_id = auth.uid()
        AND client_id = revenue_entries.client_id
        AND role = 'manager'
    )
  );

-- audit_logs: admins only
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Bootstrap: After running this, manually set your admin user:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================================
