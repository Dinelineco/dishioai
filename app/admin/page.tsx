'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, UserPlus, Check, Loader2, AlertCircle, Users, Trash2, RefreshCw, Clock, ShieldCheck, Mail } from 'lucide-react';

type Tab = 'restaurant' | 'user' | 'manage';

export default function AdminPage() {
  const { user, isAdmin, authLoading, clients, refreshClients } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('restaurant');
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.replace('/workspace');
  }, [user, isAdmin, authLoading, router]);
  if (authLoading || !user || !isAdmin) return null;
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="border-b border-neutral-800/60">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/workspace')} className="p-2 rounded-lg hover:bg-neutral-800/60 transition-colors">
            <ArrowLeft className="w-4 h-4 text-neutral-400" />
          </button>
          <h1 className="text-lg font-semibold">Admin Settings</h1>
        </div>
      </div>
      <div className="border-b border-neutral-800/40">
        <div className="max-w-3xl mx-auto px-6 flex gap-1">
          <TabButton active={activeTab === 'restaurant'} onClick={() => setActiveTab('restaurant')} icon={<Building2 className="w-4 h-4" />} label="Add Restaurant" />
          <TabButton active={activeTab === 'user'} onClick={() => setActiveTab('user')} icon={<UserPlus className="w-4 h-4" />} label="Invite User" />
          <TabButton active={activeTab === 'manage'} onClick={() => setActiveTab('manage')} icon={<Users className="w-4 h-4" />} label="Manage Users" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {activeTab === 'restaurant' && <AddRestaurantForm refreshClients={refreshClients} />}
        {activeTab === 'user' && <InviteUserForm clients={clients} onInvited={() => setActiveTab('manage')} />}
        {activeTab === 'manage' && <ManageUsersPanel currentUserId={user.id} />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${active ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>
      {icon}{label}
    </button>
  );
}

// ─── Manage Users Panel ────────────────────────────────────────────────────────
function ManageUsersPanel({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  async function removeUser(userId: string) {
    setActionId(userId);
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User removed.');
    } else {
      const d = await res.json();
      showToast(d.error || 'Failed to remove user.');
    }
    setActionId(null);
    setConfirmId(null);
  }

  async function resendInvite(u: any) {
    setActionId(u.id);
    const res = await fetch('/api/admin/users/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: u.email, role: u.role, fullName: u.full_name, resend: true, existingUserId: u.id }),
    });
    if (res.ok) {
      showToast('Invite resent to ' + u.email);
      await load();
    } else {
      const d = await res.json();
      showToast(d.error || 'Failed to resend invite.');
    }
    setActionId(null);
  }

  const pending = users.filter(u => !u.confirmed_at);
  const active = users.filter(u => u.confirmed_at);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-200">Manage Users</h2>
          <p className="text-sm text-neutral-500 mt-0.5">{users.length} total · {pending.length} pending invite</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg hover:bg-neutral-800/60 transition-colors text-neutral-500 hover:text-neutral-300">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-neutral-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />{toast}
        </div>
      )}

      {/* Pending invites */}
      {pending.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-widest flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Pending Invites
          </p>
          <div className="rounded-xl border border-neutral-800 divide-y divide-neutral-800/60 overflow-hidden">
            {pending.map(u => (
              <UserRow
                key={u.id}
                user={u}
                isCurrent={u.id === currentUserId}
                isPending
                isActing={actionId === u.id}
                confirmId={confirmId}
                onConfirm={setConfirmId}
                onRemove={removeUser}
                onResend={resendInvite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active users */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-neutral-600 uppercase tracking-widest flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3" /> Active Users
        </p>
        {active.length === 0 ? (
          <p className="text-sm text-neutral-600 py-4">No active users yet.</p>
        ) : (
          <div className="rounded-xl border border-neutral-800 divide-y divide-neutral-800/60 overflow-hidden">
            {active.map(u => (
              <UserRow
                key={u.id}
                user={u}
                isCurrent={u.id === currentUserId}
                isPending={false}
                isActing={actionId === u.id}
                confirmId={confirmId}
                onConfirm={setConfirmId}
                onRemove={removeUser}
                onResend={resendInvite}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function UserRow({ user, isCurrent, isPending, isActing, confirmId, onConfirm, onRemove, onResend }: {
  user: any; isCurrent: boolean; isPending: boolean; isActing: boolean;
  confirmId: string | null; onConfirm: (id: string | null) => void;
  onRemove: (id: string) => void; onResend: (u: any) => void;
}) {
  const isConfirming = confirmId === user.id;
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900 hover:bg-neutral-800/40 transition-colors">
      <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 text-xs font-semibold text-neutral-400">
        {(user.full_name || user.email || '?')[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-neutral-200 truncate">{user.full_name || <span className="text-neutral-500 italic">No name</span>}</p>
          {isCurrent && <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5 font-medium">You</span>}
        </div>
        <p className="text-xs text-neutral-500 truncate flex items-center gap-1">
          <Mail className="w-3 h-3 shrink-0" />{user.email}
        </p>
      </div>
      <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 border capitalize shrink-0 ${
        user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
        user.role === 'manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
        'bg-neutral-800 text-neutral-400 border-neutral-700'
      }`}>{user.role}</span>

      {/* Actions */}
      {!isCurrent && (
        <div className="flex items-center gap-1.5 shrink-0">
          {isPending && (
            <button
              onClick={() => onResend(user)}
              disabled={isActing}
              title="Resend invite"
              className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-40"
            >
              {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            </button>
          )}
          {isConfirming ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-neutral-500">Remove?</span>
              <button onClick={() => onRemove(user.id)} disabled={isActing} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded transition-colors disabled:opacity-40">
                {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
              </button>
              <button onClick={() => onConfirm(null)} className="text-xs text-neutral-500 hover:text-neutral-300 px-2 py-1 rounded transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => onConfirm(user.id)}
              title="Remove user"
              className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Restaurant Form ───────────────────────────────────────────────────────
function AddRestaurantForm({ refreshClients }: { refreshClients: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', client_code: '', am_id: '', google_ads_id: '', meta_ads_id: '', toast_location_id: '', logo_url: '', status: 'active' });
  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess(false);
    try {
      const res = await fetch('/api/admin/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create restaurant');
      setSuccess(true);
      setForm({ name: '', client_code: '', am_id: '', google_ads_id: '', meta_ads_id: '', toast_location_id: '', logo_url: '', status: 'active' });
      await refreshClients();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div><h2 className="text-base font-semibold text-neutral-200 mb-1">Add Restaurant Account</h2><p className="text-sm text-neutral-500">Create a new restaurant client. Fields match your existing data pipeline.</p></div>
      <FormField label="Restaurant Name *" value={form.name} onChange={v => update('name', v)} placeholder="e.g. Taco Bell #1234" required />
      <FormField label="Client Code" value={form.client_code} onChange={v => update('client_code', v)} placeholder="e.g. D-013" hint="Used for n8n webhook calls" />
      <FormField label="Account Manager ID" value={form.am_id} onChange={v => update('am_id', v)} placeholder="AM identifier" />
      <div className="border-t border-neutral-800/40 pt-6">
        <p className="text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-4">Integrations</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Google Ads ID" value={form.google_ads_id} onChange={v => update('google_ads_id', v)} placeholder="e.g. 123-456-7890" />
          <FormField label="Meta Ads ID" value={form.meta_ads_id} onChange={v => update('meta_ads_id', v)} placeholder="e.g. act_1234567" />
          <FormField label="Toast Location ID" value={form.toast_location_id} onChange={v => update('toast_location_id', v)} placeholder="Toast GUID" />
          <FormField label="Logo URL" value={form.logo_url} onChange={v => update('logo_url', v)} placeholder="https://..." />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-400 mb-1.5">Status</label>
        <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50">
          <option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
      </div>
      <StatusMessage success={success} error={error} successText="Restaurant created successfully!" />
      <button type="submit" disabled={loading || !form.name} className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}{loading ? 'Creating...' : 'Add Restaurant'}
      </button>
    </form>
  );
}

// ─── Invite User Form ──────────────────────────────────────────────────────────
function InviteUserForm({ clients, onInvited }: { clients: any[]; onInvited: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', fullName: '', role: 'viewer', clientIds: [] as string[] });
  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleClient = (id: string) => setForm(prev => ({ ...prev, clientIds: prev.clientIds.includes(id) ? prev.clientIds.filter(c => c !== id) : [...prev.clientIds, id] }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess(false);
    const emailDomain = form.email.split('@')[1]?.toLowerCase();
    if (!emailDomain || !['dineline.co', 'dish.io'].includes(emailDomain)) {
      setError('Only @dineline.co and @dish.io email addresses can be invited.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/users/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite user');
      setSuccess(true);
      setForm({ email: '', fullName: '', role: 'viewer', clientIds: [] });
      setTimeout(() => { setSuccess(false); onInvited(); }, 1500);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div><h2 className="text-base font-semibold text-neutral-200 mb-1">Invite User</h2><p className="text-sm text-neutral-500">Send an invite email with role and client assignments.</p></div>
      <FormField label="Email Address *" value={form.email} onChange={v => update('email', v)} placeholder="name@dineline.co or name@dish.io" type="email" required hint="Only @dineline.co and @dish.io addresses are allowed." />
      <FormField label="Full Name" value={form.fullName} onChange={v => update('fullName', v)} placeholder="Jane Smith" />
      <div>
        <label className="block text-sm font-medium text-neutral-400 mb-1.5">Role *</label>
        <div className="grid grid-cols-3 gap-2">
          {(['admin', 'manager', 'viewer'] as const).map(role => (
            <button key={role} type="button" onClick={() => update('role', role)} className={`rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-colors ${form.role === role ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'}`}>{role}</button>
          ))}
        </div>
        <div className="mt-2 text-xs text-neutral-600">
          {form.role === 'admin' && 'Full access to all clients, settings, and user management.'}
          {form.role === 'manager' && 'Can edit assigned clients, integrations, and revenue data.'}
          {form.role === 'viewer' && 'Read-only access to assigned clients.'}
        </div>
      </div>
      {form.role !== 'admin' && clients.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Assign to Restaurants</label>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900 divide-y divide-neutral-800/60">
            {clients.map(client => (
              <label key={client.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-800/40 cursor-pointer transition-colors">
                <input type="checkbox" checked={form.clientIds.includes(client.id)} onChange={() => toggleClient(client.id)} className="rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-amber-500/30" />
                <span className="text-sm text-neutral-300">{client.name}</span>
                {client.clientCode && <span className="text-xs text-neutral-600 ml-auto">{client.clientCode}</span>}
              </label>
            ))}
          </div>
        </div>
      )}
      <StatusMessage success={success} error={error} successText="Invite sent! Redirecting to users…" />
      <button type="submit" disabled={loading || !form.email} className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}{loading ? 'Sending Invite...' : 'Send Invite'}
      </button>
    </form>
  );
}

// ─── Shared components ─────────────────────────────────────────────────────────
function FormField({ label, value, onChange, placeholder, hint, type = 'text', required = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-400 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50" />
      {hint && <p className="mt-1 text-xs text-neutral-600">{hint}</p>}
    </div>
  );
}
function StatusMessage({ success, error, successText }: { success: boolean; error: string; successText: string }) {
  if (success) return <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400"><Check className="w-4 h-4" />{successText}</div>;
  if (error) return <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"><AlertCircle className="w-4 h-4" />{error}</div>;
  return null;
}
