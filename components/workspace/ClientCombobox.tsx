'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { mockClients, RestaurantClient } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';

const statusColors: Record<RestaurantClient['status'], string> = {
    active: 'text-emerald-400',
    paused: 'text-yellow-400',
    pending: 'text-neutral-500',
};

export function ClientCombobox() {
    const [open, setOpen] = useState(false);
    const { selectedClient, setSelectedClient } = useApp();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-[#0f0f0f] border-neutral-800 text-neutral-300 hover:bg-[#1a1a1a] hover:text-white hover:border-neutral-700 transition-all"
                >
                    <span className="truncate">
                        {selectedClient ? selectedClient.name : 'Select client…'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0 bg-[#0f0f0f] border-neutral-800">
                <Command className="bg-transparent">
                    <CommandInput
                        placeholder="Search clients…"
                        className="text-neutral-300 placeholder:text-neutral-600 border-b border-neutral-800"
                    />
                    <CommandList>
                        <CommandEmpty className="py-4 text-center text-sm text-neutral-500">
                            No clients found.
                        </CommandEmpty>
                        <CommandGroup>
                            {mockClients.map((client) => (
                                <CommandItem
                                    key={client.id}
                                    value={client.name}
                                    onSelect={() => {
                                        setSelectedClient(
                                            selectedClient?.id === client.id ? null : client
                                        );
                                        setOpen(false);
                                    }}
                                    className="flex items-center gap-2 text-neutral-300 hover:bg-neutral-800 aria-selected:bg-neutral-800 cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            'h-3.5 w-3.5',
                                            selectedClient?.id === client.id ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    <Circle
                                        className={cn('h-2 w-2 fill-current', statusColors[client.status])}
                                    />
                                    <span className="truncate">{client.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
