"use client"

import { PIPELINE_STEPS, type Session, type Status } from "@/lib/use-automator"

const ORDER: Status[] = [
  "READY",
  "MAIL_READY",
  "POLLING",
  "CODE_FOUND",
  "VERIFIED",
  "COOKIES_SYNCED",
  "COMPLETED",
]

interface Props {
  session: Session
  onRunStep: () => void
}

export function PipelineSteps({ session, onRunStep }: Props) {
  const currentIndex = ORDER.indexOf(session.status)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
          Pipeline Steps
        </h2>
        {!session.auto && session.status !== "COMPLETED" && (
          <button
            onClick={onRunStep}
            className="rounded bg-accent/10 px-2 py-1 text-[9px] font-bold text-accent-soft transition-colors hover:bg-accent/20"
          >
            RUN_STEP
          </button>
        )}
      </div>

      {PIPELINE_STEPS.map((step) => {
        const stepIndex = ORDER.indexOf(step.id)
        const isActive = session.status === step.id
        const isDone = currentIndex > stepIndex

        return (
          <div
            key={step.id}
            className={`rounded-lg border p-4 transition-all ${
              isActive
                ? "step-glow border-accent/50 bg-panel-active"
                : isDone
                  ? "border-border-subtle bg-panel opacity-70"
                  : "border-border-subtle bg-panel opacity-40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{step.label}</span>
              {isActive && (
                <div className="h-2 w-2 animate-pulse-fast rounded-full bg-accent" />
              )}
              {isDone && <span className="text-[10px] text-ok">OK</span>}
            </div>
            <p className="mt-1 text-[10px] text-muted">{step.desc}</p>
          </div>
        )
      })}

      {session.status === "COMPLETED" && (
        <div className="rounded-lg border border-ok/40 bg-ok/5 p-4">
          <span className="text-xs font-bold text-ok">
            PIPELINE_COMPLETED
          </span>
          <p className="mt-1 text-[10px] text-muted">
            All steps executed successfully.
          </p>
        </div>
      )}
    </div>
  )
}
