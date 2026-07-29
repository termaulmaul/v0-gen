'use client'

import { SessionState } from '@/app/page'

interface ContextPanelsProps {
  session: SessionState
}

export default function ContextPanels({ session }: ContextPanelsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-3">
          Identity Context
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between border-b border-zinc-900 pb-2">
            <span className="text-zinc-600">Email</span>
            <span>{session.email || 'null'}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-900 pb-2">
            <span className="text-zinc-600">OTP Code</span>
            <span className="font-bold text-blue-400 tracking-widest">
              {session.code || '------'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-3">
          Auth Metadata (Cookies)
        </h3>
        {session.cookies ? (
          <>
            <div className="flex-1 overflow-y-auto mb-3">
              <div className="text-[9px] font-mono text-zinc-400 space-y-1">
                {(() => {
                  try {
                    const cookies = JSON.parse(session.cookies)
                    return (
                      <>
                        <div className="text-blue-400">[</div>
                        {Array.isArray(cookies) &&
                          cookies.map((cookie: any, idx: number) => (
                            <div key={idx} className="pl-2">
                              <span className="text-yellow-400">{'{'}</span>
                              <span className="text-green-400"> name: </span>
                              <span className="text-cyan-400">
                                "{cookie.name}"
                              </span>
                              {cookie.value && (
                                <>
                                  <span className="text-green-400">, value: </span>
                                  <span className="text-cyan-400">
                                    "
                                    {cookie.value.substring(0, 20)}
                                    {cookie.value.length > 20 ? '...' : ''}
                                    "
                                  </span>
                                </>
                              )}
                              <span className="text-yellow-400">
                                {'}'}
                                {idx < cookies.length - 1 ? ',' : ''}
                              </span>
                            </div>
                          ))}
                        <div className="text-blue-400">]</div>
                      </>
                    )
                  } catch (e) {
                    return (
                      <div className="text-red-400">
                        {session.cookies.substring(0, 60)}...
                      </div>
                    )
                  }
                })()}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(session.cookies!)}
              className="text-[9px] bg-blue-900/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-900/40 transition-colors"
            >
              📋 COPY_COOKIES_JSON
            </button>
          </>
        ) : (
          <div className="text-[10px] text-zinc-500">
            Waiting for verification...
          </div>
        )}
      </div>
    </section>
  )
}
