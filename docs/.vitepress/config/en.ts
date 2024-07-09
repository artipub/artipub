import { defineConfig } from 'vitepress';

export const en = defineConfig({
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
      "/guide/": sidebarGuide()
    }
  }
});

function nav() {
  return [
    { text: 'Guide', link: '/guide/what-is-artipub', activeMatch: '/guide/' },
  ]
}

function sidebarGuide() {
  return [{
    text: "Introduction",
    collapsed: false,
    items: [
      { text: 'What is VitePress?', link: '/guide/what-is-artipub' },
      { text: 'Getting Started', link: '/guide/getting-started' },
      { text: 'Contribute', link: '/guide/contribute' },
    ]
  }]
}
