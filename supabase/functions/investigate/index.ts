import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { uuid, region } = await req.json()

    if (!uuid || !region) {
      return new Response(
        JSON.stringify({ error: 'uuid and region are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey      = Deno.env.get('ANTHROPIC_API_KEY')
    const systemPrompt = Deno.env.get('SYSTEM_PROMPT') ?? ''

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const client = new Anthropic({ apiKey })

    const userMessage = `Please investigate the following shipment and run the full 6-step troubleshooting workflow:

Shipment UUID: ${uuid}
Region: ${region}

Start from Phase 0 — extract all available fields, then run Steps 1–6 (Atlassian → Observe → Snowflake → Datadog → GitHub → RCA). Include the confidence score and NOTE section at the end.`

    // Stream the response back
    const stream = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const encoder = new TextEncoder()

    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
