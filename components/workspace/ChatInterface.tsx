'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useApp } from '@/context/AppContext';
import { ActionPresets } from './ActionPresets';
import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export function ChatInterface() {
    const { selectedClient, amId } = useApp();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { messages, status, sendMessage } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
            body: {
                client_uuid: selectedClient?.id ?? null,
                am_id: amId || 'am_default',
            },
        }),
    });

    const isLoading = status === 'streaming' || status === 'submitted';

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const submit = () => {
        const text = input.trim();
        if (!text || isLoading) return;
        sendMessage({ text: text });
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handlePresetSelect = (message: string) => {
        sendMessage({ text: message });
        setInput('');
    };

    const isEmpty = messages.length === 0;

    return (
        <div className="flex flex-col h-full">
            {/* Message thread */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                            <Bot className="w-7 h-7 text-dishio-yellow" />
                        </div>
                        <div>
                            <img
                                src="/images/DISHIO-LOGOTYPE-YELLOW.png"
                                alt="Dishio"
                                className="h-6 w-auto object-contain mx-auto mb-4 opacity-50"
                            />
                            <p className="text-xl font-black text-white uppercase italic tracking-tight">
                                {selectedClient ? `Briefing on ${selectedClient.name}` : 'Submit a request'}
                            </p>
                            <p className="text-sm text-neutral-500 mt-2 max-w-[280px] mx-auto leading-relaxed">
                                {selectedClient
                                    ? 'Ask anything or use an action preset below.'
                                    : 'Select a client to begin, then start chatting.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto flex flex-col gap-6">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => {
                                const textContent = msg.parts
                                    ? msg.parts
                                        .filter((p) => p.type === 'text')
                                        .map((p) => (p as { type: 'text'; text: string }).text)
                                        .join('')
                                    : '';

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="shrink-0 w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center mt-1">
                                                <Bot className="w-3.5 h-3.5 text-dishio-yellow" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-white text-black rounded-br-sm'
                                                : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-sm'
                                                }`}
                                        >
                                            {msg.role === 'assistant' ? (
                                                <div className="prose prose-invert prose-sm max-w-none">
                                                    <ReactMarkdown>{textContent}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                textContent
                                            )}
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="shrink-0 w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center mt-1">
                                                <User className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-3 justify-start"
                            >
                                <div className="shrink-0 w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center mt-1">
                                    <Bot className="w-3.5 h-3.5 text-dishio-yellow" />
                                </div>
                                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"
                                            style={{ animationDelay: `${i * 0.15}s` }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="shrink-0 px-6 pb-6 pt-2">
                <div className="max-w-3xl mx-auto flex flex-col gap-3">
                    <ActionPresets onSelect={handlePresetSelect} />

                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    submit();
                                }
                            }}
                            placeholder={
                                selectedClient
                                    ? `Ask about ${selectedClient.name}…`
                                    : 'Select a client, then ask anything…'
                            }
                            rows={1}
                            className="w-full resize-none bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3.5 pr-12 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors leading-relaxed"
                            style={{ minHeight: '52px', maxHeight: '160px' }}
                            onInput={(e) => {
                                const t = e.target as HTMLTextAreaElement;
                                t.style.height = 'auto';
                                t.style.height = Math.min(t.scrollHeight, 160) + 'px';
                            }}
                        />
                        <button
                            onClick={submit}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-3 bottom-3 w-7 h-7 rounded-lg bg-dishio-yellow text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors shadow-[0_0_15px_-3px_rgba(255,217,0,0.5)]"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-neutral-700 font-medium uppercase tracking-wider">
                        Dishio AI may produce inaccurate information. Review before sending to clients.
                    </p>
                </div>
            </div>
        </div>
    );
}
