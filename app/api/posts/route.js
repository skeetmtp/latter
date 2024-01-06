import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from 'next/cache';
import { DateTime } from 'luxon';


async function getPosts() {
  const maxLoop = 10;
  const result = [];

  const posts = await kv.zrange('latter:posts', 0, maxLoop, { rev: true, withScores: true });
  //ex [ 'abc', 1702999636500, 'efg', 1702999662414 ]
  console.log("posts", posts);
  for (let i = 0; i < posts.length; i += 2) {
    const id = posts[i];
    const score = posts[i + 1];
    const key = `latter:post:${id}`;
    const article = await kv.get(key);
    result.push({ key, score, value: article });
  }

  console.log("result", result);

  const res = result.map((item) => {
    const createdAt = new Date(item.value.createdAt);
    const agoString = DateTime.fromJSDate(createdAt).toRelative();

    return {
      id: item.key,
      avatarUrl: "/placeholder.svg?height=40&width=40",
      author: item.value.author,
      handle: item.value.handle,
      time: agoString,
      message: [item.value.message],
    };

  });

  console.log("res", res);
  // return postsData;
  return res;
}

/*
 curl -X GET http://localhost:3000/api/posts
*/

export async function GET(req, res) {
  try {
    // Replace this with your method of fetching posts data
    const posts = await getPosts();

    console.log("posts", posts);
    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

/*
curl -X DELETE http://localhost:3000/api/posts
*/
export async function DELETE(request) {
  const apiKey = request.headers.get('x-api-key');
  if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  await kv.del("latter:posts");

  const keys = await kv.keys("latter:post:*");
  keys.forEach(async (key) => {
    await kv.del(key);
  });
  return NextResponse.json({}, { status: 200 });
}

/*
curl -X POST http://localhost:3000/api/posts -H 'openai-conversation-id: abc' \
-H "Content-Type: application/json" -d \
'{"author": "John Doe", "message": "All my favorite tracing tools"}'
*/

export async function POST(request) {
  const body = await request.json();
  const id = request.headers.get('openai-conversation-id');
  const apiKey = request.headers.get('x-api-key');

  if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

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

  await kv.zadd('latter:posts', { score: now, member: id });
  await kv.set(`latter:post:${id}`, dataString);

  // Return a response to indicate success
  return new Response(JSON.stringify({ id, data }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
