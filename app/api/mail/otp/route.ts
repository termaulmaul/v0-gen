import { waitForMailsyOTP } from '@/lib/mailtm'

export async function POST(req: Request) {
  try {
    const { address, timeout } = await req.json()
    if (!address) return Response.json({ error: 'Missing email address' }, { status: 400 })

    const otp = waitForMailsyOTP(address, timeout || 60000)
    return Response.json({ otp })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to get OTP' },
      { status: 500 }
    )
  }
}
