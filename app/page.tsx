'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import PipelineSteps from '@/components/PipelineSteps'
import TerminalLog from '@/components/TerminalLog'
import ContextPanels from '@/components/ContextPanels'
import Footer from '@/components/Footer'

export interface Log {
  id: number
  msg: string
  level: 'INFO' | 'OK' | 'CMD' | 'DEBUG' | 'WARN' | 'SYS' | 'ERROR'
  time: string
}

export interface SessionState {
  id: string
  email: string | null
  status: 'READY' | 'MAIL_READY' | 'POLLING' | 'CODE_FOUND' | 'VERIFIED' | 'COOKIES_SYNCED' | 'COMPLETED'
  code: string | null
  cookies: string | null
  auto: boolean
}

export default function Home() {
  const [session, setSession] = useState<SessionState>({
    id: 'VRC-LOADING',
    email: null,
    status: 'READY',
    code: null,
    cookies: null,
    auto: false,
  })

  const [logs, setLogs] = useState<Log[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  const addLog = (msg: string, level: Log['level'] = 'INFO') => {
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        msg,
        level,
        time: new Date().toLocaleTimeString(),
      },
    ])
  }

  useEffect(() => {
    // Generate a fresh ID on client-side mount to avoid hydration mismatch
    setSession((s) => ({
      ...s,
      id: 'VRC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    }))
  }, [])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Workflow Chaining
  useEffect(() => {
    if (!session.auto) return

    if (session.status === 'READY') triggerMail()
    if (session.status === 'MAIL_READY') triggerSignup()
    if (session.status === 'POLLING') startPoll()
    if (session.status === 'CODE_FOUND') triggerVerify()
    if (session.status === 'VERIFIED') triggerCookieSync()
    if (session.status === 'COOKIES_SYNCED') triggerVercelLogin()
  }, [session.status, session.auto])

  const triggerMail = async () => {
    addLog('REQ: Mailsy mailbox creation...', 'CMD')
    await new Promise((r) => setTimeout(r, 1200))
    const mail = `user_${Math.random().toString(36).substring(7)}@mailsy.com`
    setSession((s) => ({ ...s, email: mail, status: 'MAIL_READY' }))
    addLog(`RES: Created ${mail}`, 'OK')
  }

  const triggerSignup = async () => {
    addLog('REQ: Launching Playwright browser context...', 'CMD')
    addLog('NAV: vercel.com/signup/v0', 'SYS')
    await new Promise((r) => setTimeout(r, 2000))
    addLog(`INPUT: ${session.email} -> email_field`, 'SYS')
    addLog('CLICK: submit_button', 'SYS')
    setSession((s) => ({ ...s, status: 'POLLING' }))
  }

  const startPoll = () => {
    addLog('POLL: Checking Mailsy inbox (2s interval)...', 'SYS')
    let attempts = 0
    const timer = setInterval(() => {
      attempts++
      addLog(`POLL: Attempt ${attempts}...`, 'DEBUG')
      if (attempts >= 3) {
        clearInterval(timer)
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        setSession((s) => ({ ...s, code, status: 'CODE_FOUND' }))
        addLog(`RES: Code extracted -> ${code}`, 'OK')
      }
    }, 2000)
  }

  const triggerVerify = async () => {
    addLog(`REQ: Injecting ${session.code} to browser...`, 'CMD')
    await new Promise((r) => setTimeout(r, 1500))
    addLog('RES: Verification submitted', 'OK')
    setSession((s) => ({ ...s, status: 'VERIFIED' }))
  }

  const triggerCookieSync = async () => {
    addLog('REQ: Extracting auth cookies from Playwright...', 'CMD')
    await new Promise((r) => setTimeout(r, 1000))
    const mockCookies = btoa(JSON.stringify({ _vercel_jwt: 'eyJhbG...', user_id: 'usr_123' }))
    setSession((s) => ({ ...s, cookies: mockCookies, status: 'COOKIES_SYNCED' }))
    addLog('RES: Cookies cached to session', 'OK')
  }

  const triggerVercelLogin = async () => {
    addLog(`REQ: vercel login ${session.email}`, 'CMD')
    await new Promise((r) => setTimeout(r, 2000))
    addLog('RES: CLI Auth Complete', 'OK')
    setSession((s) => ({ ...s, status: 'COMPLETED', auto: false }))
  }

  const reset = () => {
    setSession({
      id: 'VRC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      email: null,
      status: 'READY',
      code: null,
      cookies: null,
      auto: false,
    })
    setLogs([])
    addLog('SYS: Workflow reset to IDLE', 'WARN')
  }

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header session={session} setSession={setSession} reset={reset} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <PipelineSteps session={session} />
          <div className="lg:col-span-8 flex flex-col gap-6">
            <TerminalLog logs={logs} logsEndRef={logsEndRef} />
            <ContextPanels session={session} />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  )
}
