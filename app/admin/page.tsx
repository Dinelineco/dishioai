'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, UserPlus, Check, Loader2, AlertCircle } from 'lucide-react';
type Tab = 'restaurant' | 'user';
export default function AdminPage() {
  const { user, isAdmin, authLoading, clients, refreshClients } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('restaurant');
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace('/workspace');
    }
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
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {activeTab === 'restaurant' ? <AddRestaurantForm refreshClients={refreshClients} /> : <InviteUserForm clients={clients} />}
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
function InviteUserForm({ clients }: { clients: any[] }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', fullName: '', role: 'viewer', clientIds: [] as string[] });
  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleClient = (id: string) => setForm(prev => ({ ...prev, clientIds: prev.clientIds.includes(id) ? prev.clientIds.filter(c => c !== id) : [...prev.clientIds, id] }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess(false);
    try {
      const res = await fetch('/api/admin/users/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite user');
      setSuccess(true);
      setForm({ email: '', fullName: '', role: 'viewer', clientIds: [] });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div><h2 className="text-base font-semibold text-neutral-200 mb-1">Invite User</h2><p className="text-sm text-neutral-500">Send an invite email with role and client assignments.</p></div>
      <FormField label="Email Address *" value={form.email} onChange={v => update('email', v)} placeholder="user@restaurant.com" type="email" required />
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
      <StatusMessage success={success} error={error} successText="Invite sent successfully!" />
      <button type="submit" disabled={loading || !form.email} className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}{loading ? 'Sending Invite...' : 'Send Invite'}
      </button>
    </form>
  );
}
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