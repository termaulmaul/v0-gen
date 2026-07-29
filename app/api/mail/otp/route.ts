import { waitForMailsyOTP } from '@/lib/mailtm'

export async function POST(req: Request) {
  try {
    const { timeout } = await req.json()
    const otp = waitForMailsyOTP(timeout || 60000)
    return Response.json({ otp })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to get OTP' },
      { status: 500 }
    )
  }
}
