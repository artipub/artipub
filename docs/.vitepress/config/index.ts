import { defineConfig } from 'vitepress'
import { createRequire } from 'module'
import { en } from './en'
import { zh } from './zh'

const require = createRequire(import.meta.url)
const pkg = require('../../../package.json')
const name: string = pkg.name.split('/').pop();

export default defineConfig({
  locales: {
    root: { label: 'English', ...en },
    zh: { label: '简体中文', ...zh },
  },
  base: `/${name}/`,
  themeConfig: {
    siteTitle: name,
    editLink: {
      pattern: 'https://github.com/pup007/artipub/edit/master/docs/:path',
      text: 'Edit this page on GitHub'
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Potter.yan'
    },
  }
})
