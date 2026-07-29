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
    // Step 1: Delete existing account (ignore errors if no account exists)
    try {
      execSync('mailsy d', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      console.log('[v0] Mailsy: Deleted old account')
    } catch (deleteError) {
      // It's ok if delete fails - account might not exist yet
      console.log('[v0] Mailsy: No old account to delete (or already deleted)')
    }

    // Step 2: Generate new account
    console.log('[v0] Mailsy: Generating new account...')
    const output = execSync('mailsy g', { encoding: 'utf-8' })

    // Parse output: "Account created: email@domain.net"
    const match = output.match(/Account created:\s*(\S+@\S+)/)
    if (!match || !match[1]) {
      throw new Error(`Could not parse email from output: ${output}`)
    }

    const address = match[1].trim()
    console.log(`[v0] Mailsy: Account created successfully: ${address}`)
    return { address }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`[v0] Mailsy account creation failed: ${errorMsg}`)
    throw new Error(`Mailsy account creation failed: ${errorMsg}`)
  }
}

/**
 * Wait for OTP email and extract the code
 * Polls mailsy m to parse OTP from interactive menu output
 * @param timeout - Timeout in milliseconds (default: 60s)
 * @returns OTP code (6 digits) if found, null otherwise
 */
export function waitForMailsyOTP(timeout = 60000): string | null {
  try {
    const startTime = Date.now()
    const pollInterval = 3000
    let pollAttempt = 0

    while (Date.now() - startTime < timeout) {
      pollAttempt++
      try {
        // Run mailsy m with timeout to capture the email list menu output
        const result = spawnSync('bash', ['-c', 'timeout 2 mailsy m 2>&1 || true'], {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        })

        const output = result.stdout || result.stderr || ''
        const elapsed = Math.floor((Date.now() - startTime) / 1000)

        // Check if we got any useful output
        if (!output) {
          console.log(`[v0] Mailsy poll #${pollAttempt} (${elapsed}s): No output from mailsy m`)
          // Wait before trying again
          const now = Date.now()
          while (Date.now() - now < Math.min(pollInterval, timeout - elapsed * 1000)) {
            // Busy wait
          }
          continue
        }

        // Check if no emails received yet
        if (output.includes('No Emails') || output.includes('No messages')) {
          console.log(`[v0] Mailsy poll #${pollAttempt} (${elapsed}s): No emails yet`)
          // Wait before trying again
          const now = Date.now()
          while (Date.now() - now < Math.min(pollInterval, timeout - elapsed * 1000)) {
            // Busy wait
          }
          continue
        }

        // Look for email list pattern (should contain "From:")
        if (!output.includes('From:')) {
          console.log(`[v0] Mailsy poll #${pollAttempt} (${elapsed}s): Email list not fully loaded`)
          // Wait before trying again
          const now = Date.now()
          while (Date.now() - now < Math.min(pollInterval, timeout - elapsed * 1000)) {
            // Busy wait
          }
          continue
        }

        // Parse OTP from mailsy output
        // Format: "N. XXXXXX is your Vercel sign up code - From: registration@vercel.com"
        const lines = output.split('\n')
        for (const line of lines) {
          // Primary pattern: "6-digit is your" (most reliable)
          const codeMatch = line.match(/\b(\d{6})\s+is\s+your/)
          if (codeMatch && codeMatch[1]) {
            console.log(`[v0] Mailsy poll #${pollAttempt} (${elapsed}s): OTP found: ${codeMatch[1]}`)
            return codeMatch[1]
          }
        }

        // Fallback: look for any 6-digit number if primary pattern didn't match
        const fallbackMatch = output.match(/\b(\d{6})\b/)
        if (fallbackMatch && fallbackMatch[1]) {
          console.log(`[v0] Mailsy poll #${pollAttempt} (${elapsed}s): Possible OTP found (fallback): ${fallbackMatch[1]}`)
          return fallbackMatch[1]
        }

        console.log(`[v0] Mailsy poll #${pollAttempt} (${elapsed}s): Email list found but no OTP pattern matched`)
      } catch (e) {
        console.error(`[v0] Mailsy poll #${pollAttempt} error:`, e instanceof Error ? e.message : String(e))
      }

      // Check if timeout reached
      const elapsed = Date.now() - startTime
      if (elapsed >= timeout) {
        console.log(`[v0] Mailsy: Timeout reached (${Math.floor(elapsed / 1000)}s)`)
        break
      }

      // Wait before next poll
      const remaining = timeout - elapsed
      if (remaining > 0) {
        const now = Date.now()
        while (Date.now() - now < Math.min(pollInterval, remaining)) {
          // Busy wait
        }
      }
    }

    console.log(`[v0] Mailsy: OTP not found within timeout`)
    return null
  } catch (error) {
    console.error('[v0] Mailsy OTP extraction error:', error instanceof Error ? error.message : String(error))
    return null
  }
}
