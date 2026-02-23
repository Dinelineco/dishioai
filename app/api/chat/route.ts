import { NextRequest } from 'next/server';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ?? '';

export async function POST(req: NextRequest) {
    const { messages, client_code, am_id } = await req.json();
    const lastMessage = messages?.[messages.length - 1]?.content ?? '';

    if (!N8N_WEBHOOK_URL) {
        return new Response('N8N_WEBHOOK_URL not configured', { status: 500 });
    }

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: lastMessage,
                client_code: client_code ?? null,
                am_id: am_id ?? null
            }),
        });

        if (!response.ok) {
            throw new Error(`n8n responded with ${response.status}`);
        }

        const data = await response.json();
        const answer = data.answer || "I'm sorry, I couldn't generate a response.";
        const sources = data.sources || [];

        // Stream the answer back to the frontend in Vercel AI SDK format
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                // Send the answer as a text chunk
                // We split it to simulate streaming if it's long, or just send it at once
                controller.enqueue(encoder.encode(`0:${JSON.stringify(answer)}\n`));

                // Send metadata/sources via the data stream (8:)
                if (sources.length > 0) {
                    controller.enqueue(encoder.encode(`8:${JSON.stringify({ sources })}\n`));
                }

                controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`));
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Vercel-AI-Data-Stream': 'v1',
            },
        });
    } catch (error) {
        console.error('n8n proxy error:', error);
        return new Response('Error connecting to n8n', { status: 500 });
    }
}
