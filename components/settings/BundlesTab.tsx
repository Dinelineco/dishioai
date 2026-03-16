'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Loader2, Send, Clock, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { PRESET_REGISTRY } from '@/lib/reportSender'

const PRESET_KEYS = Object.keys(PRESET_REGISTRY)

const DAYS = [
  { value: 'daily', label: 'Every Day' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

const TIMES = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6 // 6am–10pm
  const h = hour.toString().padStart(2, '0')
  return [{ value: `${h}:00`, label: `${hour <= 12 ? hour : hour - 12}:00 ${hour < 12 ? 'AM' : 'PM'}` },
    { value: `${h}:30`, label: `${hour <= 12 ? hour : hour - 12}:30 ${hour < 12 ? 'AM' : 'PM'}` }]
}).flat()

interface Group { id: string; name: string }
interface Bundle {
  id: string; name: string; group_id: string | null; group_name: string | null
  preset_keys: string[]; schedule_enabled: boolean; schedule_day: string | null
  schedule_time: string | null; last_sent_at: string | null
}

export function BundlesTab() {
  const [groups, setGroups] = useState<Group[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sendResult, setSendResult] = useState<{ id: string; msg: string; ok: boolean } | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Create form state
  const [form, setForm] = useState({
    name: '', group_id: '', preset_keys: [] as string[],
    schedule_enabled: false, schedule_day: 'monday', schedule_time: '09:00',
  })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const [groupsRes, bundlesRes] = await Promise.all([
      fetch('/api/client-groups'),
      fetch('/api/report-bundles'),
    ])
    const [groupsData, bundlesData] = await Promise.all([groupsRes.json(), bundlesRes.json()])
    setGroups(Array.isArray(groupsData) ? groupsData : [])
    setBundles(Array.isArray(bundlesData) ? bundlesData : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function togglePreset(key: string) {
    setForm(prev => ({
      ...prev,
      preset_keys: prev.preset_keys.includes(key)
        ? prev.preset_keys.filter(k => k !== key)
        : [...prev.preset_keys, key],
    }))
  }

  async function handleCreate() {
    if (!form.name.trim()) { setCreateError('Enter a bundle name.'); return }
    if (!form.group_id) { setCreateError('Select a client group.'); return }
    if (form.preset_keys.length === 0) { setCreateError('Select at least one report preset.'); return }
    setCreating(true); setCreateError('')
    const res = await fetch('/api/report-bundles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        group_id: form.group_id,
        preset_keys: form.preset_keys,
        schedule_enabled: form.schedule_enabled,
        schedule_day: form.schedule_enabled ? form.schedule_day : null,
        schedule_time: form.schedule_enabled ? form.schedule_time : null,
      }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setCreateError(data.error || 'Failed to create bundle'); return }
    setForm({ name: '', group_id: '', preset_keys: [], schedule_enabled: false, schedule_day: 'monday', schedule_time: '09:00' })
    setShowCreate(false)
    await load()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await fetch(`/api/report-bundles/${id}`, { method: 'DELETE' })
    setBundles(prev => prev.filter(b => b.id !== id))
    setDeletingId(null)
  }

  async function handleSend(bundle: Bundle) {
    setSendingId(bundle.id); setSendResult(null)
    const res = await fetch(`/api/report-bundles/${bundle.id}/send`, { method: 'POST' })
    const data = await res.json()
    setSendingId(null)
    if (res.ok) {
      setSendResult({ id: bundle.id, msg: `Sent to ${data.clientCount} client${data.clientCount !== 1 ? 's' : ''} (${data.presetCount} report${data.presetCount !== 1 ? 's' : ''} each)`, ok: true })
      setBundles(prev => prev.map(b => b.id === bundle.id ? { ...b, last_sent_at: new Date().toISOString() } : b))
    } else {
      setSendResult({ id: bundle.id, msg: data.error || 'Send failed', ok: false })
    }
    setTimeout(() => setSendResult(null), 6000)
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--t3)' }} /></div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--t1)' }}>Report Bundles</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--t3)' }}>Run selected AI reports for a group of clients and send to Slack.</p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'var(--s3)', border: '1px solid var(--b2)', color: 'var(--t2)' }}
        >
          <Plus className="w-4 h-4" /> New Bundle
          {showCreate ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl p-5 space-y-5" style={{ background: 'var(--s2)', border: '1px solid var(--b2)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--t3)' }}>New Bundle</p>

          <InputField label="Bundle Name">
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Weekly AM Report" className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: 'var(--s3)', border: '1px solid var(--b2)', color: 'var(--t1)' }} />
          </InputField>

          <InputField label="Client Group">
            {groups.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--t4)' }}>No groups yet — create one in the Client Groups tab first.</p>
            ) : (
              <select value={form.group_id} onChange={e => setForm(p => ({ ...p, group_id: e.target.value }))}
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                style={{ background: 'var(--s3)', border: '1px solid var(--b2)', color: form.group_id ? 'var(--t1)' : 'var(--t4)' }}>
                <option value="">Select a group…</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            )}
          </InputField>

          <InputField label={`Report Presets (${form.preset_keys.length} selected)`}>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_KEYS.map(key => {
                const selected = form.preset_keys.includes(key)
                return (
                  <button key={key} type="button" onClick={() => togglePreset(key)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition-all"
                    style={{
                      background: selected ? 'rgba(255,217,0,0.1)' : 'var(--s3)',
                      border: selected ? '1px solid rgba(255,217,0,0.3)' : '1px solid var(--b2)',
                      color: selected ? 'var(--yellow)' : 'var(--t2)',
                    }}>
                    {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    {PRESET_REGISTRY[key].label}
                  </button>
                )
              })}
            </div>
          </InputField>

          <InputField label="Schedule">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setForm(p => ({ ...p, schedule_enabled: !p.schedule_enabled }))}
                className="relative w-9 h-5 rounded-full transition-colors cursor-pointer"
                style={{ background: form.schedule_enabled ? 'var(--yellow)' : 'var(--s4)', border: '1px solid var(--b3)' }}
              >
                <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
                  style={{ background: '#fff', left: form.schedule_enabled ? '17px' : '2px' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--t2)' }}>
                {form.schedule_enabled ? 'Scheduled' : 'Manual only'}
              </span>
            </label>
            {form.schedule_enabled && (
              <div className="flex gap-3 mt-3">
                <select value={form.schedule_day} onChange={e => setForm(p => ({ ...p, schedule_day: e.target.value }))}
                  className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  style={{ background: 'var(--s3)', border: '1px solid var(--b2)', color: 'var(--t1)' }}>
                  {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <select value={form.schedule_time} onChange={e => setForm(p => ({ ...p, schedule_time: e.target.value }))}
                  className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  style={{ background: 'var(--s3)', border: '1px solid var(--b2)', color: 'var(--t1)' }}>
                  {TIMES.map(t => <option key={t.value} value={t.value}>{t.label} UTC</option>)}
                </select>
              </div>
            )}
          </InputField>

          {createError && <p className="text-xs" style={{ color: '#f87171' }}>{createError}</p>}

          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={creating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: 'var(--yellow)', color: '#000' }}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {creating ? 'Creating…' : 'Create Bundle'}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm transition-all"
              style={{ background: 'var(--s3)', color: 'var(--t3)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bundle list */}
      {bundles.length === 0 && !showCreate ? (
        <div className="text-center py-12" style={{ color: 'var(--t4)' }}>
          <Send className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No report bundles yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bundles.map(bundle => (
            <div key={bundle.id} className="rounded-xl p-4" style={{ background: 'var(--s2)', border: '1px solid var(--b2)' }}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium" style={{ color: 'var(--t1)' }}>{bundle.name}</p>
                    {bundle.schedule_enabled && bundle.schedule_day && (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(255,217,0,0.1)', border: '1px solid rgba(255,217,0,0.2)', color: 'var(--yellow)' }}>
                        <Clock className="w-2.5 h-2.5" />
                        {DAYS.find(d => d.value === bundle.schedule_day)?.label} {bundle.schedule_time} UTC
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs" style={{ color: 'var(--t3)' }}>
                      {bundle.group_name ?? 'No group'} · {bundle.preset_keys.length} preset{bundle.preset_keys.length !== 1 ? 's' : ''}
                    </span>
                    {bundle.last_sent_at && (
                      <span className="text-xs" style={{ color: 'var(--t4)' }}>
                        Last sent {new Date(bundle.last_sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bundle.preset_keys.map(k => (
                      <span key={k} className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--s3)', color: 'var(--t3)', border: '1px solid var(--b2)' }}>
                        {PRESET_REGISTRY[k]?.label ?? k}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleSend(bundle)}
                    disabled={sendingId === bundle.id}
                    title="Send Now"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
                    style={{ background: 'var(--s3)', border: '1px solid var(--b2)', color: 'var(--t2)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,217,0,0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--yellow)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b2)'; (e.currentTarget as HTMLElement).style.color = 'var(--t2)' }}
                  >
                    {sendingId === bundle.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {sendingId === bundle.id ? 'Sending…' : 'Send Now'}
                  </button>
                  <button
                    onClick={() => handleDelete(bundle.id)}
                    disabled={deletingId === bundle.id}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--t4)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f87171'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--t4)'}
                  >
                    {deletingId === bundle.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {sendResult?.id === bundle.id && (
                <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${sendResult.ok ? 'text-green-400' : 'text-red-400'}`}
                  style={{ background: sendResult.ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${sendResult.ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  {sendResult.ok ? <Check className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                  {sendResult.msg}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--t3)' }}>{label}</label>
      {children}
    </div>
  )
}
