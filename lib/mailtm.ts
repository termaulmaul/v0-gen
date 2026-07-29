import { execSync, spawnSync } from 'child_process'

export interface MailsyAccount {
  address: string
}

/**
 * Create a new Mailsy temporary email account via CLI
 * Deletes any existing account, then generates fresh one
 * Requires mailsy CLI to be installed: npm install -g mailsy
 */
export function createMailsyAccount(): MailsyAccount {
  try {
    // Delete existing account and generate new one in single command
    const output = execSync('mailsy d && mailsy g', { encoding: 'utf-8' })

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
 * mailsy m shows interactive menu with email list. Parse OTP from list without selecting.
 * @param timeout - Timeout in milliseconds
 * @returns OTP code if found
 */
export function waitForMailsyOTP(timeout = 60000): string | null {
  try {
    const startTime = Date.now()
    const pollInterval = 3000

    while (Date.now() - startTime < timeout) {
      try {
        // Run mailsy m with timeout to capture the email list menu output
        const result = spawnSync('bash', ['-c', 'timeout 2 mailsy m 2>&1 || true'], {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        })

        const output = result.stdout || result.stderr || ''

        // Check if output contains email list
        if (!output || output.includes('No Emails') || output.includes('No messages') || !output.includes('From:')) {
          const elapsed = Date.now() - startTime
          const remaining = timeout - elapsed
          if (remaining > 0) {
            // Wait before polling again
            const now = Date.now()
            while (Date.now() - now < Math.min(pollInterval, remaining)) {
              // Busy wait
            }
          }
          continue
        }

        // mailsy m menu format:
        // 4. 255578 is your Vercel sign up code - From:  registration@vercel.com
        // Extract OTP from the menu list (can appear anywhere with pattern: "<6-digit> is your")
        const lines = output.split('\n')
        for (const line of lines) {
          const codeMatch = line.match(/\b(\d{6})\s+is\s+your/)
          if (codeMatch && codeMatch[1]) {
            return codeMatch[1]
          }
        }

        // Fallback: look for any 6-digit code
        const fallbackMatch = output.match(/\b(\d{6})\b/)
        if (fallbackMatch && fallbackMatch[1]) {
          return fallbackMatch[1]
        }
      } catch (e) {
        // Continue polling on error
        console.error('[v0] Mailsy poll error:', e)
      }

      const elapsed = Date.now() - startTime
      if (elapsed >= timeout) break

      const remaining = timeout - elapsed
      if (remaining > 0) {
        const now = Date.now()
        while (Date.now() - now < Math.min(pollInterval, remaining)) {
          // Busy wait
        }
      }
    }

    return null
  } catch (error) {
    console.error('[v0] Mailsy OTP extraction error:', error)
    return null
  }
}
