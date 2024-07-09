import { defineConfig } from 'vitepress';

export const zh = defineConfig({
  locales: {
    root: {
      label: 'English',
      lang: '/en/',
    },
    zh: {
      label: '中文',
      lang: 'zh',
      link: '/zh/',
    },
  },
  themeConfig: {
    nav: nav(),
    sidebar: {
      "/zh/guide/": sidebarGuide()
    }
  }
});

function nav() {
  return [
    { text: '指南', link: '/zh/guide/what-is-artipub', activeMatch: '/guide/' },
  ]
}

function sidebarGuide() {
  return [{
    text: "简介",
    collapsed: false,
    items: [
      { text: 'artipub 是什么?', link: '/zh/guide/what-is-artipub' },
      { text: '快速开始', link: '/zh/guide/getting-started' },
      { text: '贡献', link: '/zh/guide/contribute' },
    ]
  }]
}
