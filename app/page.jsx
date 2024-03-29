"use client";

import React from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

import { Button } from "@/components/ui/button"
import { AvatarImage, Avatar } from "@/components/ui/avatar"
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"


function HeartIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}


function MessageCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  )
}


function TwitterIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}


function UploadIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <PostsComponent />
    </QueryClientProvider>
  );
}

function PostsComponent() {
  // Use React Query's useQuery hook to fetch posts
  const { data, isLoading, error } = useQuery('posts', fetchPosts);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error has occurred: {error.message}</div>;

  const posts = data.posts;

  return (
    <div className="bg-white">
      <nav className="flex flex-row space-x-1 p-4 bg-gray-100">
        <a className="mt-4 w-full" href="https://chat.openai.com/g/g-qIStnYQmw-latter" target="_blank" rel="noopener noreferrer">
          <Button className="mt-4 w-full">Post</Button>
        </a>
      </nav>
      <div className="flex h-screen">
        <main className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {posts.map((post) => (
              <Card className="w-full" key={post.id}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage alt="User avatar" src={post.avatarUrl} />
                    </Avatar>
                    <div>
                      <CardTitle>{post.author}</CardTitle>
                      <CardDescription>{post.handle} · {post.time}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.message.map((message, index) => (
                    <p key={index}>{message}</p>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <MessageCircleIcon className="text-gray-500" />
                  <TwitterIcon className="text-gray-500" />
                  <HeartIcon className="text-gray-500" />
                  <UploadIcon className="text-gray-500" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

async function fetchPosts() {
  const response = await fetch('/api/posts');
  if (!response.ok) {
    throw new Error('Network response was not ok', response);
  }
  return response.json();
}
