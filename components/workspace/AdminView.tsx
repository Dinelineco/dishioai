'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import {
    Building2, UserPlus, Check, Loader2, AlertCircle,
    Users, List, RefreshCw, Shield, Eye, Briefcase, Pencil, X, Trash2,
} from 'lucide-react';

type Tab = 'restaurant' | 'user' | 'clients' | 'team';

interface AdminClient {
    id: string;
    name: string;
    client_code: string | null;
    am_id: string | null;
    google_ads_id: string | null;
    meta_ads_id: string | null;
    toast_location_id: string | null;
    drive_folder_id: string | null;
    created_at: string;
}

interface TeamMember {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    is_active: boolean;
    confirmed_at: string | null;
    created_at: string;
}

export function AdminView() {
    const { user, isAdmin, refreshClients } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>('restaurant');

    if (!user || !isAdmin) return null;

    return (
        <div className="min-h-full text-white">
            {/* Header */}
            <div className="border-b border-neutral-800/60 px-6 py-4">
                <h1 className="text-sm font-semibold text-white">Admin Settings</h1>
                <p className="text-[11px] text-neutral-500 mt-0.5">Manage restaurants and team members</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-neutral-800/40 px-6 flex gap-1 overflow-x-auto">
                <TabButton
                    active={activeTab === 'restaurant'}
                    onClick={() => setActiveTab('restaurant')}
                    icon={<Building2 className="w-3.5 h-3.5" />}
                    label="Add Restaurant"
                />
                <TabButton
                    active={activeTab === 'user'}
                    onClick={() => setActiveTab('user')}
                    icon={<UserPlus className="w-3.5 h-3.5" />}
                    label="Invite User"
                />
                <TabButton
                    active={activeTab === 'clients'}
                    onClick={() => setActiveTab('clients')}
                    icon={<List className="w-3.5 h-3.5" />}
                    label="All Clients"
                />
                <TabButton
                    active={activeTab === 'team'}
                    onClick={() => setActiveTab('team')}
                    icon={<Users className="w-3.5 h-3.5" />}
                    label="Team"
                />
            </div>

            {/* Content */}
            <div className={activeTab === 'clients' || activeTab === 'team' ? 'px-6 py-6' : 'max-w-xl px-6 py-8'}>
                {activeTab === 'restaurant' && <AddRestaurantForm refreshClients={refreshClients} />}
                {activeTab === 'user' && <InviteUserForm />}
                {activeTab === 'clients' && <ClientsList />}
                {activeTab === 'team' && <TeamList />}
            </div>
        </div>
    );
}

/* ─── Tab Button ─── */
function TabButton({ active, onClick, icon, label }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                active
                    ? 'border-dishio-yellow text-dishio-yellow'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

/* ─── Add Restaurant Form ─── */
function AddRestaurantForm({ refreshClients }: { refreshClients: () => Promise<void> }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        client_code: '',
        am_id: '',
        google_ads_id: '',
        meta_ads_id: '',
        toast_location_id: '',
        drive_folder_id: '',
    });

    const update = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            const res = await fetch('/api/admin/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create restaurant');
            setSuccess(true);
            setForm({ name: '', client_code: '', am_id: '', google_ads_id: '', meta_ads_id: '', toast_location_id: '', drive_folder_id: '' });
            await refreshClients();
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-sm font-semibold text-neutral-200 mb-1">Add Restaurant Account</h2>
                <p className="text-xs text-neutral-500">Create a new restaurant client. Fields match your data pipeline.</p>
            </div>

            <FormField label="Restaurant Name *" value={form.name} onChange={v => update('name', v)} placeholder="e.g. Taco Bell #1234" required />
            <FormField label="Client Code" value={form.client_code} onChange={v => update('client_code', v)} placeholder="e.g. D-013" hint="Used for n8n webhook calls" />
            <FormField label="Account Manager ID" value={form.am_id} onChange={v => update('am_id', v)} placeholder="AM user UUID" />

            <div className="border-t border-neutral-800/40 pt-6">
                <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-4">Integrations</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Google Ads ID" value={form.google_ads_id} onChange={v => update('google_ads_id', v)} placeholder="e.g. 123-456-7890" />
                    <FormField label="Meta Ads ID" value={form.meta_ads_id} onChange={v => update('meta_ads_id', v)} placeholder="e.g. act_1234567" />
                    <FormField label="Toast Location ID" value={form.toast_location_id} onChange={v => update('toast_location_id', v)} placeholder="Toast GUID" />
                    <FormField label="Drive Folder ID" value={form.drive_folder_id} onChange={v => update('drive_folder_id', v)} placeholder="Google Drive folder ID" />
                </div>
            </div>

            <StatusMessage success={success} error={error} successText="Restaurant created successfully!" />

            <button
                type="submit"
                disabled={loading || !form.name}
                className="w-full flex items-center justify-center gap-2 bg-dishio-yellow hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors shadow-[0_0_20px_-4px_rgba(255,217,0,0.3)]"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
                {loading ? 'Creating...' : 'Add Restaurant'}
            </button>
        </form>
    );
}

/* ─── Invite User Form ─── */
function InviteUserForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ email: '', fullName: '', role: 'viewer' });

    const update = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            const res = await fetch('/api/admin/users/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to invite user');
            setSuccess(true);
            setForm({ email: '', fullName: '', role: 'viewer' });
            setTimeout(() => setSuccess(false), 4000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-sm font-semibold text-neutral-200 mb-1">Invite Team Member</h2>
                <p className="text-xs text-neutral-500">Send an invite email to grant access to the platform.</p>
            </div>

            <FormField label="Email Address *" value={form.email} onChange={v => update('email', v)} placeholder="user@dineline.co" type="email" required />
            <FormField label="Full Name" value={form.fullName} onChange={v => update('fullName', v)} placeholder="Jane Smith" />

            <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Role *</label>
                <div className="grid grid-cols-3 gap-2">
                    {(['admin', 'manager', 'viewer'] as const).map(role => (
                        <button
                            key={role}
                            type="button"
                            onClick={() => update('role', role)}
                            className={`rounded-lg border px-3 py-2.5 text-xs font-medium capitalize transition-colors ${
                                form.role === role
                                    ? 'border-dishio-yellow/50 bg-dishio-yellow/10 text-dishio-yellow'
                                    : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300'
                            }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-[11px] text-neutral-600">
                    {form.role === 'admin' && 'Full access to all clients, settings, and user management.'}
                    {form.role === 'manager' && 'Can view and edit all client data and reporting.'}
                    {form.role === 'viewer' && 'Read-only access to client data.'}
                </p>
            </div>

            <StatusMessage success={success} error={error} successText="Invite sent! They'll receive an email shortly." />

            <button
                type="submit"
                disabled={loading || !form.email}
                className="w-full flex items-center justify-center gap-2 bg-dishio-yellow hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors shadow-[0_0_20px_-4px_rgba(255,217,0,0.3)]"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Sending Invite...' : 'Send Invite'}
            </button>
        </form>
    );
}

/* ─── Edit Client Modal ─── */
function EditClientModal({ client, onClose, onSaved }: {
    client: AdminClient;
    onClose: () => void;
    onSaved: (updated: AdminClient) => void;
}) {
    const [form, setForm] = useState({
        name: client.name ?? '',
        client_code: client.client_code ?? '',
        am_id: client.am_id ?? '',
        google_ads_id: client.google_ads_id ?? '',
        meta_ads_id: client.meta_ads_id ?? '',
        toast_location_id: client.toast_location_id ?? '',
        drive_folder_id: client.drive_folder_id ?? '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const update = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            const res = await fetch('/api/admin/clients', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: client.id, ...form }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save');
            setSuccess(true);
            onSaved(data.client);
            setTimeout(() => { setSuccess(false); onClose(); }, 1200);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 border-b border-neutral-800/60 sticky top-0 bg-neutral-950 z-10">
                    <div>
                        <h2 className="text-sm font-semibold text-white">Edit Client</h2>
                        <p className="text-[11px] text-neutral-500 mt-0.5 truncate max-w-xs">{client.name.trim()}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="p-6 space-y-5">
                    <FormField label="Restaurant Name *" value={form.name} onChange={v => update('name', v)} placeholder="e.g. Taco Bell #1234" required />
                    <FormField label="Client Code" value={form.client_code} onChange={v => update('client_code', v)} placeholder="e.g. D-013" hint="Used for n8n webhook calls and reports" />
                    <FormField label="Account Manager ID" value={form.am_id} onChange={v => update('am_id', v)} placeholder="AM user UUID" />

                    <div className="border-t border-neutral-800/40 pt-5">
                        <p className="text-[10px] font-semibold text-neutral-600 uppercase tracking-widest mb-4">Integrations</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Google Ads ID" value={form.google_ads_id} onChange={v => update('google_ads_id', v)} placeholder="e.g. 610-420-1368" />
                            <FormField label="Meta Ads ID" value={form.meta_ads_id} onChange={v => update('meta_ads_id', v)} placeholder="e.g. act_1234567" />
                            <FormField label="Toast Location ID" value={form.toast_location_id} onChange={v => update('toast_location_id', v)} placeholder="Toast GUID" />
                            <FormField label="Drive Folder ID" value={form.drive_folder_id} onChange={v => update('drive_folder_id', v)} placeholder="Google Drive folder ID" />
                        </div>
                    </div>

                    <StatusMessage success={success} error={error} successText="Saved!" />

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !form.name}
                            className="flex-1 flex items-center justify-center gap-2 bg-dishio-yellow hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {loading ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Clients List ─── */
function ClientsList() {
    const [clients, setClients] = useState<AdminClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState<AdminClient | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/clients');
            if (res.ok) setClients(await res.json());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSaved = (updated: AdminClient) => {
        setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    };

    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.client_code ?? '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {editing && (
                <EditClientModal
                    client={editing}
                    onClose={() => setEditing(null)}
                    onSaved={handleSaved}
                />
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-neutral-200">All Clients</h2>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{clients.length} restaurant{clients.length !== 1 ? 's' : ''} in the system</p>
                </div>
                <button
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 text-xs transition-colors"
                >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or client code…"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-dishio-yellow/30 focus:border-dishio-yellow/40 transition-colors"
            />

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
                </div>
            ) : (
                <div className="rounded-lg border border-neutral-800 overflow-hidden">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-neutral-800 bg-neutral-900/50">
                                <th className="text-left px-4 py-2.5 font-semibold text-neutral-500 uppercase tracking-wide text-[10px]">Name</th>
                                <th className="text-left px-4 py-2.5 font-semibold text-neutral-500 uppercase tracking-wide text-[10px]">Code</th>
                                <th className="text-left px-4 py-2.5 font-semibold text-neutral-500 uppercase tracking-wide text-[10px] hidden md:table-cell">Google Ads</th>
                                <th className="text-left px-4 py-2.5 font-semibold text-neutral-500 uppercase tracking-wide text-[10px] hidden md:table-cell">Meta Ads</th>
                                <th className="text-left px-4 py-2.5 font-semibold text-neutral-500 uppercase tracking-wide text-[10px] hidden lg:table-cell">Toast</th>
                                <th className="w-10" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-600">
                                        {search ? 'No clients match your search.' : 'No clients yet.'}
                                    </td>
                                </tr>
                            ) : filtered.map(c => (
                                <tr
                                    key={c.id}
                                    onClick={() => setEditing(c)}
                                    className="group hover:bg-neutral-900/60 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3 font-medium text-neutral-200 group-hover:text-white transition-colors">{c.name}</td>
                                    <td className="px-4 py-3">
                                        {c.client_code
                                            ? <span className="font-mono text-dishio-yellow/80 bg-dishio-yellow/5 border border-dishio-yellow/10 px-1.5 py-0.5 rounded text-[10px]">{c.client_code}</span>
                                            : <span className="text-neutral-700">—</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell font-mono text-[10px]">
                                        {c.google_ads_id
                                            ? <span className="text-emerald-500/70">{c.google_ads_id}</span>
                                            : <span className="text-neutral-700">—</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell font-mono text-[10px]">
                                        {c.meta_ads_id
                                            ? <span className="text-blue-400/70">{c.meta_ads_id}</span>
                                            : <span className="text-neutral-700">—</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell font-mono text-[10px]">
                                        {c.toast_location_id
                                            ? <span className="text-orange-400/70">{c.toast_location_id}</span>
                                            : <span className="text-neutral-700">—</span>
                                        }
                                    </td>
                                    <td className="px-3 py-3">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded bg-neutral-800 text-neutral-400">
                                            <Pencil className="w-3 h-3" />
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ─── Team List ─── */
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    admin: { label: 'Admin', color: 'text-dishio-yellow', bg: 'bg-dishio-yellow/10 border-dishio-yellow/20', icon: <Shield className="w-3 h-3" /> },
    manager: { label: 'Manager', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: <Briefcase className="w-3 h-3" /> },
    viewer: { label: 'Viewer', color: 'text-neutral-400', bg: 'bg-neutral-800 border-neutral-700', icon: <Eye className="w-3 h-3" /> },
};

function TeamList() {
    const { user: currentUser } = useApp();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [editRoleId, setEditRoleId] = useState<string | null>(null);
    const [toast, setToast] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast(msg); setToastType(type); setTimeout(() => setToast(''), 4000);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) setMembers(await res.json());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    async function removeUser(userId: string) {
        setActionId(userId);
        const res = await fetch('/api/admin/users', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });
        if (res.ok) {
            setMembers(prev => prev.filter(m => m.id !== userId));
            showToast('User removed.');
        } else {
            const d = await res.json();
            showToast(d.error || 'Failed to remove user.', 'error');
        }
        setActionId(null);
        setConfirmId(null);
    }

    async function changeRole(userId: string, role: string) {
        setActionId(userId);
        const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role }),
        });
        if (res.ok) {
            setMembers(prev => prev.map(m => m.id === userId ? { ...m, role } : m));
            showToast(`Role updated to ${role}.`);
        } else {
            const d = await res.json();
            showToast(d.error || 'Failed to update role.', 'error');
        }
        setActionId(null);
        setEditRoleId(null);
    }

    async function resendInvite(m: TeamMember) {
        setActionId(m.id);
        const res = await fetch('/api/admin/users/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: m.email, role: m.role, fullName: m.full_name, resend: true, existingUserId: m.id }),
        });
        if (res.ok) {
            showToast('Invite resent to ' + m.email);
            await load();
        } else {
            const d = await res.json();
            showToast(d.error || 'Failed to resend invite.', 'error');
        }
        setActionId(null);
    }

    const pending = members.filter(m => !m.confirmed_at);

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-neutral-200">Team Members</h2>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                        {members.length} user{members.length !== 1 ? 's' : ''} · {pending.length} pending
                    </p>
                </div>
                <button
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 text-xs transition-colors"
                >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {toast && (
                <div className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs ${toastType === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    {toastType === 'error' ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <Check className="w-3.5 h-3.5 shrink-0" />}
                    {toast}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
                </div>
            ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 opacity-40">
                    <Users className="w-6 h-6 text-neutral-600" />
                    <p className="text-xs text-neutral-600">No team members found.</p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {members.map(m => {
                        const cfg = ROLE_CONFIG[m.role] ?? ROLE_CONFIG.viewer;
                        const initials = m.full_name
                            ? m.full_name.trim().split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
                            : m.email.slice(0, 2).toUpperCase();
                        const isCurrent = m.id === currentUser?.id;
                        const isPending = !m.confirmed_at;
                        const isActing = actionId === m.id;
                        const isConfirming = confirmId === m.id;
                        const isEditingRole = editRoleId === m.id;

                        return (
                            <div key={m.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 transition-colors">
                                {/* Avatar */}
                                <div className="shrink-0 w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                                    <span className="text-[11px] font-bold text-neutral-300">{initials}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-medium text-neutral-200 truncate">
                                            {m.full_name || <span className="text-neutral-500 italic">No name set</span>}
                                        </p>
                                        {isCurrent && <span className="text-[9px] bg-dishio-yellow/10 text-dishio-yellow border border-dishio-yellow/20 rounded-full px-1.5 py-0.5 font-semibold shrink-0">You</span>}
                                        {isPending && <span className="text-[9px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-1.5 py-0.5 font-semibold shrink-0">Pending</span>}
                                    </div>
                                    <p className="text-[11px] text-neutral-500 truncate">{m.email}</p>
                                </div>

                                {/* Role — inline editor or badge */}
                                {isEditingRole ? (
                                    <div className="flex items-center gap-1 shrink-0">
                                        {(['admin', 'manager', 'viewer'] as const).map(r => (
                                            <button
                                                key={r}
                                                onClick={() => changeRole(m.id, r)}
                                                disabled={isActing}
                                                className={`text-[9px] font-semibold rounded-full px-2 py-0.5 border capitalize transition-colors disabled:opacity-40 ${
                                                    m.role === r
                                                        ? `${ROLE_CONFIG[r].color} ${ROLE_CONFIG[r].bg}`
                                                        : 'bg-neutral-800 text-neutral-500 border-neutral-700 hover:border-neutral-500'
                                                }`}
                                            >
                                                {isActing ? <Loader2 className="w-2.5 h-2.5 animate-spin inline" /> : r}
                                            </button>
                                        ))}
                                        <button onClick={() => setEditRoleId(null)} className="p-0.5 text-neutral-600 hover:text-neutral-400">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => !isCurrent && setEditRoleId(m.id)}
                                        disabled={isCurrent}
                                        title={isCurrent ? undefined : 'Edit role'}
                                        className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-semibold transition-colors ${cfg.color} ${cfg.bg} ${!isCurrent ? 'hover:opacity-70 cursor-pointer' : 'cursor-default'}`}
                                    >
                                        {cfg.icon}{cfg.label}
                                    </button>
                                )}

                                {/* Joined date */}
                                <span className="shrink-0 text-[10px] text-neutral-700 hidden lg:block">{formatDate(m.created_at)}</span>

                                {/* Actions */}
                                {!isCurrent && !isEditingRole && (
                                    <div className="flex items-center gap-1 shrink-0">
                                        {isPending && (
                                            <button
                                                onClick={() => resendInvite(m)}
                                                disabled={isActing}
                                                title="Resend invite"
                                                className="p-1.5 rounded-lg text-neutral-500 hover:text-dishio-yellow hover:bg-dishio-yellow/10 transition-colors disabled:opacity-40"
                                            >
                                                {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                                            </button>
                                        )}
                                        {!isPending && (
                                            <button
                                                onClick={() => setEditRoleId(m.id)}
                                                title="Edit role"
                                                className="p-1.5 rounded-lg text-neutral-600 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        {isConfirming ? (
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-neutral-500">Remove?</span>
                                                <button
                                                    onClick={() => removeUser(m.id)}
                                                    disabled={isActing}
                                                    className="text-[10px] text-red-400 hover:text-red-300 px-1.5 py-1 rounded transition-colors disabled:opacity-40"
                                                >
                                                    {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes'}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmId(null)}
                                                    className="text-[10px] text-neutral-500 hover:text-neutral-300 px-1.5 py-1 rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmId(m.id)}
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
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── Shared components ─── */
function FormField({ label, value, onChange, placeholder, hint, type = 'text', required = false }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; hint?: string; type?: string; required?: boolean;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-dishio-yellow/30 focus:border-dishio-yellow/40 transition-colors"
            />
            {hint && <p className="mt-1 text-[11px] text-neutral-600">{hint}</p>}
        </div>
    );
}

function StatusMessage({ success, error, successText }: { success: boolean; error: string; successText: string }) {
    if (success) return (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs text-emerald-400">
            <Check className="w-3.5 h-3.5 shrink-0" />
            {successText}
        </div>
    );
    if (error) return (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
        </div>
    );
    return null;
}
