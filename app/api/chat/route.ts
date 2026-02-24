import { NextRequest } from 'next/server';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ?? '';

export async function POST(req: NextRequest) {
    const { messages, client_code, am_id } = await req.json();

    // AI SDK v6 sends messages with .parts instead of .content
    const lastMsg = messages?.[messages.length - 1];
    const lastMessage = lastMsg?.parts
        ?.filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('') ?? lastMsg?.content ?? '';

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

        // AI SDK v6 expects Server-Sent Events with UIMessageChunk JSON objects
        const textId = `text-${Date.now()}`;
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            start(controller) {
                const send = (obj: any) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
                };

                // Text start
                send({ type: 'text-start', id: textId });

                // Send answer in chunks for streaming effect
                const chunkSize = 50;
                for (let i = 0; i < answer.length; i += chunkSize) {
                    send({ type: 'text-delta', id: textId, delta: answer.slice(i, i + chunkSize) });
                }

                // Text end
                send({ type: 'text-end', id: textId });

                // Send sources as data part
                if (sources.length > 0) {
                    const dataId = `data-${Date.now()}`;
                    send({ type: 'data', id: dataId, data: [{ type: 'sources', value: sources }] });
                }

                // Finish
                send({ type: 'finish' });

                // Done marker
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('n8n proxy error:', error);
        return new Response('Error connecting to n8n', { status: 500 });
    }
}
