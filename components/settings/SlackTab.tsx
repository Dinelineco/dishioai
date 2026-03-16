'use client'
import { useState } from 'react'
import { Check, Loader2, AlertCircle, ExternalLink, Zap } from 'lucide-react'

interface SlackTabProps {
  profile: { full_name?: string | null; slack_webhook_url?: string | null; slack_channel_name?: string | null }
  onSaved: () => void
}

export function SlackTab({ profile, onSaved }: SlackTabProps) {
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [webhookUrl, setWebhookUrl] = useState(profile.slack_webhook_url ?? '')
  const [channelName, setChannelName] = useState(profile.slack_channel_name ?? '')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true); setError(''); setSuccess('')
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, slack_webhook_url: webhookUrl, slack_channel_name: channelName }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Failed to save'); return }
    setSuccess('Saved!')
    onSaved()
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleTest() {
    if (!webhookUrl) { setError('Enter a Slack Webhook URL first.'); return }
    setTesting(true); setError(''); setSuccess('')
    const res = await fetch('/api/profile/test-slack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl }),
    })
    const data = await res.json()
    setTesting(false)
    if (data.ok) setSuccess('Test message sent to Slack!')
    else setError(data.error || 'Test failed')
    setTimeout(() => { setSuccess(''); setError('') }, 5000)
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--t1)' }}>Profile</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--t3)' }}>Your display name shown in the workspace.</p>
      </div>

      <Field label="Full Name">
        <input
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          style={{ background: 'var(--s3)', border: '1px solid var(--b2)', color: 'var(--t1)' }}
        />
      </Field>

      <div className="border-t pt-6" style={{ borderColor: 'var(--b1)' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold" style={{ color: 'var(--t1)' }}>Slack Connection</h2>
          <a
            href="https://api.slack.com/messaging/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs transition-colors"
            style={{ color: 'var(--t3)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--yellow)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--t3)'}
          >
            How to get a webhook <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--t3)' }}>
          Create an Incoming Webhook in Slack and paste the URL below. Reports will be sent to that channel.
        </p>

        <div className="space-y-4">
          <Field label="Incoming Webhook URL">
            <input
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none font-mono"
              style={{ background: 'var(--s3)', border: '1px solid var(--b2)', color: 'var(--t1)' }}
            />
          </Field>
          <Field label="Channel Name" hint="Display label only, e.g. #am-reports">
            <input
              value={channelName}
              onChange={e => setChannelName(e.target.value)}
              placeholder="#am-reports"
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: 'var(--s3)', border: '1px solid var(--b2)', color: 'var(--t1)' }}
            />
          </Field>
        </div>

        <button
          onClick={handleTest}
          disabled={testing || !webhookUrl}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: 'var(--s4)', border: '1px solid var(--b3)', color: 'var(--t2)' }}
        >
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {testing ? 'Sending test…' : 'Test Connection'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
          <Check className="w-4 h-4 shrink-0" />{success}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
        style={{ background: 'var(--yellow)', color: '#000' }}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--t3)' }}>{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs" style={{ color: 'var(--t4)' }}>{hint}</p>}
    </div>
  )
}
