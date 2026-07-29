# Vercel Auth Automator - Playwright + Mailsy Workflow

This app automates Vercel v0 signup using Playwright for browser automation + Mailsy CLI for temp email. Run locally on macOS only.

## Prerequisites

```bash
# Install Mailsy CLI
npm install -g mailsy

# Verify Mailsy works
mailsy --version
mailsy me  # Check current account
```

## Installation

```bash
cd /path/to/v0-gen
pnpm install
pnpm exec playwright install chromium
```

## Complete Workflow (Two Terminals)

### Terminal 1: Start Dev Server

```bash
npm run dev  # or: bun run dev
```

Opens http://localhost:3000

### Terminal 2: Ready for Manual OTP Extraction

Keep this terminal open. When the webapp shows "Waiting for OTP", you'll run `mailsy m` here.

### Browser: Enable Autopilot

1. Open http://localhost:3000
2. Click **AUTO-PILOT** toggle to start

**Playwright automation will automatically:**
- Launch Chrome browser (visible on screen)
- Navigate to `https://vercel.com/signup/v0`
- Auto-fill your Mailsy email address
- Click "Continue with Email" button
- Wait for OTP input screen

**Terminal log will show:**
```
[BROWSER: BROWSER] Launching Chromium...
[BROWSER: NAV] Navigating to https://vercel.com/signup/v0...
[BROWSER: INPUT] Filling email field with: abc123@web-library.net
[BROWSER: CLICK] Continue button clicked
[BROWSER: WAIT] OTP input appeared
[MAILSY] Run "mailsy m" in your macOS terminal to extract OTP
[MAILSY] Copy the 6-digit code (e.g., 255578 from email subject)
```

### Manual: Extract OTP from Mailsy

When you see the "Run mailsy m" message in the webapp terminal:

**In Terminal 2, run:**
```bash
mailsy m
```

**You'll see output like:**
```
? Select an email
  1. Some promotional email - From: sender@example.com
❯ 2. 255578 is your Vercel sign up code - From: registration@vercel.com
  3. Another email
```

The OTP code (e.g., `255578`) is shown in the email subject line.

### Browser: Submit OTP

The webapp is waiting for the OTP. The workflow will:
- Display the OTP input screen in Playwright Chrome
- Auto-fill the 6-digit code
- Submit verification
- Capture auth cookies

## What Gets Captured

**Auth Metadata (Cookies)** section will display:
- `anon_session_id` - Anonymous session
- `user_session` - Authenticated session token
- `v0-has-signed-in` - Sign-in flag
- Other v0 app cookies

**Copy button available** to copy all cookies as JSON array for use in other requests.

## File Locations

- **Playwright automation**: `/lib/playwright-automation.ts`
- **Browser API routes**: `/app/api/automation/browser`
- **Signup API routes**: `/app/api/automation/signup`
- **Mailsy CLI wrapper**: `/lib/mailtm.ts`
- **Mail API routes**: `/app/api/mail/create` and `/app/api/mail/otp`

## Terminal Log Legend

- `[BROWSER: ...]` - Playwright Chrome automation
- `[MAILSY ...]` - Instructions for manual `mailsy m`
- `[REQ]` - Starting operation
- `[RES]` / `[OK]` - Success
- `[ERR]` / `[ERROR]` - Failure
- `[CMD]` - CLI command execution
- `[SYS]` - System event

## Troubleshooting

**Chrome doesn't open:**
- Verify Playwright installed: `pnpm exec playwright install chromium`
- Check macOS has Chrome/Chromium available

**Mailsy m shows "No Emails":**
- Email may not have arrived yet, wait 5-10 seconds
- Run again: `mailsy m`
- Check your spam folder

**OTP not auto-filling:**
- Check Chrome window - it may be behind other windows
- Manually enter the 6-digit code you see in `mailsy m` output
- Refresh and try again

**Build errors:**
```bash
pnpm clean
pnpm install
pnpm build
```
