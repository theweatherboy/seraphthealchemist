import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { buildChartContext, generateChartAnswer, parseMessages } from '@/lib/birth-chart-assistant';

export const runtime = 'nodejs';
export const maxDuration = 60;
const headers = { 'Cache-Control': 'private, no-store' };
// Per-instance guard, not a distributed quota. Configure host-level limits for public scale.
const requests = new Map<string, { count: number; expires: number }>();
let active = 0;
function reply(error: string, status: number) { return NextResponse.json({ error }, { status, headers }); }

export async function GET() {
  return NextResponse.json({ available: Boolean(process.env.GROQ_API_KEY?.trim()) }, { headers });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return reply('Please use the assistant on this website.', 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply('Expected a JSON request.', 415);
  if (!process.env.GROQ_API_KEY?.trim()) return reply('The AI assistant is not connected yet. Please try again later.', 503);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const identity = createHash('sha256').update(ip).digest('hex');
  const now = Date.now();
  for (const [key, entry] of requests) if (entry.expires <= now) requests.delete(key);
  const entry = requests.get(identity) ?? { count: 0, expires: now + 600000 };
  if (entry.count >= 12 || active >= 4 || requests.size >= 5000) return reply('Please wait a few minutes before asking another question.', 429);
  entry.count += 1;
  requests.set(identity, entry);

  let messages, context;
  try {
    // Enforce the actual streamed body limit, including requests without Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return reply('Please enter a question.', 400);
    const decoder = new TextDecoder();
    let content = '', size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1_000_000) { await reader.cancel(); return reply('The request is too large. Please start a new conversation.', 413); }
      content += decoder.decode(value, { stream: true });
    }
    content += decoder.decode();
    const payload = JSON.parse(content);
    messages = parseMessages(payload?.messages);
    context = buildChartContext(payload.context, messages.filter(message => message.role === 'user').slice(-2).map(message => message.content).join(' '));
  } catch (error) { return reply(error instanceof SyntaxError ? 'The request could not be read.' : error instanceof Error ? error.message : 'Invalid request.', 400); }

  if (active >= 4) return reply('The assistant is busy. Please try again shortly.', 429);
  active += 1;
  try {
    const answer = await generateChartAnswer(messages, context, { apiKey: process.env.GROQ_API_KEY, model: process.env.GROQ_CHAT_MODEL, signal: AbortSignal.any([request.signal, AbortSignal.timeout(45000)]) });
    return NextResponse.json({ answer }, { headers });
  } catch (error) {
    return reply(error instanceof Error && error.name !== 'TimeoutError' && error.name !== 'AbortError' ? error.message : 'The assistant took too long to respond. Please try again.', 502);
  } finally { active -= 1; }
}
