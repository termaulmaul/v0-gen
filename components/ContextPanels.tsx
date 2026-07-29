'use client'

import { SessionState } from '@/app/page'

interface ContextPanelsProps {
  session: SessionState
}

export default function ContextPanels({ session }: ContextPanelsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-3">
          Identity Context
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between border-b border-zinc-900 pb-2">
            <span className="text-zinc-600">Email</span>
            <span>{session.email || 'null'}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-2">
            <span className="text-zinc-600">OTP Code</span>
            <span className="font-bold text-blue-400 tracking-widest">
              {session.code || '------'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-3">
          Auth Metadata (Cookies)
        </h3>
        <div className="text-[10px] font-mono break-all text-zinc-500 line-clamp-3">
          {session.cookies || 'Waiting for verification...'}
        </div>
        {session.cookies && (
          <button
            onClick={() => copyToClipboard(session.cookies!)}
            className="mt-2 text-[9px] bg-blue-900/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-900/40"
          >
            COPY_TO_CLIPBOARD
          </button>
        )}
      </div>
    </section>
  )
}
