import { CheckCircle2, Bell, MessageSquare, Clock } from "lucide-react";
import QuickMessageSidebar from "@/components/messaging/QuickMessageSidebar";

interface ResultsPageProps {
  params: { scanId: string };
}

const NEXT_STEPS = [
  {
    icon: Bell,
    title: "Clinic notified",
    desc: "Your dental team has been alerted and will review your images shortly.",
    done: true,
  },
  {
    icon: Clock,
    title: "Review in progress",
    desc: "A dentist will analyse your scan — typically within 24 hours.",
    done: false,
  },
  {
    icon: MessageSquare,
    title: "Message your clinic",
    desc: "Have a question? Send a message directly from this page.",
    done: false,
  },
];

export default function ResultsPage({ params }: ResultsPageProps) {
  const { scanId } = params;

  return (
    <main className="min-h-screen bg-[#030b18] text-white">

      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-5 py-3.5 bg-[#070f1f]/95 border-b border-white/5 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand-sm">
          <span className="text-white text-[11px] font-bold tracking-tight">DS</span>
        </div>
        <span className="font-semibold text-sm text-slate-100 tracking-tight">DentalScan AI</span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-6 animate-slide-up">

        {/* ── Hero card ── */}
        <div className="relative overflow-hidden rounded-3xl bg-surface-card border border-white/8 p-8 flex flex-col items-center text-center gap-4">
          {/* Background glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

          <div className="relative w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-brand-400" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">Scan Submitted</h1>
            <p className="text-slate-400 text-sm mt-2 max-w-xs leading-relaxed">
              All 5 images were captured successfully. Your clinic will review them and get back to you.
            </p>
          </div>

          {/* Scan ID badge */}
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            <span className="text-[11px] text-slate-400 font-mono">
              {scanId.slice(0, 8)}…{scanId.slice(-4)}
            </span>
          </div>
        </div>

        {/* ── Next steps ── */}
        <div className="rounded-3xl bg-surface-card border border-white/8 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-slate-300">What happens next</h2>
          </div>
          <div className="divide-y divide-white/5">
            {NEXT_STEPS.map(({ icon: Icon, title, desc, done }, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <div
                  className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    done
                      ? "bg-brand-500/15 border border-brand-500/30"
                      : "bg-slate-800/80 border border-slate-700/40"
                  }`}
                >
                  <Icon size={16} className={done ? "text-brand-400" : "text-slate-500"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${done ? "text-white" : "text-slate-400"}`}>
                    {title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
                {done && (
                  <CheckCircle2 size={15} className="text-brand-400 shrink-0 mt-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <QuickMessageSidebar scanId={scanId} />
    </main>
  );
}
