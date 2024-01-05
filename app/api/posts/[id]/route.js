import { kv } from '@vercel/kv'
import {NextRequest, NextResponse} from "next/server";


/*
curl http://localhost:3000/api/article/abc
*/
export async function GET (request, { params }){
  const { id } = params;
  const match = `comments:${id}*`;
  const [nextCursor, data] = await kv.scan(0, {match});
  const json = {
    id,
    match,
    nextCursor,
    data
  };
  console.log('json', {json});
  let values = [];
  for(const key of data){
    console.log('key', {key});
    const value = await kv.get(key);
    values.push({key, value});
  }
  console.log('values', {values});
  json.values = values;
  return NextResponse.json(json);
}

/*
curl -X POST http://localhost:3000/api/article/abc -H 'openai-conversation-id: abc' \
-H "Content-Type: application/json" -d \
'{"author": "John Doe", "content": "I agree"}'
*/

export async function POST(request, { params }) {
  const { id } = params;
  // generate a uid for the comment, 12 chars long
  const commentId = Math.random().toString(36).substring(2, 14);
  const body = await request.json();
  const key = `comments:${id}:${commentId}`;

  if (!body.author || typeof body.author !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid author' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.content || typeof body.content !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid content' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const now = Date.now();

  const data = {
    author: body.author,
    content: body.content,
    createdAt: now,
  };
  const dataString = JSON.stringify(data);

  await kv.set(key, dataString);
  const articleId = id.split(':')[1] || id;
  await kv.incr(`article-comments-count:${articleId}`);

  // Return a response to indicate success
  return new Response(JSON.stringify({ id: `${id}:${commentId}`, data }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
