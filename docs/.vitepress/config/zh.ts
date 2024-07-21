import { DefaultTheme, defineConfig } from 'vitepress';
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require('../../../package.json')

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
      "/zh/guide/": { base: '/zh/guide/', items: sidebarGuide() },
      "/zh/API/": { base: "/zh/API/", items: sidebarReference() },
    },
    outline: {
      label: "页面导航"
    }
  }
});

function nav() {
  return [
    {
      text: '指南',
      link: '/zh/guide/what-is-artipub',
      activeMatch: '/guide/'
    },
    {
      text: 'API',
      link: '/zh/API/processor',
      activeMatch: '/API/'
    },
    {
      text: pkg.version,
      items: [
        {
          text: '更新日志',
          link: 'https://github.com/pup007/artipub/blob/master/CHANGELOG.md'
        },
      ]
    }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [{
    text: "简介",
    collapsed: false,
    items: [
      { text: 'artipub 是什么?', link: 'what-is-artipub' },
      { text: '快速开始', link: 'getting-started' },
      { text: '贡献', link: 'contribute' },
      { text: '赞助', link: 'sponsor' },
    ]
  }]
}

function sidebarReference(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "API",
      items: [
        { text: 'ArticleProcessor', link: 'processor' },
        { text: 'PublisherManager', link: 'publisher' },
        { text: 'Plugins', link: 'plugin' },
      ]
    }
  ]
}
