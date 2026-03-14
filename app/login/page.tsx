'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }
    router.push('/workspace');
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--s3)',
    border: '1px solid var(--b2)',
    borderRadius: 'var(--r-md)',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--t1)',
    outline: 'none',
    transition: 'border-color 0.15s',
    caretColor: 'var(--yellow)',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'var(--s0)' }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 600, height: 600,
          bottom: -200, left: -200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,217,0,0.04) 0%, transparent 65%)',
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 400, height: 400,
          top: -100, right: -100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,217,0,0.025) 0%, transparent 65%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full"
        style={{ maxWidth: 360 }}
      >
        {/* Logo */}
        <div className="mb-9 text-center">
          <img
            src="/images/DISHIO-LOGOTYPE-YELLOW.png"
            alt="Dishio"
            className="h-6 w-auto object-contain mx-auto mb-3"
          />
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]"
             style={{ color: 'var(--t3)' }}>
            Agency Platform
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-[var(--r-xl)] overflow-hidden"
          style={{
            background: 'var(--s2)',
            border: '1px solid var(--b2)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px var(--b1)',
          }}
        >
          {/* Top accent */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,217,0,0.25), transparent)',
          }} />

          <div className="px-8 py-8 space-y-5">
            <div className="space-y-1">
              <h1 className="text-[15px] font-semibold" style={{ color: 'var(--t1)' }}>Sign in</h1>
              <p className="text-[12px]" style={{ color: 'var(--t3)' }}>Access your Dishio workspace</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-[var(--r-md)] px-3.5 py-2.5 text-[12px]"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  color: '#f87171',
                }}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.16em]"
                     style={{ color: 'var(--t3)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="you@agency.com"
                autoComplete="email"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--b3)')}
                onBlur={e => (e.target.style.borderColor = 'var(--b2)')}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.16em]"
                     style={{ color: 'var(--t3)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••••"
                autoComplete="current-password"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--b3)')}
                onBlur={e => (e.target.style.borderColor = 'var(--b2)')}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="group relative w-full mt-1 flex items-center justify-center gap-2 py-2.5 rounded-[var(--r-md)] text-[13px] font-semibold transition-all duration-150 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'var(--yellow)',
                color: '#000',
                boxShadow: '0 0 20px -6px var(--yellow-glow)',
              }}
              onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.background = '#ffe633')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--yellow)')}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[9px] font-semibold uppercase tracking-[0.2em]"
           style={{ color: 'var(--t4)' }}>
          Dishio AI — Internal Use Only
        </p>
      </motion.div>
    </div>
  );
}
