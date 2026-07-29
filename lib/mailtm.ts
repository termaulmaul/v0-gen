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
    // First, try to delete any existing account
    try {
      execSync('mailsy d', { encoding: 'utf-8' })
    } catch (e) {
      // Ignore delete errors (no account to delete is fine)
    }

    // Small delay to ensure delete completed
    const now = Date.now()
    while (Date.now() - now < 500) {
      // Busy wait
    }

    // Now create a new account: mailsy g (generate new account)
    const output = execSync('mailsy g', { encoding: 'utf-8' })

    // Parse output: "Account created: email@domain.net"
    const match = output.match(/Account created:\s*(\S+@\S+)/)
    if (!match || !match[1]) {
      throw new Error('Could not parse email address from Mailsy output')
    }

    const address = match[1].trim()
    return { address }
  } catch (error) {
    throw new Error(`Mailsy account creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Wait for OTP email and extract the code
 * Mailsy CLI maintains session, so it polls the current account
 * @param timeout - Timeout in milliseconds
 * @returns OTP code if found
 */
export function waitForMailsyOTP(timeout = 60000): string | null {
  try {
    // Run: mailsy m (fetch messages from current account)
    // Note: mailsy CLI persists the account session, so we just poll
    const startTime = Date.now()
    const pollInterval = 3000

    while (Date.now() - startTime < timeout) {
      try {
        const output = execSync('mailsy m', { encoding: 'utf-8' })

        // If output contains "No Emails", continue polling
        if (output.includes('No Emails')) {
          const elapsed = Date.now() - startTime
          const remaining = timeout - elapsed
          if (remaining > 0) {
            // Sleep using native Node.js instead of shell command
            execSync(`node -e "require('util').promisify(setTimeout)(${Math.min(pollInterval, remaining)})"`)
          }
          continue
        }

        // Extract OTP from email content
        const codeMatch = output.match(/code[=:\s]+(\d{6})/) || output.match(/\b(\d{6})\b/)
        if (codeMatch && codeMatch[1]) {
          return codeMatch[1]
        }
      } catch (e) {
        // Continue polling on error
      }

      const elapsed = Date.now() - startTime
      if (elapsed >= timeout) break

      const remaining = timeout - elapsed
      if (remaining > 0) {
        // Use setTimeout-based sleep
        const now = Date.now()
        while (Date.now() - now < Math.min(pollInterval, remaining)) {
          // Busy wait - not ideal but works cross-platform
        }
      }
    }

    return null
  } catch (error) {
    console.error('Mailsy OTP extraction error:', error)
    return null
  }
}
