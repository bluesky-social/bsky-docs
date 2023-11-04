
import {sortBy} from '@site/src/utils/jsUtils';

export type TagType =
  // DO NOT USE THIS TAG: we choose sites to add to favorites
  | 'favorite'
  // For open-source sites, a link to the source code is required.
  // The source should be the *website's* source, not the project's source!
  | 'opensource';
  // | 'product'
  // // Feel free to add the 'design' tag as long as there's _some_ level of
  // // CSS/swizzling.
  // | 'design'
  // // Site must have more than one locale.
  // | 'i18n'
  // | 'versioning'
  // // Large sites are defined as those with > 200 pages, excluding versions.
  // | 'large'
  // | 'meta'
  // | 'personal'
  // // Right-to-left direction.
  // | 'rtl';

const Users: User[] = [
  {
    title: 'bluesky client',
    description: 'i am a bluesky client',
    preview: require('./showcase/example-1.png'),
    website: 'https://blueskyweb.xyz/',
    source: 'https://github.com/bluesky-social/social-app',
    tags: ['opensource', 'favorite'],
  },
  {
    title: 'bsky bot',
    description: 'im a bot',
    preview: require('./showcase/example-2.png'),
    website: 'https://blueskyweb.xyz',
    source: 'https://github.com/bluesky-social/social-app',
    tags: ['opensource'],
  },
]

export type User = {
  title: string;
  description: string;
  preview: string | null; // null = use our serverless screenshot service
  website: string;
  source: string | null;
  tags: TagType[];
};

export type Tag = {
  label: string;
  description: string;
  color: string;
};

export const Tags: {[type in TagType]: Tag} = {
  favorite: {
    label: 'Favorite',
    description:'Our favorite Docusaurus sites that you must absolutely check out!',
    color: '#e9669e',
  },
  opensource: {
    label: 'Open-Source',
    description: 'Open-Source Docusaurus sites can be useful for inspiration!',
    color: '#39ca30',
  },
};

export const TagList = Object.keys(Tags) as TagType[];
function sortUsers() {
  let result = Users;
  // Sort by site name
  result = sortBy(result, (user) => user.title.toLowerCase());
  // Sort by favorite tag, favorites first
  result = sortBy(result, (user) => !user.tags.includes('favorite'));
  return result;
}

export const sortedUsers = sortUsers();

// /**
//  * Copyright (c) Facebook, Inc. and its affiliates.
//  *
//  * This source code is licensed under the MIT license found in the
//  * LICENSE file in the root directory of this source tree.
//  */

// import React from 'react';
// import {difference, sortBy} from '../utils/jsUtils';
// import {
//   SiJavascript,
//   SiTypescript,
//   SiReact,
//   SiSvelte,
//   SiPython,
//   SiDjango,
//   SiGo,
//   SiDocker,
//   SiCelery,
//   SiRedis,
//   SiAmazonaws,
//   SiFlutter,
//   SiGraphql,
//   SiLine,
//   SiPokemon,
//   SiPostgresql,
//   SiMysql,
//   SiWebpack
// } from 'react-icons/si';



// /*
//  * ADD YOUR SITE TO THE DOCUSAURUS SHOWCASE:
//  *
//  * Requirements for adding your site to our showcase:
//  * - It is a production-ready site with real content and decent customizations (different from the init templates)
//  * - It is NOT a work-in-progress with empty pages
//  * - It has a stable domain name (a Netlify/Vercel deploy preview is not allowed)
//  *
//  * Instructions:
//  * - Add your site in the json array below
//  * - Add a local image preview (decent screenshot of your Docusaurus site)
//  * - Use relevant tags to qualify your site (read the tag descriptions bellow)
//  * - The image MUST be added to the GitHub repository, and use `require("image")`
//  * - Open a PR and check for reported CI errors
//  *
//  * Example PR: https://github.com/facebook/docusaurus/pull/3976
//  *
//  * If you edit this file through the Github interface, you can:
//  * - Submit first your users.js edit PR
//  * - This will create a branch on your Docusaurus fork (usually "patch-1")
//  * - Go to https://github.com/<username>/docusaurus/tree/<branch>/website/src/data/showcase
//  * - Drag-and-drop an image here to add it to your existing PR
//  *
//  * Please help us maintain this showcase page data:
//  * - Update sites with wrong data
//  * - Ensure site tags remains correct over time
//  * - Remove sites not using Docusaurus anymore
//  * - Add missing Docusaurus sites (if the site owner agreed)
//  *
//  */

// export type Tag = {
//   label: string;
//   description: string;
//   icon: JSX.Element;
// };

// export type TagType =
//   | 'favorite'
//   | 'opensource'
//   | 'bot'
//   | 'client'
//   | 'feedgenerator'
//   ;

// export type User = {
//   title: string;
//   description: string;
//   preview: any;
//   website: string;
//   source: string | null;
//   tags: TagType[];
// };

// // LIST OF AVAILABLE TAGS
// // Available tags to assign to your site
// // Please choose widely, we'll remove unappropriate tags
// export const Tags: Record<TagType, Tag> = {
//   // For open-source sites, a link to the source code is required
//   opensource: {
//     label: 'Open-Source',
//     description: 'Open-Source Docusaurus sites can be useful for inspiration!',
//     icon: <>👨‍💻</>,
//   },
//   favorite: {
//     label: 'Favorite',
//     description: 'Favorite project',
//     icon: <>👨‍💻</>,
//   },
//   bot: {
//     label: 'Bot',
//     description: 'Bot',
//     icon: <>👨‍💻</>,
//   },
//   client: {
//     label: 'Client',
//     description: 'client',
//     icon: <>👨‍💻</>,
//   },
//   feedgenerator: {
//     label: 'Feed Generator',
//     description: 'feed generator',
//     icon: <>👨‍💻</>,
//   },
// };

// // Add your site to this list
// // prettier-ignore
// const Users: User[] = [
//   {
//     title: 'one',
//     description: 'description one',
//     preview: require('./showcase/7wate-wiki.png'),
//     website: 'https://timeline.line.me/user/_dVIuvfRKpnIF0fshFbeisWNMXSXo1yCFeUZWwFM',
//     source: 'https://github.com/pandawa-tech/arjuna',
//     tags: [
//       'opensource',
//     ],
//   },
//   {
//     title: 'Bima',
//     description: 'Algorithm Visualizer.',
//     preview: require('./showcase/7wate-wiki.png'),
//     website: 'https://bima.priambudi.fyi/',
//     source: 'https://github.com/pandawa-tech/bima',
//     tags: [
//       'opensource',
//       'bot'
//     ],
//   },
//   {
//     title: 'Pokédex',
//     description: 'Pokédex and catch Pokémon!',
//     preview: require('./showcase/7wate-wiki.png'),
//     website: 'https://pokedex.priambudi.fyi/',
//     source: 'https://github.com/priambudiLB/pokedex',
//     tags: [
//       'opensource',
//       'favorite'
//     ],
//   },
//   {
//     title: 'Mood Tracker',
//     description: 'Mood & Activity Tracker App.',
//     preview: require('./showcase/7wate-wiki.png'),
//     website: 'https://play.google.com/store/apps/details?id=id.ac.ui.cs.modi.ModiApp&hl=in&gl=US',
//     source: null,
//     tags: [
//       'client'
//     ],
//   }

//   /*
//   Pro Tip: add your site in alphabetical order.
//   Appending your site here (at the end) is more likely to produce Git conflicts.
//    */
// ];

// export const TagList = Object.keys(Tags) as TagType[];
// function sortUsers() {
//   let result = Users;
//   // Sort by site name
//   result = sortBy(result, (user) => user.title.toLowerCase());
//   return result;
// }

// export const sortedUsers = sortUsers();

// // Fail-fast on common errors
// function ensureUserValid(user: User) {
//   function checkFields() {
//     const keys = Object.keys(user);
//     const validKeys = [
//       'title',
//       'description',
//       'preview',
//       'website',
//       'source',
//       'tags',
//     ];
//     const unknownKeys = difference(keys, validKeys);
//     if (unknownKeys.length > 0) {
//       throw new Error(
//         `Site contains unknown attribute names=[${unknownKeys.join(',')}]`,
//       );
//     }
//   }

//   function checkTitle() {
//     if (!user.title) {
//       throw new Error('Site title is missing');
//     }
//   }

//   function checkDescription() {
//     if (!user.description) {
//       throw new Error('Site description is missing');
//     }
//   }

//   function checkWebsite() {
//     if (!user.website) {
//       throw new Error('Site website is missing');
//     }
//     const isHttpUrl =
//       user.website.startsWith('http://') || user.website.startsWith('https://');
//     if (!isHttpUrl) {
//       throw new Error(
//         `Site website does not look like a valid url: ${user.website}`,
//       );
//     }
//   }

//   function checkPreview() {
//     if (
//       !user.preview ||
//       (user.preview instanceof String &&
//         (user.preview.startsWith('http') || user.preview.startsWith('//')))
//     ) {
//       throw new Error(
//         `Site has bad image preview=[${user.preview}].\nThe image should be hosted on Docusaurus site, and not use remote HTTP or HTTPS URLs`,
//       );
//     }
//   }

//   function checkTags() {
//     if (
//       !user.tags ||
//       !(user.tags instanceof Array) ||
//       (user.tags as string[]).includes('')
//     ) {
//       throw new Error(`Bad showcase tags=[${JSON.stringify(user.tags)}]`);
//     }
//     const unknownTags = difference(user.tags, TagList);
//     if (unknownTags.length > 0) {
//       throw new Error(
//         `Unknown tags=[${unknownTags.join(
//           ',',
//         )}\nThe available tags are ${TagList.join(',')}`,
//       );
//     }
//   }

//   function checkOpenSource() {
//     if (typeof user.source === 'undefined') {
//       throw new Error(
//         "The source attribute is required.\nIf your Docusaurus site is not open-source, please make it explicit with 'source: null'",
//       );
//     } else {
//       const hasOpenSourceTag = user.tags.includes('opensource');
//       if (user.source === null && hasOpenSourceTag) {
//         throw new Error(
//           "You can't add the opensource tag to a site that does not have a link to source code.",
//         );
//       } else if (user.source && !hasOpenSourceTag) {
//         throw new Error(
//           "For open-source sites, please add the 'opensource' tag",
//         );
//       }
//     }
//   }

//   try {
//     checkFields();
//     checkTitle();
//     checkDescription();
//     checkWebsite();
//     checkPreview();
//     checkTags();
//     checkOpenSource();
//   } catch (e) {
//     throw new Error(
//       `Showcase site with title=${user.title} contains errors:\n${e.message}`,
//     );
//   }
// }

// Users.forEach(ensureUserValid);