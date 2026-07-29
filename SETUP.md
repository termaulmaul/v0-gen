# Vercel Auth Automator - Local Setup with Mailsy CLI

This project is designed to run locally on macOS and uses the Mailsy CLI for temporary email account creation and OTP polling.

## Prerequisites

### 1. Install Node.js
```bash
brew install node
```

### 2. Install Mailsy CLI
```bash
npm install -g mailsy
```

Verify installation:
```bash
mailsy --version
```

### 3. Configure Mailsy (if first time)
```bash
mailsy account setup
```

This will guide you through initial configuration.

## Installation

1. Clone or navigate to the project directory:
```bash
cd v0-project
```

2. Install dependencies:
```bash
npm install
```

## Running Locally

1. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

2. Open in your browser and enable "AUTO-PILOT" to start the workflow

## How It Works

The workflow automates the following steps using Mailsy CLI:

1. **Account Creation** - Creates a temporary email account via `mailsy account create`
2. **Email Polling** - Waits for incoming verification emails via `mailsy inbox read`
3. **OTP Extraction** - Parses the email content to extract 6-digit codes
4. **Status Tracking** - Displays real-time logs of all operations

## Terminal Output

When autopilot is enabled, you'll see terminal logs showing:
- `[OK]` - Successful operations
- `[CMD]` - CLI commands being executed
- `[SYS]` - System events
- `[ERROR]` - Any failures
- `[DEBUG]` - Detailed polling attempts

## Troubleshooting

### Mailsy CLI not found
Make sure you've installed it globally:
```bash
npm install -g mailsy
```

And that it's in your PATH:
```bash
which mailsy
```

### Email not received
- Wait a few seconds, the polling will continue for up to 60 seconds
- Check your Mailsy account manually: `mailsy inbox read --address your@email.com`
- Make sure the sending service has delivered the email to the temp address

### Build errors
If you get build errors, run:
```bash
npm run clean
npm install
npm run build
```

## Environment

This app is configured to run locally and uses:
- Next.js 16 with App Router
- React 19 with TypeScript
- Tailwind CSS v4
- Child process execution for CLI commands (Node.js `execSync`)

All API routes that interact with Mailsy are located in `/app/api/mail/`
