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

  // Supabase client ref — initialized lazily inside useEffect (client-side only)
  const supabaseRef = useRef<SupabaseClient | null>(null);

  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'admin' || profile?.role === 'manager';
  const amId = user?.id ?? '';
  const setAmId = (_id: string) => {};

  const fetchClients = useCallback(async (accessToken: string) => {
    setClientsLoading(true);
    try {
      const res = await fetch('/api/clients', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        console.error('fetchClients error:', res.status, await res.text());
        return;
      }
      const data: RestaurantClient[] = await res.json();
      setClients(data);
      if (data.length > 0) setSelectedClient(prev => prev ?? data[0]);
    } catch (err) {
      console.error('fetchClients error:', err);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  const [lastToken, setLastToken] = useState<string>('');
  const refreshClients = useCallback(async (): Promise<void> => {
    if (lastToken) await fetchClients(lastToken);
  }, [fetchClients, lastToken]);

  // signOut reads supabaseRef.current at call time — always up-to-date
  const signOut = useCallback(async () => {
    if (supabaseRef.current) await supabaseRef.current.auth.signOut();
  }, []);

  useEffect(() => {
    // Initialize Supabase browser client here — never runs server-side
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    const supabase = supabaseRef.current;

    const loadUserData = async (u: User, accessToken: string) => {
      setUser(u);
      setLastToken(accessToken);
      try {
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (res.ok) {
          const p: Profile = await res.json();
          setProfile(p);
        } else {
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
      await fetchClients(accessToken);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (
            event === 'INITIAL_SESSION' ||
            event === 'SIGNED_IN' ||
            event === 'TOKEN_REFRESHED'
          ) {
            if (session?.user && session.access_token) {
              await loadUserData(session.user, session.access_token);
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
  }, [fetchClients]);

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
