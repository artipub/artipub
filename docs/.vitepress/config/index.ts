import { defineConfig } from 'vitepress'
import { createRequire } from 'module'
import { en } from './en'
import { zh } from './zh'

const require = createRequire(import.meta.url)
const pkg = require('../../../package.json')
const name: string = pkg.name.split('/').pop();

function normalizeName(name: string) {
  let arr = name.split("");
  arr[0] = arr[0].toUpperCase();
  return arr.join("");
}

export default defineConfig({
  locales: {
    root: { label: 'English', ...en },
    zh: { label: '简体中文', ...zh },
  },
  base: `/${name}/`,
  themeConfig: {
    siteTitle: normalizeName(name),
    editLink: {
      pattern: 'https://github.com/pup007/artipub/edit/master/docs/:path',
      text: 'Edit this page on GitHub'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/pup007/artipub' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present Potter.yan'
    },
  }
})
