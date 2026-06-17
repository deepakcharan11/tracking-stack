import Anthropic from 'npm:@anthropic-ai/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
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

    const anthropicKey  = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
    const systemPrompt  = Deno.env.get('SYSTEM_PROMPT') ?? ''
    const mcpAuthToken  = Deno.env.get('P44_MCP_AUTH_TOKEN') ?? ''

    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const client = new Anthropic({ apiKey: anthropicKey })

    // ── MCP server definitions ─────────────────────────────────────────────
    // Claude will autonomously call these during the investigation.
    // Each server corresponds to one step in the troubleshooting workflow.
    const mcpServers = [
      {
        type: 'url',
        url:  'https://mcp.mgmt.project44.com/atlassian-mcp/mcp/',
        name: 'p44-atlassian',
        authorization_token: mcpAuthToken,
      },
      {
        type: 'url',
        url:  region === 'NA'
          ? 'https://mcp.mgmt.project44.com/observe-mcp-na/mcp'
          : 'https://mcp.mgmt.project44.com/observe-mcp-eu/mcp',
        name: region === 'NA' ? 'p44-observe-na' : 'p44-observe-eu',
        authorization_token: mcpAuthToken,
      },
      {
        type: 'url',
        url:  'https://mcp.mgmt.project44.com/snowflake-mcp/snowflake-mcp',
        name: 'p44-snowflake',
        authorization_token: mcpAuthToken,
      },
      {
        type: 'url',
        url:  'https://mcp.mgmt.project44.com/github-mcp/mcp',
        name: 'p44-github',
        authorization_token: mcpAuthToken,
      },
    ]

    const userMessage = `Please investigate the following shipment and run the full 6-step troubleshooting workflow:

Shipment UUID: ${uuid}
Region: ${region}

Run all steps (Atlassian → Observe → Snowflake → Datadog → GitHub → RCA).
Include the confidence score and NOTE section at the end.`

    // ── Stream with MCP tool use ───────────────────────────────────────────
    const stream = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 16000,
      stream:     true,
      system:     systemPrompt,
      // @ts-ignore — mcp_servers is supported via beta header
      mcp_servers: mcpServers,
      messages: [{ role: 'user', content: userMessage }],
      // Enable MCP beta
      betas: ['mcp-client-2025-04-04'],
    } as Parameters<typeof client.messages.create>[0])

    const encoder = new TextEncoder()

    const body = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            // Stream text deltas
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
            // Notify browser when Claude calls an MCP tool
            if (event.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
              const toolName = event.content_block.name ?? ''
              const stepMsg  = `\n\n> ⚙️ **Calling tool:** \`${toolName}\`…\n\n`
              controller.enqueue(encoder.encode(stepMsg))
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
        'anthropic-beta': 'mcp-client-2025-04-04',
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
