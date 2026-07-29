# Quick Start - Fully Automatic

## Setup (One Time)

```bash
# Install Mailsy CLI globally
npm install -g mailsy

# Install project dependencies
pnpm install

# Install Playwright browsers
pnpm exec playwright install chromium
```

## Run (Single Terminal)

```bash
npm run dev
```

Open http://localhost:3000 and click **AUTO-PILOT** → Done! ✓

---

## What Happens

```
[11:30:45] REQ: Mailsy account creation via CLI...
[11:30:46] RES: Created 7iyzuo@web-library.net

[11:30:47] REQ: Launching Playwright browser context...
[11:30:50] BROWSER: Chrome launched successfully
[11:30:55] BROWSER: Navigating to https://vercel.com/signup/v0
[11:31:00] BROWSER: Email filled and button clicked

[11:31:03] POLL: Checking Mailsy inbox for OTP (timeout: 60s)...
[11:31:06] RES: OTP extracted -> 255578

[11:31:15] REQ: Injecting 255578 to browser...
[11:31:20] RES: OTP verification submitted
[11:31:22] RES: Cookies cached to session
[11:31:25] RES: CLI Auth Complete
```

**Total: 45-60 seconds** - All automatic, no manual steps needed!

---

## Get Cookies

Scroll to **AUTH METADATA (COOKIES)** panel → Click **📋 COPY_COOKIES_JSON**

```json
[
  {
    "name": "anon_session_id",
    "value": "Wu8oJqHJJeVBc7utmR8ctZpcRmu1Mhq0",
    "domain": "v0.app",
    "httpOnly": false,
    "secure": false
  },
  {
    "name": "user_session",
    "value": "eyJhbGciOiJkaXI...",
    "domain": "v0.app",
    "httpOnly": true,
    "secure": true
  }
]
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| Chrome not opening | `pnpm exec playwright install chromium` |
| Mailsy not found | `npm install -g mailsy` |
| No OTP in 60s | Try again (Vercel may rate-limit) |
| Build fails | `pnpm clean && pnpm install` |

---

## Manual Mailsy (Optional Testing)

```bash
mailsy d && mailsy g    # Delete old + create new account
mailsy me               # Show current account details
mailsy m                # List emails in inbox
mailsy d                # Delete account
```
