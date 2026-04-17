"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, X, MessageSquare, Smile } from "lucide-react";
import MessageBubble from "@/components/messaging/MessageBubble";
import type { MessageRecord } from "@/lib/types/messaging";

const PATIENT_ID = "patient-1";
const CLINIC_ID = "clinic-1";

interface OptimisticMessage extends MessageRecord {
  optimistic: true;
  tempId: string;
}

type DisplayMessage = MessageRecord | OptimisticMessage;

function isOptimistic(m: DisplayMessage): m is OptimisticMessage {
  return "optimistic" in m && m.optimistic === true;
}

interface QuickMessageSidebarProps {
  scanId: string;
}

export default function QuickMessageSidebar({ scanId }: QuickMessageSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messaging?scanId=${encodeURIComponent(scanId)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { threadId: string | null; messages: MessageRecord[] };
      setThreadId(data.threadId);
      setMessages(data.messages);
    } catch { /* silently ignore */ }
  }, [scanId]);

  useEffect(() => { if (isOpen) fetchMessages(); }, [isOpen, fetchMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 150);
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;
    setSendError(null);
    setContent("");

    const tempId = `temp-${Date.now()}`;
    const optimistic: OptimisticMessage = {
      id: tempId, tempId, threadId: threadId ?? "",
      content: trimmed, sender: "patient",
      createdAt: new Date(), optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setLoading(true);

    try {
      const res = await fetch("/api/messaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId, patientId: PATIENT_ID, clinicId: CLINIC_ID,
          sender: "patient", content: trimmed,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: { message?: string } };
        throw new Error(data.error?.message ?? "Failed to send");
      }
      const data = (await res.json()) as { threadId: string; message: MessageRecord };
      setThreadId(data.threadId);
      setMessages((prev) =>
        prev.map((m) => (isOptimistic(m) && m.tempId === tempId ? data.message : m))
      );
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Message failed to send.");
      setMessages((prev) => prev.filter((m) => !(isOptimistic(m) && m.tempId === tempId)));
    } finally {
      setLoading(false);
    }
  }, [content, loading, scanId, threadId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    },
    [handleSend]
  );

  return (
    <>
      {/* ── FAB toggle ── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close messaging" : "Message your clinic"}
        aria-expanded={isOpen}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-glass transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)", boxShadow: "0 4px 24px rgba(6,182,212,0.35)" }}
      >
        <MessageSquare size={17} />
        <span className="text-sm font-semibold">Message Clinic</span>
      </button>

      {/* ── Sidebar ── */}
      <div
        role="dialog"
        aria-label="Message your clinic"
        aria-modal="false"
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-sm bg-[#070f1f] border-l border-white/8 shadow-glass transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/6 bg-[#070f1f]">
          <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-300 shrink-0">
            DC
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-none">Dental Clinic</p>
            <p className="text-[11px] text-brand-400 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              Active
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close messaging"
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/8 transition-colors text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-white/6 flex items-center justify-center">
                <Smile size={24} className="text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">No messages yet</p>
                <p className="text-xs text-slate-600 mt-1 max-w-[200px] leading-relaxed">
                  Ask your clinic anything about your scan.
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={isOptimistic(m) ? m.tempId : m.id}
                message={m}
                isOptimistic={isOptimistic(m)}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Error banner */}
        {sendError && (
          <div
            role="status"
            aria-live="polite"
            className="mx-4 mb-2 px-3 py-2 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs"
          >
            {sendError}
          </div>
        )}

        {/* Composer */}
        <div className="px-3 pb-4 pt-2 border-t border-white/6 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={2}
            aria-label="Message content"
            className="flex-1 resize-none bg-surface-elevated border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500/60 focus:border-brand-500/40 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!content.trim() || loading}
            aria-label="Send message"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            style={{ background: "linear-gradient(135deg, #06b6d4, #0ea5e9)" }}
          >
            {loading
              ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <Send size={15} />
            }
          </button>
        </div>
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
