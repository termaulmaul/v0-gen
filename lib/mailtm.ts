import { execSync } from 'child_process'

export interface MailsyAccount {
  address: string
}

/**
 * Create a new Mailsy temporary email account via CLI
 * Requires mailsy CLI to be installed: npm install -g mailsy
 */
export function createMailsyAccount(): MailsyAccount {
  try {
    // Run: mailsy account create
    const output = execSync('mailsy account create --json', { encoding: 'utf-8' })
    const data = JSON.parse(output)

    if (!data.address) {
      throw new Error('No email address returned from Mailsy')
    }

    return { address: data.address }
  } catch (error) {
    throw new Error(`Mailsy account creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Wait for OTP email and extract the code
 * @param address - Mailsy email address
 * @param timeout - Timeout in milliseconds
 * @returns OTP code if found
 */
export function waitForMailsyOTP(address: string, timeout = 60000): string | null {
  try {
    // Run: mailsy inbox read --address <address> --wait <timeout> --json
    const timeoutSeconds = Math.ceil(timeout / 1000)
    const output = execSync(
      `mailsy inbox read --address "${address}" --wait ${timeoutSeconds} --json`,
      { encoding: 'utf-8' }
    )

    const emails = JSON.parse(output)
    if (!Array.isArray(emails) || emails.length === 0) {
      return null
    }

    // Extract OTP from first email
    const emailContent = emails[0].body || emails[0].text || ''
    const match = emailContent.match(/code=(\d{6})/) || emailContent.match(/\b(\d{6})\b/)

    return match ? match[1] : null
  } catch (error) {
    console.error('Mailsy OTP extraction error:', error)
    return null
  }
}
