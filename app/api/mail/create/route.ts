import { createMailsyAccount } from '@/lib/mailtm'

export async function POST() {
  try {
    const account = createMailsyAccount()
    return Response.json(account)
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create mail account' },
      { status: 500 }
    )
  }
}
