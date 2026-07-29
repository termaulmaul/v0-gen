# Quick Start - 60 Seconds

## Setup (One Time)

```bash
npm install -g mailsy
pnpm install
pnpm exec playwright install chromium
```

## Run

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
# Keep ready - will use later for: mailsy m
```

**Browser:**
1. Open http://localhost:3000
2. Click AUTO-PILOT toggle
3. Watch Chrome browser open and navigate to Vercel signup
4. Chrome will auto-fill your Mailsy email and click "Continue with Email"

## When "Waiting for OTP" appears in webapp terminal

**Terminal 2:**
```bash
mailsy m
```

**Copy the 6-digit code** from email subject (e.g., "255578 is your Vercel sign up code")

**App will auto-fill and submit OTP** → Cookies captured in "Auth Metadata" section

## Output

```
STD_OUT // RECOVERY_LOG
[BROWSER: BROWSER] Launching Chromium...
[BROWSER: NAV] Navigating to https://vercel.com/signup/v0...
[BROWSER: INPUT] Filling email field with: abc123@web-library.net
[BROWSER: CLICK] Continue button clicked
[MAILSY] Run "mailsy m" in your macOS terminal to extract OTP
[MAILSY] Copy the 6-digit code (e.g., 255578 from email subject)
→ Run mailsy m now ↓
[BROWSER: WAIT] OTP input appeared
[BROWSER: OTP] Filling OTP code: 255578
[BROWSER: OTP] Verification complete
[OK] Auth cookies captured
```

## Copy Cookies

Scroll down to "Auth Metadata (Cookies)" section → Click **📋 COPY_COOKIES_JSON** button
