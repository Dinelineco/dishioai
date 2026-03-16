'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Loader2, Users, Check, AlertCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'

interface Group { id: string; name: string; client_ids: string[] }

export function GroupsTab() {
  const { clients } = useApp()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // New group form
  const [newName, setNewName] = useState('')
  const [newClientIds, setNewClientIds] = useState<string[]>([])
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const res = await fetch('/api/client-groups')
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed to load groups'); setLoading(false); return }
    setGroups(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function toggleClient(id: string) {
    setNewClientIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  async function handleCreate() {
    if (!newName.trim()) { setCreateError('Enter a group name.'); return }
    if (newClientIds.length === 0) { setCreateError('Select at least one client.'); return }
    setCreating(true); setCreateError('')
    const res = await fetch('/api/client-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), client_ids: newClientIds }),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) { setCreateError(data.error || 'Failed to create group'); return }
    setGroups(prev => [...prev, data])
    setNewName(''); setNewClientIds([])
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await fetch(`/api/client-groups/${id}`, { method: 'DELETE' })
    setGroups(prev => prev.filter(g => g.id !== id))
    setDeletingId(null)
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--t3)' }} /></div>

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--t1)' }}>Client Groups</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--t3)' }}>Group clients together to run report bundles across them.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Existing groups */}
      {groups.length > 0 && (
        <div className="space-y-2">
          {groups.map(group => {
            const groupClients = clients.filter(c => group.client_ids.includes(c.id))
            return (
              <div
                key={group.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'var(--s2)', border: '1px solid var(--b2)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--s4)', border: '1px solid var(--b3)' }}>
                  <Users className="w-4 h-4" style={{ color: 'var(--yellow)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--t1)' }}>{group.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--t3)' }}>
                    {groupClients.length > 0
                      ? groupClients.map(c => c.name).join(', ')
                      : `${group.client_ids.length} client${group.client_ids.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: 'var(--s4)', color: 'var(--t3)' }}>
                  {group.client_ids.length} client{group.client_ids.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => handleDelete(group.id)}
                  disabled={deletingId === group.id}
                  className="p-1.5 rounded-lg transition-colors shrink-0"
                  style={{ color: 'var(--t4)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f87171'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--t4)'}
                >
                  {deletingId === group.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Create new group */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--s2)', border: '1px solid var(--b2)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--t3)' }}>
          <Plus className="w-3 h-3" /> New Group
        </p>

        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="e.g. My Priority Accounts"
          className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
          style={{ background: 'var(--s3)', border: '1px solid var(--b2)', color: 'var(--t1)' }}
        />

        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--t3)' }}>Select clients ({newClientIds.length} selected)</p>
          <div className="max-h-52 overflow-y-auto rounded-xl divide-y" style={{ border: '1px solid var(--b2)', background: 'var(--s3)' }}>
            {clients.map(client => (
              <label key={client.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-[var(--s4)]">
                <div
                  className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    background: newClientIds.includes(client.id) ? 'var(--yellow)' : 'var(--s4)',
                    border: newClientIds.includes(client.id) ? 'none' : '1px solid var(--b3)',
                  }}
                  onClick={() => toggleClient(client.id)}
                >
                  {newClientIds.includes(client.id) && <Check className="w-2.5 h-2.5" style={{ color: '#000' }} />}
                </div>
                <span className="text-sm flex-1" style={{ color: 'var(--t2)' }}>{client.name}</span>
                {client.clientCode && <span className="text-xs" style={{ color: 'var(--t4)' }}>{client.clientCode}</span>}
              </label>
            ))}
          </div>
        </div>

        {createError && (
          <p className="text-xs" style={{ color: '#f87171' }}>{createError}</p>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: 'var(--yellow)', color: '#000' }}
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {creating ? 'Creating…' : 'Create Group'}
        </button>
      </div>
    </div>
  )
}
