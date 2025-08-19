import { DefaultTheme, defineConfig } from "vitepress";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../../../packages/core/package.json");

export const zh = defineConfig({
  locales: {
    root: {
      label: "English",
      lang: "/en/",
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
      "/zh/guide/": { base: "/zh/guide/", items: sidebarGuide() },
      "/zh/API/": { base: "/zh/API/", items: sidebarReference() },
    },
    outline: {
      label: "页面导航",
    },
  },
});

function nav() {
  return [
    {
      text: "指南",
      link: "/zh/guide/what-is-artipub",
      activeMatch: "/guide/",
    },
    {
      text: "API",
      link: "/zh/API/processor",
      activeMatch: "/API/",
    },
    {
      text: "配置",
      link: "/zh/config/index",
      activeMatch: "/config/",
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

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "简介",
      collapsed: false,
      items: [
        { text: "artipub 是什么?", link: "what-is-artipub" },
        { text: "快速开始", link: "getting-started" },
        { text: "命令行界面", link: "cli" },
        { text: "贡献", link: "contribute" },
        { text: "赞助", link: "sponsor" },
      ],
    },
  ];
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "核心 API",
      collapsed: false,
      items: [
        { text: "文章处理器", link: "processor" },
        { text: "发布管理器", link: "publisher" },
      ],
    },
    {
      text: "发布插件",
      collapsed: false,
      items: [
        { text: "概览", link: "plugin" },
        { text: "Notion 插件", link: "plugins/notion" },
        { text: "Dev.to 插件", link: "plugins/devto" },
        { text: "本地文件插件", link: "plugins/native" },
        { text: "自定义插件", link: "plugins/custom" },
      ],
    },
  ];
}
