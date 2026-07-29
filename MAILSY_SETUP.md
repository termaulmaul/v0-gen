# Mailsy OTP Extraction Guide

Since `mailsy m` is an interactive command that requires terminal interaction, you need to run it manually on your macOS while the Playwright automation is running.

## How It Works

1. **Playwright automation** opens Chrome, navigates to `vercel.com/signup/v0`, and fills your Mailsy email
2. You manually trigger OTP extraction by running `mailsy m` in your macOS terminal
3. Copy the OTP code from the Mailsy output
4. Paste it back into the webapp to complete verification

## Step-by-Step Workflow

### 1. Start the Webapp Autopilot

```bash
# In your terminal (at /vercel/share/v0-project)
npm run dev
```

Navigate to http://localhost:3000 and enable autopilot. The Playwright browser will:
- Launch Chrome
- Navigate to vercel.com/signup/v0
- Auto-fill your Mailsy email
- Display waiting for OTP

### 2. Extract OTP from Mailsy (in another macOS terminal)

```bash
# In a new terminal window
mailsy m
```

You'll see an interactive menu showing your emails. Look for the Vercel signup code email. Example output:

```
? Select an email
  1. Some other email - From: sender@example.com
❯ 2. 255578 is your Vercel sign up code - From: registration@vercel.com
```

The OTP code (e.g., `255578`) appears directly in the email subject line.

### 3. Input OTP into Webapp

The OTP code you see in the Mailsy output will be:
- Automatically filled into the webapp if you copy-paste it
- Or the webapp terminal log will show it's waiting for verification
- Simply trigger the OTP input action in the webapp

## Alternative: Export Cookies from Playwright

Once Playwright completes the signup, Vercel session cookies will be captured and displayed in the webapp under "Auth Metadata (Cookies)" section with a copy button.

## Troubleshooting

- **`mailsy m` shows "No Emails"**: The Vercel registration email hasn't arrived yet. Wait a few seconds and try again.
- **`mailsy d && mailsy g` fails**: Run `mailsy me` to check your current account status
- **Wrong email in Playwright**: Edit the email in the webapp or restart autopilot to create a new Mailsy account

## API Endpoints

- `/api/mail/create` - Creates new Mailsy account
- `/api/mail/otp` - Polls for OTP (currently mocked - use manual `mailsy m` instead)
- `/api/automation/browser` - Controls Playwright browser (launch/close)
- `/api/automation/signup` - Runs signup automation (navigate/fill/verify)
