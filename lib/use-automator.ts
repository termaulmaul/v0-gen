"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type Status =
  | "READY"
  | "MAIL_READY"
  | "POLLING"
  | "CODE_FOUND"
  | "VERIFIED"
  | "COOKIES_SYNCED"
  | "COMPLETED"

export type LogLevel = "INFO" | "OK" | "CMD" | "SYS" | "WARN" | "DEBUG" | "ERR"

export interface LogEntry {
  id: string
  msg: string
  level: LogLevel
  time: string
}

export interface Session {
  id: string
  email: string | null
  status: Status
  code: string | null
  cookies: string | null
  auto: boolean
}

export const PIPELINE_STEPS: {
  id: Status
  label: string
  desc: string
}[] = [
  { id: "READY", label: "1. Mailsy Provision", desc: "Gen temp mailbox" },
  { id: "MAIL_READY", label: "2. Browser Signup", desc: "Nav & Fill vercel.com" },
  { id: "POLLING", label: "3. Inbox Scan", desc: "Extract 6-digit OTP" },
  { id: "CODE_FOUND", label: "4. API Verification", desc: "Submit OTP to session" },
  { id: "VERIFIED", label: "5. Cookie Capture", desc: "Sync browser storage" },
  { id: "COOKIES_SYNCED", label: "6. CLI Handshake", desc: "Vercel login via shell" },
]

function newSessionId() {
  return "VRC-" + Math.random().toString(36).substring(2, 9).toUpperCase()
}

function freshSession(): Session {
  return {
    id: newSessionId(),
    email: null,
    status: "READY",
    code: null,
    cookies: null,
    auto: false,
  }
}

export function useAutomator() {
  const [session, setSession] = useState<Session>(freshSession)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const addLog = useCallback((msg: string, level: LogLevel = "INFO") => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        msg,
        level,
        time: new Date().toLocaleTimeString(),
      },
    ])
  }, [])

  const triggerMail = useCallback(async () => {
    addLog("REQ: Mailsy mailbox creation...", "CMD")
    await new Promise((r) => setTimeout(r, 1200))
    const mail = `user_${Math.random().toString(36).substring(7)}@mailsy.com`
    setSession((s) => ({ ...s, email: mail, status: "MAIL_READY" }))
    addLog(`RES: Created ${mail}`, "OK")
  }, [addLog])

  const triggerSignup = useCallback(
    async (email: string | null) => {
      addLog("REQ: Launching Playwright browser context...", "CMD")
      addLog("NAV: vercel.com/signup/v0", "SYS")
      await new Promise((r) => setTimeout(r, 2000))
      addLog(`INPUT: ${email} -> email_field`, "SYS")
      addLog("CLICK: submit_button", "SYS")
      setSession((s) => ({ ...s, status: "POLLING" }))
    },
    [addLog],
  )

  const startPoll = useCallback(() => {
    addLog("POLL: Checking Mailsy inbox (2s interval)...", "SYS")
    let attempts = 0
    if (pollTimer.current) clearInterval(pollTimer.current)
    pollTimer.current = setInterval(() => {
      attempts++
      addLog(`POLL: Attempt ${attempts}...`, "DEBUG")
      if (attempts >= 3) {
        if (pollTimer.current) clearInterval(pollTimer.current)
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        setSession((s) => ({ ...s, code, status: "CODE_FOUND" }))
        addLog(`RES: Code extracted -> ${code}`, "OK")
      }
    }, 2000)
  }, [addLog])

  const triggerVerify = useCallback(
    async (code: string | null) => {
      addLog(`REQ: Injecting ${code} to browser...`, "CMD")
      await new Promise((r) => setTimeout(r, 1500))
      addLog("RES: Verification submitted", "OK")
      setSession((s) => ({ ...s, status: "VERIFIED" }))
    },
    [addLog],
  )

  const triggerCookieSync = useCallback(async () => {
    addLog("REQ: Extracting auth cookies from Playwright...", "CMD")
    await new Promise((r) => setTimeout(r, 1000))
    const mockCookies = btoa(
      JSON.stringify({ _vercel_jwt: "eyJhbG...", user_id: "usr_123" }),
    )
    setSession((s) => ({ ...s, cookies: mockCookies, status: "COOKIES_SYNCED" }))
    addLog("RES: Cookies cached to session", "OK")
  }, [addLog])

  const triggerVercelLogin = useCallback(
    async (email: string | null) => {
      addLog(`REQ: vercel login ${email}`, "CMD")
      await new Promise((r) => setTimeout(r, 2000))
      addLog("RES: CLI Auth Complete", "OK")
      setSession((s) => ({ ...s, status: "COMPLETED", auto: false }))
    },
    [addLog],
  )

  // Workflow chaining (auto-pilot)
  useEffect(() => {
    if (!session.auto) return
    if (session.status === "READY") triggerMail()
    if (session.status === "MAIL_READY") triggerSignup(session.email)
    if (session.status === "POLLING") startPoll()
    if (session.status === "CODE_FOUND") triggerVerify(session.code)
    if (session.status === "VERIFIED") triggerCookieSync()
    if (session.status === "COOKIES_SYNCED") triggerVercelLogin(session.email)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status, session.auto])

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current)
    }
  }, [])

  const setAuto = useCallback((auto: boolean) => {
    setSession((s) => ({ ...s, auto }))
  }, [])

  const runStep = useCallback(() => {
    switch (session.status) {
      case "READY":
        triggerMail()
        break
      case "MAIL_READY":
        triggerSignup(session.email)
        break
      case "POLLING":
        startPoll()
        break
      case "CODE_FOUND":
        triggerVerify(session.code)
        break
      case "VERIFIED":
        triggerCookieSync()
        break
      case "COOKIES_SYNCED":
        triggerVercelLogin(session.email)
        break
    }
  }, [
    session.status,
    session.email,
    session.code,
    triggerMail,
    triggerSignup,
    startPoll,
    triggerVerify,
    triggerCookieSync,
    triggerVercelLogin,
  ])

  const reset = useCallback(() => {
    if (pollTimer.current) clearInterval(pollTimer.current)
    setSession(freshSession())
    setLogs([])
    addLog("SYS: Workflow reset to IDLE", "WARN")
  }, [addLog])

  return { session, logs, setAuto, reset, runStep }
}
