import { launchBrowser, closeBrowser, getLogs, clearLogs } from '@/lib/playwright-automation'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'getLogs') {
      const logs = getLogs()
      return Response.json({ logs })
    } else if (action === 'clearLogs') {
      clearLogs()
      return Response.json({ success: true, message: 'Logs cleared' })
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { action } = await req.json()

    if (action === 'launch') {
      await launchBrowser()
      return Response.json({ success: true, message: 'Browser launched' })
    } else if (action === 'close') {
      await closeBrowser()
      return Response.json({ success: true, message: 'Browser closed' })
    } else if (action === 'getLogs') {
      const logs = getLogs()
      return Response.json({ logs })
    } else if (action === 'clearLogs') {
      clearLogs()
      return Response.json({ success: true, message: 'Logs cleared' })
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
