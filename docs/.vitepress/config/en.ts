import { DefaultTheme, defineConfig } from "vitepress";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const corePkg = require("../../../packages/core/package.json");
const cliPkg = require("../../../packages/cli/package.json");

export const en = defineConfig({
  locales: {
    root: {
      label: "English",
      lang: "en",
      link: "/",
    },
    zh: {
      label: "中文",
      lang: "zh",
      link: "/zh/",
    },
  },
  themeConfig: {
    nav: nav(),
    sidebar: {
      "/guide/": { base: "/guide/", items: sidebarGuide() },
      "/API/": { base: "/API/", items: sidebarReference() },
    },
    outline: {
      label: "Outline",
    },
  },
});

function nav() {
  return [
    {
      text: "Guide",
      link: "/guide/what-is-artipub",
      activeMatch: "/guide/",
    },
    {
      text: "API",
      link: "/API/processor",
      activeMatch: "/API/",
    },
    {
      text: "Config",
      link: "/config/index",
      activeMatch: "/config/",
    },
    {
      text: `core:${corePkg.version}`,
      items: [
        {
          text: "更新日志",
          link: "https://github.com/artipub/artipub/blob/main/packages/core/CHANGELOG.md",
        },
      ],
    },
    {
      text: `cli:${cliPkg.version}`,
      items: [
        {
          text: "更新日志",
          link: "https://github.com/artipub/artipub/blob/main/packages/cli/CHANGELOG.md",
        },
      ],
    },
  ];
}

function sidebarGuide() {
  return [
    {
      text: "Introduction",
      collapsed: false,
      items: [
        { text: "What is Artipub?", link: "what-is-artipub" },
        { text: "Getting Started", link: "getting-started" },
        { text: "CLI", link: "cli" },
        { text: "Contribute", link: "contribute" },
        { text: "Sponsor", link: "sponsor" },
      ],
    },
  ];
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Core API",
      collapsed: false,
      items: [
        { text: "ArticleProcessor", link: "processor" },
        { text: "PublisherManager", link: "publisher" },
      ],
    },
    {
      text: "Publisher Plugins",
      collapsed: false,
      items: [
        { text: "Overview", link: "plugin" },
        { text: "Notion Plugin", link: "plugins/notion" },
        { text: "Dev.to Plugin", link: "plugins/devto" },
        { text: "Native Plugin", link: "plugins/native" },
        { text: "Custom Plugins", link: "plugins/custom" },
      ],
    },
  ];
}
