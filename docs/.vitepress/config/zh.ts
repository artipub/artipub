import { defineConfig } from 'vitepress';
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
      "/zh/guide/": sidebarGuide()
    }
  }
});

function nav() {
  return [
    { text: '指南', link: '/zh/guide/what-is-artipub', activeMatch: '/guide/' },
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
