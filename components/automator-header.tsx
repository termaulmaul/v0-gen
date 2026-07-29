"use client"

import type { Session } from "@/lib/use-automator"

interface Props {
  session: Session
  onToggleAuto: (auto: boolean) => void
  onReset: () => void
}

export function AutomatorHeader({ session, onToggleAuto, onReset }: Props) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tighter text-accent text-balance">
          VERCEL_AUTH_AUTOMATOR v2.0
        </h1>
        <p className="mt-1 text-xs text-muted">
          Status: {session.status} | Session: {session.id}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2">
          <span className="text-[10px] font-bold text-muted">AUTO-PILOT</span>
          <input
            type="checkbox"
            className="sr-only"
            checked={session.auto}
            onChange={(e) => onToggleAuto(e.target.checked)}
          />
          <div
            className={`h-5 w-10 rounded-full p-1 transition-colors ${
              session.auto ? "bg-accent" : "bg-border"
            }`}
          >
            <div
              className={`h-3 w-3 rounded-full bg-foreground transition-transform ${
                session.auto ? "translate-x-5" : ""
              }`}
            />
          </div>
        </label>
        <button
          onClick={onReset}
          className="rounded bg-panel-active px-3 py-1 text-[10px] transition-colors hover:bg-border"
        >
          RESET
        </button>
      </div>
    </header>
  )
}
