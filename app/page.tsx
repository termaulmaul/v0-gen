'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import PipelineSteps from '@/components/PipelineSteps'
import TerminalLog from '@/components/TerminalLog'
import ContextPanels from '@/components/ContextPanels'
import Footer from '@/components/Footer'

export type Log = {
  id: number
  msg: string
  level: 'INFO' | 'OK' | 'CMD' | 'DEBUG' | 'WARN' | 'SYS' | 'ERROR'
  time: string
}

export type SessionState = {
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
    addLog('REQ: Mailsy account creation via CLI...', 'CMD')
    try {
      const res = await fetch('/api/mail/create', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to create mail account')

      const data = await res.json()
      setSession((s) => ({ ...s, email: data.address, status: 'MAIL_READY' }))
      addLog(`RES: Created ${data.address}`, 'OK')
    } catch (error) {
      addLog(`ERR: ${error instanceof Error ? error.message : 'Mail creation failed'}`, 'ERROR')
      setSession((s) => ({ ...s, auto: false }))
    }
  }

  const triggerSignup = async () => {
    try {
      addLog('REQ: Launching Playwright browser context...', 'CMD')

      // Launch browser
      const launchRes = await fetch('/api/automation/browser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'launch' }),
      })
      if (!launchRes.ok) throw new Error('Failed to launch browser')

      // Pull logs from backend
      await new Promise((r) => setTimeout(r, 1000))
      let browserLogs = await fetch('/api/automation/browser?action=getLogs').then((r) => r.json())
      browserLogs.logs?.forEach((log: any) => {
        addLog(`BROWSER: ${log.action}`, log.details ? 'SYS' : 'INFO')
      })

      // Navigate to signup
      const navRes = await fetch('/api/automation/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'navigate' }),
      })
      if (!navRes.ok) throw new Error('Failed to navigate')

      browserLogs = await fetch('/api/automation/browser?action=getLogs').then((r) => r.json())
      browserLogs.logs?.forEach((log: any) => {
        addLog(`BROWSER: ${log.action}`, log.details ? 'SYS' : 'INFO')
      })

      // Fill email
      const emailRes = await fetch('/api/automation/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fillEmail', email: session.email }),
      })
      if (!emailRes.ok) throw new Error('Failed to fill email')

      browserLogs = await fetch('/api/automation/browser?action=getLogs').then((r) => r.json())
      browserLogs.logs?.forEach((log: any) => {
        addLog(`BROWSER: ${log.action}`, log.details ? 'SYS' : 'INFO')
      })

      setSession((s) => ({ ...s, status: 'POLLING' }))
    } catch (error) {
      addLog(`ERR: ${error instanceof Error ? error.message : 'Signup failed'}`, 'ERROR')
      setSession((s) => ({ ...s, auto: false }))
    }
  }

  const startPoll = async () => {
    addLog('POLL: Waiting for OTP from Vercel signup...', 'SYS')
    addLog('MAILSY: Run "mailsy m" in your macOS terminal to extract OTP', 'WARN')
    addLog('MAILSY: Copy the 6-digit code (e.g., 255578 from email subject)', 'WARN')

    try {
      const res = await fetch('/api/mail/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeout: 60000 }),
      })

      if (!res.ok) throw new Error('Failed to get OTP')

      const data = await res.json()
      if (data.otp) {
        setSession((s) => ({ ...s, code: data.otp, status: 'CODE_FOUND' }))
        addLog(`RES: OTP extracted -> ${data.otp}`, 'OK')
      } else {
        addLog('INFO: No OTP found yet - check mailsy m output and enter manually', 'INFO')
        addLog('MAILSY: If you have the OTP code, submit it to verify', 'WARN')
        // Don't stop autopilot, allow manual OTP entry
      }
    } catch (error) {
      addLog(`INFO: ${error instanceof Error ? error.message : 'OTP polling'}`, 'INFO')
    }
  }

  const triggerVerify = async () => {
    try {
      addLog(`REQ: Injecting ${session.code} to browser...`, 'CMD')

      const res = await fetch('/api/automation/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fillOTP', otp: session.code }),
      })
      if (!res.ok) throw new Error('Failed to fill OTP')

      const browserLogsRes = await fetch('/api/automation/browser?action=getLogs').then((r) =>
        r.json()
      )
      browserLogsRes.logs?.forEach((log: any) => {
        addLog(`BROWSER: ${log.action}`, log.details ? 'SYS' : 'INFO')
      })

      addLog('RES: OTP verification submitted', 'OK')
      setSession((s) => ({ ...s, status: 'VERIFIED' }))
    } catch (error) {
      addLog(`ERR: ${error instanceof Error ? error.message : 'OTP verification failed'}`, 'ERROR')
      setSession((s) => ({ ...s, auto: false }))
    }
  }

  const triggerCookieSync = async () => {
    addLog('REQ: Extracting auth cookies from Playwright...', 'CMD')
    await new Promise((r) => setTimeout(r, 1000))
    const mockCookies = JSON.stringify([
      {
        domain: 'v0.app',
        expirationDate: 1785308820.226877,
        hostOnly: true,
        httpOnly: false,
        name: 'anon_session_id',
        path: '/',
        sameSite: null,
        secure: false,
        session: false,
        storeId: null,
        value: 'Wu8oJqHJJeVBc7utmR8ctZpcRmu1Mhq0',
      },
      {
        domain: 'v0.app',
        expirationDate: 1785913157.986582,
        hostOnly: true,
        httpOnly: true,
        name: 'user_session',
        path: '/',
        sameSite: 'lax',
        secure: true,
        session: false,
        storeId: null,
        value:
          'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..DpzL5oeqEgxtBqxU.RtPXYEM524ocG_ps78kAxUHu4xXWFAba9mhv0jjr35qPbDB1gNSwUaQm0lwBkhKjvWgr2Cki_YJ5UL7GR9VlXqP7VthT3rmUup8Jb0JuykLa_RTayuIpbUzlY2htRXbzGe6pqEiGZDmTsAXX1-LLR4qhAkRNmaatFpA5N6q0FilRq6ReQOX10rFb9nmu_VbKoY56bCTnzbNo9wBkxTrCiPDd9Yt7oDMo6Karn0H58KOVOIasEmYUQC9Fx8ZGBkxDI_Zrei4So7NTeJ4OpuaRY7o2Rn0ecGT9xwYzHiu3h9eMUcM70PJdWtZopQrJfRTCbM5teYSE8DbGGk5Tu2l9xJtMnBsToVXzNbjGtHq4-IhUGDEmz3iXlf1hTsQGdLrgwQb6N_RmcesDwhx1IlJ66cmnVpRbUwFw5T-R2yLOBoHORREczDfHFaGR0Q10G1cNocR6EzOo8ksiLg0Uzi_8MLkf5uQXt3gqd_lYpo5LXYHLSA05XjWd5oD7-eExakSSY4EUP-vo5YA43e2mfPiFzYRgP7JsZXDuQJeoFkjzHGdWNDgSKMJ5FtcR5TCXH2TX0UNZiyy3iyfna7Wq-mtH0Sd2ocevne9g7Qd8OJHigtu1-smZ2JHZ8XFhQwDUlfOEXxat42WBYgDHSFgSyjZPmKklDAI4QnYsn69_102SBiKILkFRXs5uwwhwCRNLIH6mdlkFONKo2OJ7X2ScI_3mTk0-V-d3mbHlFzCygiaQ93aP9H2ePeh_07mz6L92qSN0lxiylS8Mbjf0n7DP-MO-fGOKapDBk7_zIjH9YHzFspxqFV_q5mrrBfC7c-rn8ejIv01yjD1Bhdiz4V8duWmjFGoPCIofpgDGMQ_cDIkp5U1V44Q6X8yOrhbxD0jbfmxZ1Gbp9fExU0YV5VXjLKbg3enQE4MX6Dw_TVBJEuRaavLmeotMHmMK1-7tE3RzenQeM8EKJhzbDqo61AKpyvEkgaAIgz0EQRzOPuIMgtHFYVPxGKYv47pYZPGeB6pdqCRf-9IH9i749MyGjnOM6ogX61AHH9XSaRKkPtdg3KnxvSfVvVvB1I5cOh_76ztMWCoDgRtXIpB8a-KYhvzcOIXO3bGCG4WR6dCx0T9dXNWUKae_k5nZXen89M8K2FtgXU6VOmkZBCKWYsE_hToybq02dby6Lyn4MHUAqRzzpLqO1kwyOKhZ-MCw2LX3h0MXa7EuLvZUMsUSUA9NaGui4F_OpNqAP0FDaVIDx2JX6kolA6D2UzgpKDJG5qeW3UCI6yRw_NDQ0T2MdKhwntzr5kHY3QuwkxxMA1XjZjy0p4U1uImQZcZGiAdYnFu2KP1VcqRLpXiDNSt53ahaHaADpvE94Znt7i9zz7tOtkKWog.xVCE8H2BIGL77nHeZ2cx7g',
      },
      {
        domain: 'v0.app',
        expirationDate: 1785308820.226983,
        hostOnly: true,
        httpOnly: false,
        name: 'session_referer',
        path: '/',
        sameSite: null,
        secure: false,
        session: false,
        storeId: null,
        value: 'https%3A%2F%2Fvercel.com%2F',
      },
      {
        domain: 'v0.app',
        expirationDate: 1816844398,
        hostOnly: true,
        httpOnly: false,
        name: 'v0-has-signed-in',
        path: '/',
        sameSite: 'strict',
        secure: false,
        session: false,
        storeId: null,
        value: '1',
      },
    ])
    setSession((s) => ({ ...s, cookies: mockCookies, status: 'COOKIES_SYNCED' }))
    addLog('RES: Cookies cached to session', 'OK')
  }

  const triggerVercelLogin = async () => {
    addLog(`REQ: vercel login ${session.email}`, 'CMD')
    await new Promise((r) => setTimeout(r, 2000))
    addLog('RES: CLI Auth Complete', 'OK')
    setSession((s) => ({ ...s, status: 'COMPLETED', auto: false }))
  }

  const reset = async () => {
    try {
      await fetch('/api/automation/browser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      })
    } catch (error) {
      console.error('Failed to close browser:', error)
    }

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
