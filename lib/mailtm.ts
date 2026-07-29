const API_URL = 'https://api.mail.tm'

export interface MailTMAccount {
  address: string
  password: string
  token: string
}

function generateRandomString(length = 10): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  return result
}

export async function getAvailableDomains(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/domains`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    const domains = Array.isArray(data) ? data : data['hydra:member'] || []
    return domains.map((d: any) => d.domain).filter(Boolean)
  } catch (error) {
    throw new Error(`Failed to fetch domains: ${error}`)
  }
}

export async function createMailTMAccount(): Promise<MailTMAccount> {
  try {
    const domains = await getAvailableDomains()
    if (!domains.length) throw new Error('No available domains')

    const domain = domains[0]
    const address = `${generateRandomString(8)}@${domain}`
    const password = `Xq9!${generateRandomString(12)}#Z`

    // Create account
    const createRes = await fetch(`${API_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password }),
    })

    if (!createRes.ok) throw new Error(`Failed to create account: ${createRes.status}`)

    // Get token
    const tokenRes = await fetch(`${API_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, password }),
    })

    if (!tokenRes.ok) throw new Error(`Failed to get token: ${tokenRes.status}`)

    const tokenData = await tokenRes.json()
    const token = tokenData.token

    return { address, password, token }
  } catch (error) {
    throw new Error(`MailTM account creation failed: ${error}`)
  }
}

export async function waitForOTP(token: string, timeout = 60000): Promise<string | null> {
  const startTime = Date.now()
  const pollInterval = 3000

  while (Date.now() - startTime < timeout) {
    try {
      const res = await fetch(`${API_URL}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const messages = Array.isArray(data) ? data : data['hydra:member'] || []

      if (messages.length > 0) {
        const msgId = messages[0].id
        const otp = await extractOTP(token, msgId)
        if (otp) return otp
      }
    } catch (error) {
      console.error('Poll error:', error)
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval))
  }

  return null
}

async function extractOTP(token: string, msgId: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/messages/${msgId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    const content = data.text || ''

    const match = content.match(/code=(\d{6})/) || content.match(/\b(\d{6})\b/)
    return match ? match[1] : null
  } catch (error) {
    console.error('Extract OTP error:', error)
    return null
  }
}
