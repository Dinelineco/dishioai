import { NextRequest } from 'next/server';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ?? '';

export async function POST(req: NextRequest) {
    const { messages, client_uuid, am_id } = await req.json();
    const lastMessage = messages?.[messages.length - 1]?.content ?? '';

    // Fire-and-forget to n8n (non-blocking analytics/routing)
    // This is separate from the streaming response
    if (N8N_WEBHOOK_URL) {
        fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: lastMessage,
                client_uuid: client_uuid ?? null,
                am_id: am_id ?? null,
                messages,
            }),
        }).catch(() => { }); // non-blocking, ignore errors
    }

    // --- Stub response when n8n not yet configured ---
    // Replace this block with a real n8n streaming proxy once your webhook is live.
    const stubText = N8N_WEBHOOK_URL
        ? `[Webhook sent to n8n] Message: "${lastMessage}" | Client: ${client_uuid ?? 'none'} | AM: ${am_id ?? 'none'}\n\nWaiting for n8n to stream a response… (configure N8N_WEBHOOK_URL to enable full streaming).`
        : `**Answrd Content Brain** is ready.\n\nConfigure \`N8N_WEBHOOK_URL\` in \`.env.local\` to connect to your n8n agent. Your payload has been logged:\n\n\`\`\`json\n${JSON.stringify({ message: lastMessage, client_uuid, am_id }, null, 2)}\n\`\`\``;

    // Return as a streamed text response compatible with Vercel AI SDK useChat
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            // Vercel AI SDK data stream format: "0:" prefix for text chunks
            const chunks = stubText.split(' ');
            let i = 0;
            const interval = setInterval(() => {
                if (i < chunks.length) {
                    const word = (i === 0 ? chunks[i] : ' ' + chunks[i]);
                    controller.enqueue(encoder.encode(`0:${JSON.stringify(word)}\n`));
                    i++;
                } else {
                    controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`));
                    controller.close();
                    clearInterval(interval);
                }
            }, 30);
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Vercel-AI-Data-Stream': 'v1',
        },
    });
}
