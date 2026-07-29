import { waitForOTP } from '@/lib/mailtm'

export async function POST(req: Request) {
  try {
    const { token, timeout } = await req.json()
    if (!token) return Response.json({ error: 'Missing token' }, { status: 400 })

    const otp = await waitForOTP(token, timeout || 60000)
    return Response.json({ otp })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to get OTP' },
      { status: 500 }
    )
  }
}
