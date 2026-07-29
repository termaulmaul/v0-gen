import { createMailTMAccount } from '@/lib/mailtm'

export async function POST() {
  try {
    const account = await createMailTMAccount()
    return Response.json(account)
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create mail account' },
      { status: 500 }
    )
  }
}
