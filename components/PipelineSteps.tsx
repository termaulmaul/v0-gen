'use client'

import { SessionState } from '@/app/page'

interface PipelineStepsProps {
  session: SessionState
}

const STEPS = [
  { id: 'READY', label: '1. Mailsy Provision', desc: 'Gen temp mailbox' },
  { id: 'MAIL_READY', label: '2. Browser Signup', desc: 'Nav & Fill vercel.com' },
  { id: 'POLLING', label: '3. Inbox Scan', desc: 'Extract 6-digit OTP' },
  { id: 'CODE_FOUND', label: '4. API Verification', desc: 'Submit OTP to session' },
  { id: 'VERIFIED', label: '5. Cookie Capture', desc: 'Sync browser storage' },
  { id: 'COOKIES_SYNCED', label: '6. CLI Handshake', desc: 'Vercel login via shell' },
] as const

export default function PipelineSteps({ session }: PipelineStepsProps) {
  return (
    <div className="lg:col-span-4 space-y-4">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">
        Pipeline Steps
      </h2>

      {STEPS.map((step) => (
        <div
          key={step.id}
          className={`p-4 rounded-lg border transition-all ${
            session.status === step.id
              ? 'bg-zinc-900 border-blue-500/50 step-glow'
              : 'bg-zinc-950 border-zinc-900 opacity-40'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold">{step.label}</span>
            {session.status === step.id && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse-fast"></div>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">{step.desc}</p>
        </div>
      ))}
    </div>
  )
}
