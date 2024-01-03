import { kv } from '@vercel/kv'
import {NextRequest, NextResponse} from "next/server";


/*
curl -X POST http://localhost:3000/api/article -H 'openai-conversation-id: abc' \
-H "Content-Type: application/json" -d \
'{"author": "John Doe", "link": "https://thume.ca/2023/12/02/tracing-methods/", "title": "All my favorite tracing tools"}'
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

  if (!body.link || typeof body.link !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid link' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.title || typeof body.title !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid title' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  body.points ??= 0;
  const now = Date.now();

  const data = {
    author: body.author,
    link: body.link,
    title: body.title,
    points: body.points,
    createdAt: now,
  };
  const dataString = JSON.stringify(data);

  await kv.zadd('articles', {score: now, member: id});
  await kv.set(`article:${id}`, dataString);
  await kv.set(`article-comments-count:${id}`, 0);
  await kv.del(`comments:${id}`);

  // Return a response to indicate success
  return new Response(JSON.stringify({ id, data }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
