"use client"

import { useEffect, useRef } from "react"
import type { LogEntry, LogLevel } from "@/lib/use-automator"

const LEVEL_COLOR: Record<LogLevel, string> = {
  OK: "text-ok",
  CMD: "text-accent-soft",
  WARN: "text-warn",
  ERR: "text-danger",
  SYS: "text-muted",
  INFO: "text-muted",
  DEBUG: "text-muted-dark",
}

export function TerminalLog({ logs }: { logs: LogEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  return (
    <section className="flex h-[500px] flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-[10px] font-bold text-muted">
          STD_OUT // RECOVERY_LOG
        </span>
        <div className="flex gap-1" aria-hidden="true">
          <div className="h-2 w-2 rounded-full bg-danger/40" />
          <div className="h-2 w-2 rounded-full bg-warn/40" />
          <div className="h-2 w-2 rounded-full bg-ok/40" />
        </div>
      </div>
      <div className="terminal-scroll grow overflow-y-auto p-4 text-[11px] leading-relaxed">
        {logs.length === 0 && (
          <p className="text-muted-dark">// awaiting workflow trigger...</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="mb-1 flex gap-4">
            <span className="shrink-0 text-muted-dark">[{log.time}]</span>
            <span className={`w-12 shrink-0 ${LEVEL_COLOR[log.level]}`}>
              {log.level}
            </span>
            <span className="text-foreground/90">{log.msg}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </section>
  )
}
