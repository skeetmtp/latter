import { kv } from '@vercel/kv'
import {NextRequest, NextResponse} from "next/server";


/*
curl -X POST http://localhost:3000/api/posts -H 'openai-conversation-id: abc' \
-H "Content-Type: application/json" -d \
'{"author": "John Doe", "message": "All my favorite tracing tools"}'
*/

export async function POST(request) {
  const body = await request.json();
  const id = request.headers.get('openai-conversation-id');

  if (!body.author || typeof body.author !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid author' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.message || typeof body.message !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid message' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const now = Date.now();

  const data = {
    author: body.author,
    message: body.message,
    createdAt: now,
  };
  const dataString = JSON.stringify(data);

  await kv.zadd('latter:posts', {score: now, member: id});
  await kv.set(`latter:post:${id}`, dataString);

  // Return a response to indicate success
  return new Response(JSON.stringify({ id, data }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
