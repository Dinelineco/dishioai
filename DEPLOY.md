# Dishio AI Phase 1 — Deploy Guide

## Step 1: Install packages
```bash
npm install @supabase/ssr @supabase/supabase-js
```

## Step 2: Run migration in Supabase SQL Editor
Paste and run `migration.sql` in your Supabase project → SQL Editor.

Then bootstrap your admin user:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Step 3: Add environment variables in Vercel
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (Settings → API) |
| `NEXT_PUBLIC_APP_URL` | `https://dishioai.vercel.app` |

## Step 4: Files to copy into your repo

| File | Action |
|---|---|
| `migration.sql` | Run in Supabase only — don't commit |
| `lib/supabase/server.ts` | New file |
| `lib/supabase/client.ts` | New file |
| `lib/supabase/middleware.ts` | New file |
| `middleware.ts` | New file (root of project) |
| `app/auth/callback/route.ts` | New file |
| `app/login/page.tsx` | Replace existing |
| `app/account-locked/page.tsx` | New file |
| `app/invite/accept/page.tsx` | New file |
| `app/api/admin/users/invite/route.ts` | New file |
| `context/AppContext.tsx` | Replace existing |
| `components/workspace/ClientCombobox.tsx` | Replace existing |

## Step 5: Supabase Auth settings
In Supabase → Authentication → URL Configuration:
- Site URL: `https://dishioai.vercel.app`
- Redirect URLs: `https://dishioai.vercel.app/auth/callback`, `https://dishioai.vercel.app/invite/accept`

## Step 6: Commit and deploy
Commit all files → Vercel auto-deploys.

## Step 7: Test
1. Visit `/login` — sign in with your admin account
2. Verify you land on `/workspace`
3. Test inviting a user via POST `/api/admin/users/invite`
4. Invited user gets email → clicks link → `/invite/accept` → sets password → lands on `/workspace`
