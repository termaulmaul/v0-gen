import type { Metadata, Viewport } from "next"
import { Geist_Mono } from "next/font/google"
import "./globals.css"

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Vercel Auth Automator",
  description:
    "Automated provisioning pipeline: temp mailbox, browser signup, OTP extraction, cookie capture and CLI handshake.",
}

export const viewport: Viewport = {
  themeColor: "#09090b",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistMono.variable} bg-background`}>
      <body className="font-mono antialiased">{children}</body>
    </html>
  )
}
