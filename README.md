# Shipment Tracking — project44

AI-powered shipment investigation tool. Two ways to use it:

---

## Option 1 — `/investigate` Slash Command (Recommended)

The fastest way. Open this repo in **Claude Code**, then type:

```
/investigate <UUID> <NA|EU>
```

Examples:
```
/investigate abc123-tenant-uuid NA
/investigate abc123-tenant-uuid EU
/investigate abc123-tenant-uuid NA CNWY LTL
```

Claude will immediately run the full 6-step investigation using your connected MCP tools:

| Step | Tool | What it checks |
|------|------|----------------|
| 1 | Jira + Confluence | Known tickets, runbooks |
| 2 | Observe NA/EU | Live API + server logs |
| 3 | Snowflake | Data layer validation |
| 4 | Datadog | Recent deployments, active incidents |
| 5 | GitHub | Code changes in last 14 days |
| 6 | RCA | Root cause + confidence score |

**Requirements:** Claude Code desktop app with p44 MCP servers connected (Atlassian, Observe NA/EU, Snowflake, Datadog, GitHub).

---

## Option 2 — Web App (Supabase + Claude API)

For teammates without Claude Code. Enter UUID + region in the browser and get the full investigation streamed back.

**Stack:** React + Vite + TypeScript + Tailwind CSS + Supabase Edge Functions + Claude AI

### Local development

```bash
npm install
cp .env.example .env   # fill in Supabase URL + anon key
npm run dev            # http://localhost:5173
```

### Deploy on Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Add secrets in Supabase Dashboard → Edge Functions → Secrets:
   - `ANTHROPIC_API_KEY` — your Anthropic API key
   - `SYSTEM_PROMPT` — paste the full contents of `CLAUDE.md` from the support-assistant repo
   - `P44_MCP_AUTH_TOKEN` — your p44 MCP auth token
3. Deploy the edge function:
   ```bash
   supabase functions deploy investigate
   ```
4. Share the web URL with your team

---

## Architecture

```
Option 1: Claude Code
  /investigate <uuid> <region>
       ↓
  .claude/commands/investigate.md (this repo)
       ↓
  MCP tools (Observe, Snowflake, Datadog, Jira, GitHub)

Option 2: Web App
  Browser (React + Vite)
       ↓
  Supabase Edge Function: investigate
       ↓
  Claude API (claude-sonnet-4-6) + MCP servers via beta
       ↓
  Streams RCA back to browser
```
