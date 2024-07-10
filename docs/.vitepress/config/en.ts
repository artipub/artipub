import { defineConfig } from 'vitepress';
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require('../../../package.json')

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
    {
      text: pkg.version,
      items: [
        {
          text: '更新日志',
          link: 'https://github.com/pup007/artipub/blob/master/CHANGELOG.md'
        }
      ]
    }
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
