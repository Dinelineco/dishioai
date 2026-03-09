'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function InviteAcceptPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase redirects invite links to this page with a session already set
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
      else router.push('/login')
    })
  }, [router])

  async function handleSetPassword() {
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }
    router.push('/workspace')
  }

  if (!ready) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-white text-xl font-semibold">Dishio AI</span>
          </div>
          <p className="text-zinc-500 text-sm mt-2">Set your password to complete setup</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-zinc-400 text-sm">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 text-sm">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
              placeholder="Repeat password"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <button
            onClick={handleSetPassword}
            disabled={loading || !password || !confirm}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Setting password…' : 'Set Password & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
