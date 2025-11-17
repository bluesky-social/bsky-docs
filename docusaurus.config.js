// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer").themes.github;
const darkCodeTheme = require("prism-react-renderer").themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
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
  plugins: [
    "@docusaurus/plugin-ideal-image",
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "api", // plugin id
        docsPluginId: "classic", // id of plugin-content-docs or preset for rendering docs
        config: {
          bskyApi: {
            // the <id> referenced when running CLI commands
            specPath: "atproto-openapi-types/spec/api.json", // path to OpenAPI spec, URLs supported
            outputDir: "docs/api", // output directory for generated files
            sidebarOptions: {
              // optional, instructs plugin to generate sidebar.js
              groupPathsBy: "tag", // group sidebar items by operation "tag"
            },
          },
        },
      },
    ],
  ],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/bluesky-social/bsky-docs/tree/main/",
          docItemComponent: "@theme/ApiItem", // Derived from docusaurus-theme-openapi-docs
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
  themes: ["docusaurus-theme-openapi-docs"],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/social-card-default.png",
      navbar: {
        title: "Bluesky",
        logo: {
          alt: "Bluesky Logo",
          src: "img/favicon.png",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Docs",
          },
          { to: "/blog", label: "Blog", position: "left" },
          { href: "https://blueskydirectory.com/", label: "Directory", position: "left" },
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
                label: "Starter Templates",
                to: "/docs/category/starter-templates",
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
      // disable openapi language snippets
      languageTabs: [],
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
