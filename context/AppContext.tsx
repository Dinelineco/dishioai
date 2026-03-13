'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
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
  clientCode: string;
  name: string;
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

  // Single stable Supabase client — created once, used everywhere
  const supabaseRef = useRef<SupabaseClient | null>(null);
  if (!supabaseRef.current) {
    supabaseRef.current = createClient();
  }
  const supabase = supabaseRef.current;

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'admin' || profile?.role === 'manager';
  const amId = user?.id ?? '';
  const setAmId = (_id: string) => {};

  const fetchClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      // Query directly from browser client — no server-side getSession() lock conflict
      const { data, error } = await supabase
        .from('clients')
        .select('id, uuid, name, client_code')
        .order('name');
      if (error) {
        console.error('fetchClients error:', error.message);
        return;
      }
      const mapped: RestaurantClient[] = (data ?? []).map((c: any) => ({
        id: c.uuid ?? String(c.id),
        clientCode: c.client_code ?? '',
        name: c.name,
      }));
      setClients(mapped);
      if (mapped.length > 0) setSelectedClient(prev => prev ?? mapped[0]);
    } catch (err) {
      console.error('fetchClients error:', err);
    } finally {
      setClientsLoading(false);
    }
  }, [supabase]);

  const refreshClients = useCallback(() => fetchClients(), [fetchClients]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  useEffect(() => {
    const loadUserData = async (u: User) => {
      setUser(u);
      try {
        // Use service-role-backed API route to bypass RLS on profiles table
        const res = await fetch('/api/profile');
        if (res.ok) {
          const p: Profile = await res.json();
          setProfile(p);
        } else {
          // Fallback: synthesise profile from auth user
          setProfile({
            id: u.id,
            email: u.email ?? '',
            full_name: (u.user_metadata?.full_name as string) ?? null,
            role: 'viewer',
            is_active: true,
          });
        }
      } catch (err) {
        console.error('loadUserData error:', err);
        setProfile({
          id: u.id,
          email: u.email ?? '',
          full_name: null,
          role: 'viewer',
          is_active: true,
        });
      }
      // Always fetch clients
      await fetchClients();
    };

    // onAuthStateChange fires INITIAL_SESSION immediately on subscribe
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (
            event === 'INITIAL_SESSION' ||
            event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED'
          ) {
            if (session?.user) {
              await loadUserData(session.user);
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setClients([]);
            setSelectedClient(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
        } finally {
          setAuthLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, fetchClients]);

  return (
    <AppContext.Provider value={{
      user, profile, isAdmin, isManager, authLoading, signOut,
      selectedClient, setSelectedClient, clients, clientsLoading,
      refreshClients, amId, setAmId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
