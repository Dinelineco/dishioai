'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useApp } from '@/context/AppContext';
import { ActionPresets } from './ActionPresets';
import { WorkRequestCard } from './WorkRequestCard';
import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const WR_MARKER = '\n\n__WR_DRAFTS__:';

function parseWorkRequests(text: string): { displayText: string; drafts: any[] | null } {
  const idx = text.indexOf(WR_MARKER);
  if (idx < 0) return { displayText: text, drafts: null };
  try {
    const drafts = JSON.parse(text.substring(idx + WR_MARKER.length));
    return { displayText: text.substring(0, idx), drafts: Array.isArray(drafts) ? drafts : null };
  } catch {
    return { displayText: text, drafts: null };
  }
}

export function ChatInterface() {
  const { selectedClient, amId } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, status, sendMessage, data } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  }) as any;

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage(
      { text },
      { body: { client_code: selectedClient?.clientCode || null, am_id: amId || 'am_default' } },
    );
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handlePresetSelect = (message: string) => {
    sendMessage(
      { text: message },
      { body: { client_code: selectedClient?.clientCode || null, am_id: amId || 'am_default' } },
    );
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--s0)' }}>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (

          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                   style={{ background: 'var(--s3)', border: '1px solid var(--b2)' }}>
                <Bot className="w-7 h-7" style={{ color: 'var(--yellow)' }} />
              </div>
              <span className="absolute inset-0 rounded-2xl animate-ping-slow"
                    style={{ border: '1px solid var(--yellow-glow)' }} />
            </div>

            <div className="max-w-xs">
              <img src="/images/DISHIO-LOGOTYPE-YELLOW.png" alt="Dishio"
                   className="h-5 w-auto object-contain mx-auto mb-4" style={{ opacity: 0.3 }} />
              <p className="text-xl font-black uppercase italic tracking-tight mb-2"
                 style={{ color: 'var(--t1)' }}>
                {selectedClient ? `Briefing on ${selectedClient.name}` : 'Select a client'}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--t3)' }}>
                {selectedClient
                  ? 'Ask anything or run a preset below.'
                  : 'Choose a client from the sidebar, then start a conversation.'}
              </p>
            </div>

            {selectedClient && (
              <div className="w-full max-w-md">
                <ActionPresets onSelect={handlePresetSelect} />
              </div>
            )}
          </div>

        ) : (

          /* Message list */
          <div className="max-w-3xl mx-auto flex flex-col gap-5 px-6 py-6">
            <AnimatePresence initial={false}>
              {messages.map((msg: any, idx: number) => {
                const rawText = msg.parts
                  ? msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
                  : (msg.content ?? '');
                const { displayText: textContent, drafts: workRequestDrafts } = parseWorkRequests(rawText);
                const lastAssistantIdx = messages
                  .filter((m: any, i: number) => i <= idx && m.role === 'assistant').length - 1;
                const msgData = msg.role === 'assistant' ? (data as any)?.[lastAssistantIdx] : null;
                const sources = msgData?.sources || [];
                const isUser = msg.role === 'user';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {isUser ? (
                      <div className="flex items-end gap-2 max-w-[80%]">
                        <div className="px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed font-medium"
                             style={{ background: 'var(--t1)', color: '#080808' }}>
                          {rawText}
                        </div>
                        <div className="shrink-0 w-7 h-7 rounded-[7px] flex items-center justify-center mb-0.5"
                             style={{ background: 'var(--s4)', border: '1px solid var(--b2)' }}>
                          <User className="w-3.5 h-3.5" style={{ color: 'var(--t2)' }} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5 max-w-[90%]">
                        <div className="shrink-0 w-7 h-7 rounded-[7px] flex items-center justify-center mt-0.5"
                             style={{ background: 'var(--s3)', border: '1px solid var(--b2)' }}>
                          <Bot className="w-3.5 h-3.5" style={{ color: 'var(--yellow)' }} />
                        </div>
                        <div className="flex flex-col gap-2">
                          {textContent && (
                            <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
                                 style={{ background: 'var(--s2)', border: '1px solid var(--b2)', color: 'var(--t1)' }}>
                              <div className="prose prose-invert prose-sm max-w-none
                                prose-p:leading-relaxed prose-p:my-2
                                prose-headings:font-semibold prose-headings:text-white
                                prose-strong:text-white prose-strong:font-semibold
                                prose-code:text-yellow-300 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded
                                prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/5
                                prose-li:my-0.5">
                                <ReactMarkdown>{textContent}</ReactMarkdown>
                              </div>
                            </div>
                          )}
                          {workRequestDrafts && workRequestDrafts.length > 0 && (
                            <div className="flex flex-col gap-3">
                              {workRequestDrafts.map((draft: any) => (
                                <WorkRequestCard
                                  key={draft.id}
                                  draft={draft}
                                  onSubmitted={(id, url) => {
                                    // Optimistically mark card as submitted in UI
                                    draft.status = 'submitted';
                                    if (url) draft.clickup_task_id = url.split('/').pop();
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          {sources.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pl-1">
                              <p className="text-[9px] font-bold uppercase tracking-widest w-full mb-0.5"
                                 style={{ color: 'var(--t4)' }}>Sources</p>
                              {sources.map((s: any, sIdx: number) => (
                                <div key={sIdx}
                                     className="px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1.5"
                                     style={{ background: 'var(--s3)', border: '1px solid var(--b2)', color: 'var(--t3)' }}>
                                  <span className="w-1 h-1 rounded-full shrink-0"
                                        style={{ background: 'var(--yellow)', opacity: 0.5 }} />
                                  {s.code || s.client} ({s.date})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Thinking dots */}
            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-2.5">
                <div className="shrink-0 w-7 h-7 rounded-[7px] flex items-center justify-center mt-0.5"
                     style={{ background: 'var(--s3)', border: '1px solid var(--b2)' }}>
                  <Bot className="w-3.5 h-3.5" style={{ color: 'var(--yellow)' }} />
                </div>
                <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
                     style={{ background: 'var(--s2)', border: '1px solid var(--b2)' }}>
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--t3)' }}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
                      transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 px-4 pb-5 pt-3"
           style={{ borderTop: isEmpty ? 'none' : '1px solid var(--b1)' }}>
        <div className="max-w-3xl mx-auto flex flex-col gap-2.5">
          {!isEmpty && <ActionPresets onSelect={handlePresetSelect} />}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder={selectedClient ? `Ask about ${selectedClient.name}…` : 'Select a client to begin…'}
              rows={1}
              disabled={!selectedClient}
              className="w-full resize-none text-sm leading-relaxed focus:outline-none transition-colors duration-150"
              style={{
                background: 'var(--s2)',
                border: '1px solid var(--b2)',
                borderRadius: 'var(--r-lg)',
                padding: '13px 52px 13px 16px',
                color: 'var(--t1)',
                minHeight: '50px',
                maxHeight: '160px',
                caretColor: 'var(--yellow)',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.14)')}
              onBlur={e => (e.target.style.borderColor = 'var(--b2)')}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 160) + 'px';
              }}
            />
            <button
              onClick={submit}
              disabled={isLoading || !input.trim() || !selectedClient}
              className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-[8px] flex items-center justify-center transition-all duration-150 disabled:opacity-20 disabled:cursor-not-allowed"
              style={{ background: 'var(--yellow)' }}
            >
              <Send className="w-3.5 h-3.5" style={{ color: '#000' }} />
            </button>
          </div>
          <p className="text-center text-[9px] font-medium uppercase tracking-[0.15em]"
             style={{ color: 'var(--t4)' }}>
            Dishio AI · Review before sending to clients
          </p>
        </div>
      </div>
    </div>
  );
}
