'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bot, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function InviteAcceptPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setEmail(data.session.user.email ?? '')
        setReady(true)
      } else {
        router.push('/login')
      }
    })
  }, [router])

  async function handleSetPassword() {
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
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
    setDone(true)
    setTimeout(() => router.push('/workspace'), 1800)
  }

  if (!ready) return null

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--s0, #050505)' }}
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--s3, #1a1a1a)', border: '1px solid var(--b2, #2a2a2a)' }}
          >
            <Bot className="w-6 h-6" style={{ color: 'var(--yellow, #ffd900)' }} />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'var(--yellow, #ffd900)' }}>
              DISHIO
            </p>
            <h1 className="text-xl font-semibold mt-1" style={{ color: 'var(--t1, #fff)' }}>
              Set your password
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--t3, #666)' }}>
              Complete your account setup for <span style={{ color: 'var(--t2, #aaa)' }}>{email}</span>
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 space-y-4"
          style={{ background: 'var(--s2, #111)', border: '1px solid var(--b2, #2a2a2a)' }}
        >
          {done ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--yellow, #ffd900)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--t1, #fff)' }}>Password set! Taking you in…</p>
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="text-sm rounded-xl px-4 py-3"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                >
                  {error}
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium tracking-wide" style={{ color: 'var(--t3, #666)' }}>
                  NEW PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none transition-colors"
                    style={{
                      background: 'var(--s3, #1a1a1a)',
                      border: '1px solid var(--b2, #2a2a2a)',
                      color: 'var(--t1, #fff)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--t3, #666)' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium tracking-wide" style={{ color: 'var(--t3, #666)' }}>
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
                    placeholder="Repeat password"
                    className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none transition-colors"
                    style={{
                      background: 'var(--s3, #1a1a1a)',
                      border: '1px solid var(--b2, #2a2a2a)',
                      color: 'var(--t1, #fff)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--t3, #666)' }}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSetPassword}
                disabled={loading || !password || !confirm}
                className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--yellow, #ffd900)', color: '#000' }}
              >
                {loading ? 'Setting password…' : 'Set Password & Enter'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
