import React from 'react';
import { kv } from '@vercel/kv'
import { unstable_noStore as noStore } from 'next/cache';
import { DateTime } from 'luxon';

// Define your JSON object
const pageContent = {
  links: [
    { href: "#", text: "Hacker News Sim", isBold: true },
    { href: "#", text: "new" },
    { href: "#", text: "threads" },
    { href: "#", text: "past" },
    { href: "#", text: "comments" },
    { href: "#", text: "ask" },
    { href: "#", text: "show" },
    { href: "#", text: "jobs" },
    { href: "https://chat.openai.com/g/g-ycNVwVcX9-hnsim", text: "submit" },
  ],
  userInfo: {
    username: 'skeetmtp',
    points: 18,
    logoutLink: '#',
  },
  posts: [
    {
      title: 'AI my favorite tracing tools',
      link: '#',
      description: ' (trishume.ca)',
      info: '126 points by johnDoe 6 hours ago',
      actions: [
        { text: 'hide', link: '#' },
        { text: 'past', link: '#' },
        { text: 'favorite', link: '#' },
        { text: '13 comments', link: '#' },
      ],
    },
    {
      title: 'AI my favorite tracing tools',
      link: '#',
      description: ' (trishume.ca)',
      info: '126 points by johnDoe 6 hours ago',
      actions: [
        { text: 'hide', link: '#' },
        { text: 'past', link: '#' },
        { text: 'favorite', link: '#' },
        { text: '13 comments', link: '#' },
      ],
    },
    {
      title: 'AI my favorite tracing tools',
      link: '#',
      description: ' (trishume.ca)',
      info: '126 points by johnDoe 6 hours ago',
      actions: [
        { text: 'hide', link: '#' },
        { text: 'past', link: '#' },
        { text: 'favorite', link: '#' },
        { text: '13 comments', link: '#' },
      ],
    },
    // Add other posts similarly
  ],

};

async function getArticles () {
  noStore();
  const maxLoop = 10;
  const result = [];

  const articles = await kv.zrange('articles', 0, maxLoop, {rev: true, withScores: true});
  //ex [ 'abc', 1702999636500, 'efg', 1702999662414 ]
  console.log("articles", articles);
  for(let i = 0; i < articles.length; i += 2) {
    const id = articles[i];
    const score = articles[i + 1];
    const key = `article:${id}`;
    const article = await kv.get(key);
    result.push({key, score, value: article});
  }

  /*
  let loop = 0;
  let cursor = 0;
  const match = `article:*`;
  while(loop < maxLoop) {
    const [nextCursor, data] = await kv.scan(cursor, {match});
    console.log("loop", {match, loop, cursor, nextCursor, data});
    cursor = nextCursor;
    for(const key of data){
      console.log('key', {key});
      const value = await kv.get(key);
      result.push({key, value});
    }
    loop++;
    if (cursor === 0) {
      break;
    }
  }
  */
  console.log("result", result);

  for(const item of result) {
    console.log("item", item);
    const id = item.key.split(':')[1];
    const commentsCount = await kv.get(`article-comments-count:${id}`);
    item.value.commentsCount = commentsCount;
  }

  const res = result.map((item) => {
    // Get domain from link (only apex domain)
    let domain = '(N/A)';
    const link = item.value.link;
    let match = link.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im);
    if (match) {
      let parts = match[1].split('.');
      if (parts.length > 2) {
        domain = parts.slice(-2).join('.');
      } else {
        domain = match[1];
      }
    }
    const commentsLink = `/article/${item.key.split(':')[1]}`;
    const commentsCount = item.value.commentsCount || 0;
    const createdAt = new Date(item.value.createdAt);
    const agoString = DateTime.fromJSDate(createdAt).toRelative();

    return {
      key: item.key,
      value: {
        title: item.value.title || "N/A",
        link: item.value.link || "#",
        description: domain,
        createdAt: item.value.createdAt,
        info: `${item.value.points || 14} points by ${item.value.author} ${agoString}`,
        actions: [
          { text: 'hide', link: '#' },
          { text: 'past', link: '#' },
          { text: 'favorite', link: '#' },
          { text: `${commentsCount} comments`, link: commentsLink },
        ],
      },
    };
  });

  console.log("res", res);
  return res;
}


const Link = ({ href, children }) => {
  return (
    <a href={href}>{children}</a>
  );
};

export default async function Home() {
  const articles = await getArticles();
  return (
    <div className="bg-[#f6f6ef] text-black text-sm font-sans h-screen flex flex-col">
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
        {articles.map((article, index) => {
          const post = article.value;
          return (
          <div key={index} className="mb-4 space-y-2">
            <Link className="text-black hover:underline" href={post.link}>
              {post.title}
            </Link>
            <span className="text-gray-600">({post.description})</span>
            <div className="text-gray-600 text-xs">
              {post.info} {' | '}
              {post.actions.map((action, actionIndex) => (
                <React.Fragment key={actionIndex}>
                  <Link className="text-black hover:underline" href={action.link}>
                    {action.text}
                  </Link>
                  {actionIndex < post.actions.length - 1 && ' | '}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
        })}
      </div>
      {/* Fill remaining vertical space */}
      <div className="flex-grow"></div>
    </div>
  );
}
