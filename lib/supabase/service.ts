import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Fallback handles Vercel env var stored as truncated 'SUPABASE_SERVICE_ROLE_'
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env['SUPABASE_SERVICE_ROLE_'])!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
