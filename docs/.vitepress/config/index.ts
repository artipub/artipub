import { defineConfig } from 'vitepress'
import { en } from './en'
import { zh } from './zh'

export default defineConfig({
  locales: {
    root: { label: 'English', ...en },
    zh: { label: '简体中文', ...zh },
  }
})
