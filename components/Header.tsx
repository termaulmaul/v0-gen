'use client'

import { SessionState } from '@/app/page'

interface HeaderProps {
  session: SessionState
  setSession: (fn: (s: SessionState) => SessionState) => void
  reset: () => void
}

export default function Header({ session, setSession, reset }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
      <div>
        <h1 className="text-xl font-bold tracking-tighter text-blue-500">
          VERCEL_AUTH_AUTOMATOR v2.0
        </h1>
        <p className="text-zinc-500 text-xs mt-1">
          Status: {session.status} | Session: {session.id}
        </p>
      </div>
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-[10px] font-bold text-zinc-400">AUTO-PILOT</span>
          <input
            type="checkbox"
            className="hidden"
            checked={session.auto}
            onChange={(e) => setSession((s) => ({ ...s, auto: e.target.checked }))}
          />
          <div
            className={`w-10 h-5 rounded-full p-1 transition-colors ${
              session.auto ? 'bg-blue-600' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-3 h-3 bg-white rounded-full transition-transform ${
                session.auto ? 'translate-x-5' : ''
              }`}
            />
          </div>
        </label>
        <button
          onClick={reset}
          className="text-[10px] bg-zinc-800 px-3 py-1 rounded hover:bg-zinc-700"
        >
          RESET
        </button>
      </div>
    </header>
  )
}
