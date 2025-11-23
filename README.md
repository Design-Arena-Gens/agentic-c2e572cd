# Agentic Meta Responder (Facebook & Instagram)

Automated agent that replies to Facebook Messenger messages, Facebook comments, Instagram DMs, and Instagram comments via Meta Webhooks, built with Next.js and deployable to Vercel.

## Features
- Auto-replies to:
  - Facebook Page messages (Messenger)
  - Facebook comments (on subscribed Pages)
  - Instagram DMs (Business/Creator accounts)
  - Instagram comments
- Webhook verification endpoint
- Simple dashboard with live event logs
- Configuration via environment variables

## Environment variables
Copy `.env.example` to Vercel Project Environment Variables (or `.env.local` for local dev):

- `META_VERIFY_TOKEN`: Random string you choose for webhook verification
- `META_PAGE_ACCESS_TOKEN`: Facebook Page access token with required permissions
- `META_IG_ACCESS_TOKEN`: Instagram User access token (optional; falls back to page token if available)
- `META_API_VERSION`: Defaults to `v19.0`
- `AGENT_GREETING`: Optional greeting prefix
- `AGENT_SIGNATURE`: Optional signature suffix

## Run locally
```bash
npm install
npm run dev
```

Webhook will be available at:
- `GET/POST /api/webhook/meta`

## Deploy to Vercel
```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-c2e572cd
```

After deploy, set the webhook URL in Meta App Dashboard to:
- `https://agentic-c2e572cd.vercel.app/api/webhook/meta`

## Meta Setup (High-level)
1. Create a Meta App (Facebook Developer)
2. Add:
   - Messenger
   - Webhooks (Page / Instagram)
3. Generate a Page Access Token with permissions:
   - `pages_manage_metadata`, `pages_messaging`, `pages_manage_engagement`, `pages_read_engagement`
4. For Instagram Messaging/Comments:
   - Connect your IG business account to the Facebook Page
   - Grant `instagram_basic`, `instagram_manage_messages`, `instagram_manage_comments`
5. Subscribe the webhook:
   - Callback URL: `https://agentic-c2e572cd.vercel.app/api/webhook/meta`
   - Verify Token: your `META_VERIFY_TOKEN`
   - Fields: 
     - Page: `messages`, `feed`
     - Instagram: `messages`, `comments`

## Notes
- This demo keeps logs in-memory for display; on serverless this is ephemeral.
- Ensure your tokens are valid and the app/page/account is in Live Mode if needed.
