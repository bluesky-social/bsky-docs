// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer").themes.github;
const darkCodeTheme = require("prism-react-renderer").themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  scripts: [
    {
      src: "https://widget.kapa.ai/kapa-widget.bundle.js",
      "data-website-id": "58c0dcc5-974f-4718-aeac-6edfafbf3c68",
      "data-project-name": "Bluesky",
      "data-project-color": "#41ADFF",
      "data-project-logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Bluesky_Logo.svg/330px-Bluesky_Logo.svg.png",
      "data-modal-title": "Bluesky Docs AI",
      "data-button-hide": "true",
      "data-modal-ask-ai-input-placeholder": "Find solutions from the docs, Github, forums, and more...",
      async: true,
    },
  ],
  clientModules: [
    require.resolve('./src/clientModules/kapaAlgoliaIntegration.js'),
  ],
  title: "Bluesky",
  tagline: "Get started with the Bluesky API.",
  favicon: "img/favicon.png",

  // Set the production url of your site here
  url: "https://docs.bsky.app/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "bluesky-social", // Usually your GitHub org/user name.
  projectName: "bsky-docs", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  onBrokenAnchors: 'ignore',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  plugins: ["@docusaurus/plugin-ideal-image"],

  // The HTTP/XRPC endpoint reference is no longer generated into this site. It
  // now lives as a standalone, OpenAPI-driven static site (see ../endpoints).
  // `endpointsUrl` is that site's deployed base URL; set via the ENDPOINTS_URL
  // env var once a host/domain is chosen (intentionally not hardcoded). When
  // unset, the homepage "API Reference" card is hidden.
  customFields: {
    endpointsUrl: process.env.ENDPOINTS_URL || null,
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/bluesky-social/bsky-docs/tree/main/",
        },
        blog: {
          showReadingTime: true,
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/bluesky-social/bsky-docs/tree/main/",
          blogSidebarCount: "ALL",
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/social-card-default.png",
      navbar: {
        // The brand lockup is rendered by the custom `custom-bpsBrand` item
        // below (see src/components/Navbar/), so no default logo/title here.
        items: [
          {
            // "Bluesky Protocol Services" lockup → homepage.
            type: "custom-bpsBrand",
            position: "left",
            to: "/",
          },
          {
            // "Get Started" — old Bluesky butterfly + label; points where the
            // Docs link used to. `friendly` renders it in title case with the
            // default navbar font (vs. the mono/uppercase masthead style).
            // Collapses to just the butterfly on mobile.
            type: "custom-navLink",
            position: "left",
            icon: "butterfly",
            friendly: true,
            label: "Get Started",
            to: "/docs/get-started",
          },
          {
            // "AT Protocol" — collapses to "at://" on mobile. The icon is a
            // masked crop of the amber dot-globe used on the homepage card.
            type: "custom-navLink",
            position: "left",
            plain: true,
            image: "/img/atproto-globe.png",
            label: "AT Protocol",
            shortLabel: "at://",
            href: "https://atproto.com",
          },
          {
            // Mobile-only: renders the docs sections into the hamburger on
            // non-docs routes (the homepage). Null on desktop and on docs
            // routes (where the real sidebar already fills the drawer).
            type: "custom-docsMenu",
            position: "left",
          },
          {
            href: "https://github.com/bluesky-social",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Get Started",
                to: "/docs/get-started",
              },
              {
                label: "Tutorials",
                href: "https://atproto.com/guides/tutorials",
              },
              {
                label: "AT Protocol",
                href: "https://atproto.com",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Bluesky",
                href: "https://bsky.app/profile/bsky.app",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/bluesky",
              },
              {
                label: "Community-run Discord",
                href: "https://discord.gg/3srmDsHSZJ",
              },
              {
                label: "Mailing List",
                href: "/docs/support/mailing-list",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub Discussions",
                href: "https://github.com/bluesky-social/atproto/discussions",
              },
              {
                label: "GitHub",
                href: "https://github.com/bluesky-social",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Bluesky, PBC.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: 'T5MN80JFZF',
        // Public API key: it is safe to commit it
        apiKey: 'fd8d166a53279da4c51abddb2f4a1269',
        indexName: 'wwwbsky',
        contextualSearch: false,
      }
    }),
};

module.exports = config;
