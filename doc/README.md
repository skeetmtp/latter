Inspired (who said copied?) from https://twitter.com/ykilcher Litter video:
https://www.youtube.com/watch?v=v8O_tSF_o50&t=54s

Original Litter refs:
Website: https://litter.ykilcher.com
Code: https://github.com/yk/litter


Twitter thread:
----
Inspired by @ykilcher 's crazy idea behind Litter
I tried to make a port using OpenAI GPTs!
I called it Latter, and you can play with it here: https://latter-sigma.vercel.app/
Spoiler: It was a failure, but the journey was enlightening.

I wanted to highlight an underrated GPTs features: shifting costs from creators to users thanks to GPT Plus subscriptions.
https://twitter.com/ykilcher/status/1742589024538157303
Shoutout to @simonw for spotlighting this in this article:
https://simonwillison.net/2023/Nov/15/gpts/#the-billing-model

Step 1: A quick Proof of Concept to replicate Litter's process in ChatGPT.
The start was promising! May be too much promising...
Check out this initial setup:

The start was promising! May be too much promising...
Here's what I got:

Step 2: Crafting a Vercel app, fast and furious style:
Borrowed from a past (crazy) project, tweaked a bit, and voila!
Infra is very Similar to Litter, but with a CustomGPT twist:
- Redis store posts
- Next.js app

Hit a snag though. The app's results were unrealistically perfect.
Check this out: how did GPT figure out Next.js from an image? Maybe a flaw in my PoC? 🤔

After some tests, I sadly realize that ChatGPT is not able to run GPT Vision against it's own generated Dall-e images :/
The results? More fantasy than fact. See for yourself!

Wrapping up: A fun ride with a bittersweet end. Didn't quite hit the target, but the lessons were golden:
I learn some nuggets by reading Litter source code.
Sharpened my Next.js skills
A spark of a brand new idea ignited! Stay tuned...

For the tech enthusiasts, here the github repo: https://github.com/skeetmtp/latter
