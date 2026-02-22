'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RestaurantClient } from '@/lib/mockData';

interface AppContextType {
    amId: string;
    setAmId: (id: string) => void;
    selectedClient: RestaurantClient | null;
    setSelectedClient: (client: RestaurantClient | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [amId, setAmId] = useState<string>('');
    const [selectedClient, setSelectedClient] = useState<RestaurantClient | null>(null);

    return (
        <AppContext.Provider value={{ amId, setAmId, selectedClient, setSelectedClient }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
