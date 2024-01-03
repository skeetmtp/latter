import React from 'react';
import { kv } from '@vercel/kv'
import { cache } from 'react'
import { unstable_noStore as noStore } from 'next/cache';
import { DateTime } from 'luxon';

// Define your JSON object
const pageContent = {
  links: [
    { href: "https://hnsim.vercel.app/", text: "Hacker News Sim", isBold: true },
    { href: "#", text: "new" },
    { href: "#", text: "threads" },
    { href: "#", text: "past" },
    { href: "#", text: "comments" },
    { href: "#", text: "ask" },
    { href: "#", text: "show" },
    { href: "#", text: "jobs" },
    { href: "https://chat.openai.com/g/g-ycNVwVcX9-hnsim", text: "submit" },
  ]
  ,
  userInfo: {
    username: 'John Doe',
    points: 123,
    logoutLink: '#',
  },
  post:
    {
      title: 'My title',
      link: 'https://news.ycombinator.com/',
      domain: 'ycombinator.com',
      author: 'johndoe',
      points: 12,
      actions: {
        'hide': { link: '#'},
        'past': { link: '#'},
        'favorite': {link: '#'},
        'comments': {link: '#'},
      },
    },
  comments: [
    {
      author: 'criddell',
      time: '13 minutes ago',
      content: 'If you work on Windows applications, check out Event Tracing for Windows (ETW). The best place to start is Bruce Dawson’s blog: https://randomascii.wordpress.com/2015/09/24/etw-central/',
      replyLink: '#',
    },
    {
      author: 'davidson',
      time: '1 hour ago',
      content: 'I wrote Spall, one of the lightweight profilers mentioned in the post. I loved the author\'s blogpost on implicit in-order forests, it was neat to see someone else\'s take on trees for big traces, pushed me to go way bigger than I was originally planning! Thankfully, etzinger-ordered 4-ary trees work totally fine at 165+ fps, even at 3+ billion functions, but I like to read back through that post once in a while just in case I hit that perf wall someday. Working on timestamp delta-compression at the moment to pack events into much smaller spaces, and hopefully get to 10 billion in 128 GB RAM sometime soon (at least for native builds of Spall). Thanks for the kick to keep on pushing!',
      replyLink: '#',
    },
    {
      author: 'kqr',
      time: '1 hour ago',
      content: 'I wanted to correlate packet times with userspace events from a Python program, so I used a fun trick: Find a syscall which has an early-exit error path and bindings in most languages, and then trace calls to that which have specific arguments which produce an error. Wow. This is some great engineering. Obviously that\'s what you\'d do, but I\'d never think of it in a thousand years!',
      replyLink: '#',
    },
    {
      author: 'trishume',
      time: '4 hours ago',
      content: 'Do you know of anyone who\'s built that kind of time travel debugging with a trace visualization in the open outside of Javascript? I know about rr and Pernosco but don\'t know of trace visualization integration for either of them, that would indeed be very cool. I definitely dream of having systems like this.',
      replyLink: '#',
    },
    {
      author: 'Veserv',
      time: '3 hours ago',
      content: 'Green Hills Software TimeMachine + History for C and C++: https://www.ghs.com/products/MULTI_IDE.html No particularly good publicly visible documentation of the functionality, but it does that and is a publicly purchasable product. They also had TimeMachine + PathAnalyzer from the early 2000s which was a time travel debug with visualization solution, but they were only about as integrated as most of the solutions you see floating around today.',
      replyLink: '#',
    },
  ],

};

async function getPostComments (id) {
  noStore();
  const maxLoop = 10;
  const items = [];
  let loop = 0;
  let cursor = 0;
  const match = `comments:${id}*`;
  while(loop < maxLoop) {
    const [nextCursor, data] = await kv.scan(cursor, {match});
    console.log("loop", {match, loop, cursor, nextCursor, data});
    cursor = nextCursor;
    for(const key of data){
      console.log('key', {key});
      const value = await kv.get(key);
      items.push({key, value});
    }
    loop++;
    if (cursor === 0) {
      break;
    }
  }
  console.log("items", items);

  const results = items.map((item) => {
    const createdAt = new Date(item.value.createdAt);
    const agoString = DateTime.fromJSDate(createdAt).toRelative();
      return {
      key: item.key,
      value: {
        ...item.value,
        time: agoString,
        replyLink: "#",
      },
    };
  });
  console.log("results", results);
  return results;
}
const loadComments = cache(async (id) => {
  return await getPostComments(id)
})

const Link = ({ href, children }) => {
  return (
    <a href={href}>{children}</a>
  );
};

export default async function Home({params: {id}}) {
  const postDb = await kv.get(`article:${id}`);
  console.log("json", {id, postDb});
  if(!postDb) {
    return <div>Not found</div>
  }

  const content = pageContent;
  const placeholderPost = content.post;
  const post = {
    title: postDb.title || placeholderPost.post,
    link: postDb.link || placeholderPost.link,
    actions: placeholderPost.actions,
    points: postDb.points || placeholderPost.points,
    author: postDb.author || placeholderPost.author,
  };
  // Get domain from link (only apex domain)
  let match = post.link.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im);
  if (match) {
    let parts = match[1].split('.');
    if (parts.length > 2) {
      post.domain = parts.slice(-2).join('.');
    } else {
      post.domain = match[1];
    }
  }
  const comments = await getPostComments(id);

  const commentsCount = comments.length;
  await kv.set(`article-comments-count:${id}`, commentsCount);
  post.actions.comments.text = `${commentsCount} comments`;
  post.agoString = DateTime.fromJSDate(new Date(postDb.createdAt)).toRelative();

  return (
    <div className="bg-[#f6f6ef] text-black text-sm font-sans">
      {/* Render links from JSON */}
      <div className="flex justify-between items-center px-4 py-2 border-b bg-[#ff6600]">
        <div className="flex space-x-2">
          {pageContent.links.map((link, index) => (
            <React.Fragment key={index}>
              <Link className="text-black hover:text-[#ff6600] hover:bg-white" href={link.href}>
                {link.isBold ? <b>{link.text}</b> : link.text}
              </Link>
              {index < pageContent.links.length - 1 && <span>|</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center">
          <Link className="text-black hover:text-[#ff6600] hover:bg-white" href={pageContent.userInfo.logoutLink}>
            {pageContent.userInfo.username} ({pageContent.userInfo.points})
          </Link>
          <span>|</span>
          <Link className="text-black hover:text-[#ff6600] hover:bg-white" href="#">
            logout
          </Link>
        </div>
      </div>

      {/* Render posts from JSON */}
      <div className="px-4 py-2">
          <div className="mb-4 space-y-2">
            <Link className="text-black hover:underline" href={post.link}>
              {post.title}
            </Link>
            <span className="text-gray-400"> ({post.domain})</span>
            <div className="text-gray-600 text-xs">
              {post.points} points by {post.author} {post.agoString} {' | '}
              {Object.keys(post.actions).map((key, actionIndex) => {
                const action = post.actions[key];
                const text = action.text || key;
                return (
                <React.Fragment key={actionIndex}>
                  <Link className="text-black hover:underline" href={action.link}>
                    {text}
                  </Link>
                  {actionIndex < Object.keys(post.actions).length - 1 && ' | '}
                </React.Fragment>
              )})}
            </div>
          </div>
        <div className="mb-4">
          <textarea className="w-full h-24 px-2 py-1 border" placeholder="add comment" />
        </div>

        {/* Render comments from JSON */}
        <div className="space-y-4 pl-5">
          {comments.map((kv, commentIndex) => {
            // indent for nested comments, e.g. comments:123:456
            const indentCount = Math.max(0, kv.key.split(':').length - 3);
            return (
            <div key={commentIndex} className="text-xs" style={{marginLeft: `${40 * indentCount}px`}}>
              <div className="text-gray-400">
                <Link className="text-black hover:underline" href="#">
                  {kv.value.author}
                </Link>{' '}
                {kv.value.time} {' | '}
                <Link className="text-black hover:underline" href={kv.value.replyLink}>
                  reply
                </Link>
              </div>
              <p>{kv.value.content}</p>
              <div className="text-gray-600">
                <Link className="text-black hover:underline" href={kv.value.replyLink}>
                  reply
                </Link>
              </div>
            </div>
            )}
          )}
        </div>
      </div>
    </div>
  );
}
