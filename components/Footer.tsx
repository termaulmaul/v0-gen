'use client'

export default function Footer() {
  return (
    <footer className="mt-8 pt-4 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600">
      <div className="flex gap-4">
        <span>BUN_RUNTIME</span>
        <span>PLAYWRIGHT_v1.4</span>
        <span>MAILSY_CLI_INTEGRATED</span>
      </div>
      <div>PROD_READY // NO_DB_PERSISTENCE</div>
    </footer>
  )
}
