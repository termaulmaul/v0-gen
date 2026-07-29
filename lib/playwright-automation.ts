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
    log('NAV', `Starting navigation to ${url}...`)
    
    // Add debug info about current page
    const currentUrl = page.url()
    log('DEBUG', `Current page URL: ${currentUrl}`)
    
    // Navigate with a longer timeout
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    
    // Check if we actually navigated
    const newUrl = page.url()
    log('DEBUG', `After goto - new URL: ${newUrl}`)
    log('NAV', 'Navigation completed')
  } catch (error) {
    log('ERROR', `Navigation failed: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

export async function fillEmailAndContinue(email: string): Promise<void> {
  if (!page) throw new Error('Browser page not initialized')

  try {
    log('INPUT', `Filling email field with: ${email}`)
    
    // Wait for email input to be visible
    await page.waitForSelector('input[type="email"]', { timeout: 5000 })
    await page.fill('input[type="email"]', email, { timeout: 5000 })
    log('INPUT', `Email filled: ${email}`)

    log('CLICK', 'Clicking "Continue with Email" button...')
    // Click the continue button
    await page.click('button:has-text("Continue with Email")', { timeout: 5000 })
    log('CLICK', 'Continue button clicked')

    // Wait for OTP input section to appear (can be multiple fields or a code input)
    log('WAIT', 'Waiting for OTP entry...')
    try {
      await page.waitForSelector('input[inputmode="numeric"], input[placeholder*="code"], input[placeholder*="Code"]', { timeout: 15000 })
      log('WAIT', 'OTP input appeared')
    } catch {
      log('INFO', 'OTP input not yet visible - may be on next screen')
    }
  } catch (error) {
    log('ERROR', `Email filling failed: ${error}`)
    throw error
  }
}

export async function fillOTP(otp: string): Promise<void> {
  if (!page) throw new Error('Browser page not initialized')

  try {
    log('OTP', `Filling OTP code: ${otp}`)
    
    // Try to find OTP input (could be single field or multiple digit fields)
    const singleCodeInput = await page.$('input[placeholder*="code"], input[placeholder*="Code"], input[type="text"][maxlength]')
    
    if (singleCodeInput) {
      // Single code input field
      log('OTP', 'Found single code input field')
      await page.fill('input[placeholder*="code"], input[placeholder*="Code"], input[type="text"][maxlength]', otp)
      log('OTP', `Code filled: ${otp}`)
    } else {
      // Multiple digit input fields
      const otpInputs = await page.locator('input[inputmode="numeric"]').all()
      log('OTP', `Found ${otpInputs.length} digit input fields`)
      
      for (let i = 0; i < otp.length && i < otpInputs.length; i++) {
        await otpInputs[i].fill(otp[i])
        log('OTP', `Filled digit ${i + 1}/${otp.length}`)
      }
    }

    log('OTP', 'OTP filled - waiting for verification...')
    // Wait for navigation or success indicator
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {
      log('INFO', 'Page verification in progress...')
    })
    log('OTP', 'Verification complete')
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
