# Shipment Tracking — project44

AI-powered shipment troubleshooting app. Enter a UUID and region, get a full 6-step RCA in seconds.

**Stack:** React + Vite + TypeScript + Tailwind CSS + Supabase Edge Functions + Claude AI

---

## Local development

```bash
npm install
cp .env.example .env   # fill in Supabase URL + anon key
npm run dev            # http://localhost:5173
```

---

## Deploy on Lovable

1. Go to [lovable.dev](https://lovable.dev) → **Import from GitHub**
2. Select `deepakcharan11/tracking-stack`
3. Connect your Supabase project
4. Add secrets in Supabase Dashboard → Edge Functions → Secrets:
   - `ANTHROPIC_API_KEY` — your Anthropic API key
   - `SYSTEM_PROMPT` — paste the full contents of `CLAUDE.md` from the support-assistant repo
5. Deploy the edge function: `supabase functions deploy investigate`
6. Lovable publishes a live URL — share with your team

---

## Architecture

```
Browser (React + Vite)
       ↓
Supabase Edge Function: investigate
       ↓
Claude API (claude-sonnet-4-6) — streams RCA
```

The `SYSTEM_PROMPT` secret holds the full 6-step troubleshooting workflow.
The API key never leaves the server.
