import { DefaultTheme, defineConfig } from "vitepress";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../../../package.json");

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
      text: pkg.version,
      items: [
        {
          text: "更新日志",
          link: "https://github.com/pup007/artipub/blob/master/CHANGELOG.md",
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
        { text: "What is VitePress?", link: "what-is-artipub" },
        { text: "Getting Started", link: "getting-started" },
        { text: "Contribute", link: "contribute" },
        { text: "Sponsor", link: "sponsor" },
      ],
    },
  ];
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "API",
      collapsed: false,
      items: [
        { text: "ArticleProcessor", link: "processor" },
        { text: "PublisherManager", link: "publisher" },
        { text: "Plugins", link: "plugin" },
      ],
    },
  ];
}
