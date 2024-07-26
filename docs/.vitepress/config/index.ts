import { defineConfig } from "vitepress";
import { createRequire } from "node:module";
import { en } from "./en";
import { zh } from "./zh";

const require = createRequire(import.meta.url);
const pkg = require("../../../package.json");
const name: string = pkg.name.split("/").pop();

function normalizeName(name: string) {
  const arr = [...name];
  arr[0] = arr[0].toUpperCase();
  return arr.join("");
}

export default defineConfig({
  locales: {
    root: { label: "English", ...en },
    zh: { label: "简体中文", ...zh },
  },
  base: `/`,
  themeConfig: {
    siteTitle: normalizeName(name),
    editLink: {
      pattern: "https://github.com/artipub/artipub/edit/master/docs/:path",
      text: "Edit this page on GitHub",
    },
    socialLinks: [{ icon: "github", link: "https://github.com/artipub/artipub" }],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2019-present Potter.yan",
    },
  },
});
