import {
  navigateToVercelSignup,
  fillEmailAndContinue,
  fillOTP,
} from '@/lib/playwright-automation'

export async function POST(req: Request) {
  try {
    const { action, email, otp } = await req.json()

    if (action === 'navigate') {
      await navigateToVercelSignup()
      return Response.json({ success: true, message: 'Navigated to signup' })
    } else if (action === 'fillEmail') {
      if (!email) return Response.json({ error: 'Missing email' }, { status: 400 })
      await fillEmailAndContinue(email)
      return Response.json({ success: true, message: 'Email submitted' })
    } else if (action === 'fillOTP') {
      if (!otp) return Response.json({ error: 'Missing OTP' }, { status: 400 })
      await fillOTP(otp)
      return Response.json({ success: true, message: 'OTP submitted' })
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
