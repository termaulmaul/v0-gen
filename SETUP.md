# Vercel v0 Signup Automation - Fully Automatic

Automates complete Vercel v0 signup workflow using Playwright Chrome + Mailsy CLI. Completely hands-off once started.

## Prerequisites

Install Mailsy CLI globally:

```bash
# Via npm
npm install -g mailsy

# Or via bun
bun add -g mailsy

# Or via pnpm
pnpm add -g mailsy

# Verify installation
mailsy --help
```

## Installation

```bash
cd /path/to/v0-gen
pnpm install
pnpm exec playwright install chromium
```

## Run Locally (Fully Automatic)

### Single Terminal

```bash
npm run dev
```

Opens http://localhost:3000

### Browser: Click AUTO-PILOT

1. Open http://localhost:3000
2. Click **AUTO-PILOT** toggle
3. Watch the fully automated workflow execute:

**Automatically will:**
- Create temporary Mailsy email (e.g., `7iyzuo@web-library.net`)
- Launch visible Chrome browser
- Navigate to `https://vercel.com/signup/v0`
- Auto-fill your email
- Click "Continue with Email"
- Wait for verification email
- **Extract 6-digit OTP automatically** (3-5 seconds)
- Fill OTP into browser
- Submit verification
- Capture authentication cookies

**Terminal log shows real-time progress:**
```
[11:30:45] REQ: Mailsy account creation via CLI...
[11:30:46] RES: Created 7iyzuo@web-library.net
[11:30:47] REQ: Launching Playwright browser context...
[11:30:50] BROWSER: Chrome launched
[11:30:55] BROWSER: Navigating to https://vercel.com/signup/v0
[11:31:00] BROWSER: Email filled and button clicked
[11:31:03] POLL: Checking Mailsy inbox for OTP (timeout: 60s)...
[11:31:06] RES: OTP extracted -> 255578
[11:31:15] REQ: Injecting 255578 to browser...
[11:31:20] RES: OTP verification submitted
[11:31:22] RES: Cookies cached to session
[11:31:25] RES: CLI Auth Complete
```

**Total time: ~45-60 seconds** from start to complete signup

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

## Workflow Stages

1. **Mailsy Account Creation** - Creates temporary email via `mailsy d && mailsy g`
2. **Browser Launch** - Playwright launches Chrome with Vercel signup page
3. **Email Auto-Fill** - Fills email and clicks "Continue with Email"
4. **OTP Poll** - Polls Mailsy inbox automatically, extracts 6-digit code
5. **OTP Verification** - Fills OTP and submits to Vercel
6. **Cookie Capture** - Extracts auth cookies to **AUTH METADATA** panel
7. **Completion** - Workflow finished, ready to use

## Cookie Export

All cookies captured and displayed in **AUTH METADATA (COOKIES)** section:

- Click **📋 COPY_COOKIES_JSON** to copy all cookies as JSON array
- Format includes all properties: domain, expiration, httpOnly, sameSite, secure, value, etc.
- Ready to use with curl, requests, or Vercel CLI

## Troubleshooting

**"Playwright browser failed to launch"**
- Running in cloud? This requires local macOS with Chrome
- Verify: `pnpm exec playwright install chromium`

**"No OTP found in email (timeout)"**
- Verification email didn't arrive within 60 seconds
- Possible causes: Vercel rate-limiting, network issue
- Try again with new email

**Chrome window doesn't show**
- Chrome may be behind terminal window
- Alt+Tab to find it or minimize terminal
- Ensure Playwright has display access

**Build fails**
```bash
pnpm clean
pnpm install
pnpm build
```

**Mailsy CLI issues**
```bash
# Check installation
which mailsy
mailsy --version

# Test manually
mailsy d && mailsy g  # Delete + create account
mailsy m              # List emails
mailsy me             # Show account details
mailsy d              # Delete account
```
