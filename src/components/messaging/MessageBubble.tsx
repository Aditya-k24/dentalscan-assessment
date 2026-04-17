"use client";

import React from "react";
import type { MessageRecord } from "@/lib/types/messaging";

interface MessageBubbleProps {
  message: MessageRecord;
  isOptimistic?: boolean;
}

export default function MessageBubble({ message, isOptimistic = false }: MessageBubbleProps) {
  const isPatient = message.sender === "patient";
  const time = isOptimistic
    ? "Sending…"
    : new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isPatient ? "justify-end" : "justify-start"} animate-slide-up`}>
      {/* Clinic avatar */}
      {!isPatient && (
        <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-[10px] font-bold text-brand-300 mr-2 mt-auto shrink-0">
          DC
        </div>
      )}

      <div
        className={`
          max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm
          transition-opacity duration-200
          ${isOptimistic ? "opacity-50" : "opacity-100"}
          ${isPatient
            ? "bg-gradient-to-br from-brand-500 to-sky-500 text-white rounded-br-sm shadow-brand-sm"
            : "bg-surface-elevated border border-white/8 text-slate-100 rounded-bl-sm"
          }
        `}
      >
        <p className="leading-snug">{message.content}</p>
        <p className={`text-[10px] mt-1 ${isPatient ? "text-sky-200/70" : "text-slate-500"}`}>
          {time}
        </p>
      </div>
    </div>
  );
}
