import { chromium, Browser, Page } from '@playwright/test'

let browser: Browser | null = null
let page: Page | null = null

export interface AutomationLog {
  timestamp: string
  action: string
  details?: string
}

const logs: AutomationLog[] = []

function log(action: string, details?: string) {
  const entry: AutomationLog = {
    timestamp: new Date().toLocaleTimeString(),
    action,
    details,
  }
  logs.push(entry)
  console.log(`[${entry.timestamp}] ${action} ${details ? ': ' + details : ''}`)
}

export async function launchBrowser(): Promise<void> {
  try {
    log('BROWSER', 'Launching Chromium...')
    browser = await chromium.launch({ headless: false })
    log('BROWSER', 'Chromium launched successfully')

    log('PAGE', 'Creating new page...')
    page = await browser.newPage()
    log('PAGE', 'Page created')
  } catch (error) {
    log('ERROR', `Failed to launch browser: ${error}`)
    throw error
  }
}

export async function navigateToVercelSignup(): Promise<void> {
  if (!page) throw new Error('Browser page not initialized')

  try {
    const url = 'https://vercel.com/signup/v0'
    log('NAV', `Navigating to ${url}...`)
    await page.goto(url, { waitUntil: 'networkidle' })
    log('NAV', 'Successfully navigated to Vercel signup')
  } catch (error) {
    log('ERROR', `Navigation failed: ${error}`)
    throw error
  }
}

export async function fillEmailAndContinue(email: string): Promise<void> {
  if (!page) throw new Error('Browser page not initialized')

  try {
    log('INPUT', `Filling email field with: ${email}`)
    await page.fill('input[type="email"]', email)
    log('INPUT', 'Email filled successfully')

    log('CLICK', 'Clicking "Continue with Email" button...')
    await page.click('button:has-text("Continue with Email")')
    log('CLICK', 'Email continuation clicked')

    // Wait for OTP input to appear
    log('WAIT', 'Waiting for OTP input fields...')
    await page.waitForSelector('input[inputmode="numeric"]', { timeout: 10000 })
    log('WAIT', 'OTP input fields appeared')
  } catch (error) {
    log('ERROR', `Email filling failed: ${error}`)
    throw error
  }
}

export async function fillOTP(otp: string): Promise<void> {
  if (!page) throw new Error('Browser page not initialized')

  try {
    log('OTP', `Filling OTP: ${otp}`)
    const otpInputs = await page.locator('input[inputmode="numeric"]').all()
    log('OTP', `Found ${otpInputs.length} OTP input fields`)

    for (let i = 0; i < otp.length && i < otpInputs.length; i++) {
      await otpInputs[i].fill(otp[i])
      log('OTP', `Filled digit ${i + 1}/${otp.length}`)
    }

    log('OTP', 'All OTP digits filled - verifying...')
    // OTP auto-submits or wait for verification
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {
      log('INFO', 'No navigation after OTP (may auto-verify)')
    })
    log('OTP', 'OTP verification complete')
  } catch (error) {
    log('ERROR', `OTP filling failed: ${error}`)
    throw error
  }
}

export async function closeBrowser(): Promise<void> {
  try {
    if (page) {
      log('PAGE', 'Closing page...')
      await page.close()
    }
    if (browser) {
      log('BROWSER', 'Closing browser...')
      await browser.close()
    }
    log('BROWSER', 'Browser closed')
  } catch (error) {
    log('ERROR', `Failed to close browser: ${error}`)
  }
}

export function getLogs(): AutomationLog[] {
  return logs
}

export function clearLogs(): void {
  logs.length = 0
}
