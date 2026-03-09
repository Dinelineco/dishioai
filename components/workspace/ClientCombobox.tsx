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
import { useApp } from '@/context/AppContext';

export function ClientCombobox() {
  const [open, setOpen] = useState(false);
  const { clients, selectedClient, setSelectedClient, clientsLoading } = useApp();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-neutral-900 border-neutral-700 text-neutral-200 hover:bg-neutral-800 hover:text-white h-9 text-xs"
        >
          <span className="truncate">
            {clientsLoading
              ? 'Loading…'
              : selectedClient
                ? selectedClient.name
                : 'Select client'}
          </span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0 bg-neutral-900 border-neutral-700" align="start">
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search clients…"
            className="text-xs text-neutral-200 placeholder:text-neutral-600 border-neutral-700"
          />
          <CommandList>
            <CommandEmpty className="text-neutral-500 text-xs py-3 text-center">
              No clients found.
            </CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={() => {
                    setSelectedClient(client);
                    setOpen(false);
                  }}
                  className="text-xs text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-3 w-3',
                      selectedClient?.id === client.id ? 'opacity-100 text-yellow-400' : 'opacity-0'
                    )}
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{client.name}</span>
                    <span className="text-neutral-600 shrink-0">{client.clientCode}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
