import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Vercel integration uses SUPABASE_SERVICE_ROLE_ (no _KEY suffix); local uses _KEY
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env['SUPABASE_SERVICE_ROLE_'])!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
