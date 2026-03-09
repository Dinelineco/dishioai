'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'viewer';
  is_active: boolean;
}

export interface RestaurantClient {
  id: string;
  clientCode: string;      // = client_name from DB (D-number), used in n8n calls
  name: string;
  logo_url?: string | null;
  status: 'active' | 'inactive' | 'paused' | 'pending';
  strategySummary?: string;
}

interface AppContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isManager: boolean;
  authLoading: boolean;
  signOut: () => Promise<void>;
  selectedClient: RestaurantClient | null;
  setSelectedClient: (client: RestaurantClient | null) => void;
  clients: RestaurantClient[];
  clientsLoading: boolean;
  refreshClients: () => Promise<void>;
  amId: string;
  setAmId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<RestaurantClient | null>(null);
  const [clients, setClients] = useState<RestaurantClient[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const supabase = createClient();

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'admin' || profile?.role === 'manager';
  const amId = user?.id ?? '';
  const setAmId = (_id: string) => {};

  const fetchClients = useCallback(async (userId: string, role: string) => {
    setClientsLoading(true);
    try {
      let rows: RestaurantClient[] = [];
      if (role === 'admin') {
        const { data } = await supabase.from('clients').select('id, name, client_name, logo_url, status').eq('status', 'active').order('name');
        rows = (data ?? []).map((r: any) => ({ id: r.id, clientCode: r.client_name, name: r.name, logo_url: r.logo_url, status: r.status }));
      } else {
        const { data } = await supabase.from('user_client_assignments').select('clients(id, name, client_name, logo_url, status)').eq('user_id', userId);
        rows = (data ?? []).map((r: any) => r.clients).filter(Boolean).map((c: any) => ({ id: c.id, clientCode: c.client_name, name: c.name, logo_url: c.logo_url, status: c.status }));
      }
      setClients(rows);
      if (rows.length > 0) setSelectedClient(prev => prev ?? rows[0]);
    } finally {
      setClientsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshClients = useCallback(async () => {
    if (user && profile) await fetchClients(user.id, profile.role);
  }, [user, profile, fetchClients]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (u) {
        setUser(u);
        const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single();
        if (p) { setProfile(p); await fetchClients(u.id, p.role); }
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (p) { setProfile(p); await fetchClients(session.user.id, p.role); }
      } else {
        setUser(null); setProfile(null); setClients([]); setSelectedClient(null);
      }
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, [supabase]);

  return (
    <AppContext.Provider value={{ user, profile, isAdmin, isManager, authLoading, signOut, selectedClient, setSelectedClient, clients, clientsLoading, refreshClients, amId, setAmId }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
