'use client'

import { Log } from '@/app/page'

interface TerminalLogProps {
  logs: Log[]
  logsEndRef: React.RefObject<HTMLDivElement | null>
}

const LOG_COLORS: Record<Log['level'], string> = {
  OK: 'text-green-500',
  CMD: 'text-blue-400',
  WARN: 'text-yellow-500',
  INFO: 'text-zinc-500',
  DEBUG: 'text-zinc-500',
  SYS: 'text-zinc-500',
  ERROR: 'text-red-500',
}

export default function TerminalLog({ logs, logsEndRef }: TerminalLogProps) {
  return (
    <section className="bg-black border border-zinc-900 rounded-xl overflow-hidden flex flex-col h-[500px]">
      <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex justify-between">
        <span className="text-[10px] font-bold text-zinc-400">STD_OUT // RECOVERY_LOG</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-900"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-900"></div>
          <div className="w-2 h-2 rounded-full bg-green-900"></div>
        </div>
      </div>
      <div className="p-4 overflow-y-auto terminal-scroll grow font-mono text-[11px] leading-relaxed">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-4 mb-1">
            <span className="text-zinc-600 shrink-0">[{log.time}]</span>
            <span className={`shrink-0 w-12 ${LOG_COLORS[log.level]}`}>{log.level}</span>
            <span className="text-zinc-300">{log.msg}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </section>
  )
}
