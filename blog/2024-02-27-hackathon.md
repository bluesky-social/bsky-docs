---
slug: skygaze-hackathon
title: Skygaze Hackathon
authors:
  name: Cooper Edmunds
  title: Skygaze
tags: ['community']
---

_This is a guest blog post by Skygaze, creators of the For You feed. You can check out For You, the custom feed that learns what you like, at [https://skygaze.io/feed](https://skygaze.io/feed)._

Last Sunday, 70 engineers came together at the YC office in San Francisco for the first Bluesky AI Hackathon. The teams took full advantage of Bluesky’s complete data openness to build 17 pretty spectacular projects, many of which genuinely surprised us. My favorites are below. Thank you to [Replicate](https://replicate.com/) for donating $50 of LLM and image model credits to each participant and sponsoring a $1000 prize for the winning team!

The 17 projects covered a wide range of categories: location-based feeds, feeds with dynamic author lists, collaborative image generation, text moderation, NSFW image labeling, creator tools, and more. The top three stood out for their creativity, practicality, and completeness (despite having only ~6 hours to build), and we’ll share a bit about them below.

## Convo Detox

[@paritoshk.bsky.social](https://bsky.app/profile/paritoshk.bsky.social) and team came in first place with Convo Detox–a bot that predicts when a thread is at high risk of becoming toxic and interjects to diffuse tension. We were particularly impressed with the team’s use of a self-hosted model trained on Reddit data specifically to predict conversations that are likely to get heated. As a proof of concept they deployed it as a bot that can be summoned via mention, but in the near future this would make for a great third party moderation label.

## SF IRL

This is a bot that detects and promotes tech events happening in SF. In addition to flagging events, it keeps track of the accounts posting about SF tech and serves a feed with all of the posts from those accounts. We think simple approaches to dynamic author lists is a very interesting 90/10 on customized feeds and (if designed reasonably) could be both easier for the feed maintainer and higher quality for the feed consumers.

## NSFW Image Detection

On Bluesky, users can set whether they want adult content to show up in their app. Beyond this level of customization, whether or not an image is labeled as NSFW can be customized as well — people have a wide variety of preferences. This team trained a model to classify images into a large number of NSFW categories, which would theoretically fit nicely into the 3rd party moderation labeler interface. It’s neat that their choice of architecture extends naturally to processing text in tandem with images.

### Other Projects

Other noteworthy projects included translation bots, deep fake detectors, a friend matchmaker, and an image generator tool that allowed people to build image generated prompts together in reply threads. It was genuinely incredibly impressive and exciting to see what folks with no previous AT Proto experience were able to put together (and often deploy !!!) in only a few hours.

## Additional Resources

We prepared some starter templates for the hackathon, and want to share them below for anyone who couldn’t attend the event in person! 

* [Bot Starter Repo (TypeScript)](https://github.com/skygaze-ai/bot-typescript)
* [Bot Starter Repo (Python)](https://github.com/skygaze-ai/bot-python)
* [Feed Generator Starter Repo (TypeScript)](https://github.com/skygaze-ai/feed-generator-typescript)
* [AT Proto 101 by Jett Hollister](https://github.com/skygaze-ai/atproto-101) 

And if you’re interested in hosting your own bluesky hackathon but don’t know where to start, please feel free to copy [all of our invite copy, starter repos, and datasets](https://docs.google.com/document/d/1cMNzLm1yDMeE4P6M_ZWubz9uiHGMnthfO7v94B16ELY/edit?usp=sharing).
