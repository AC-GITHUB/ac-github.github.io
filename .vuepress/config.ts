import { defineUserConfig } from "vuepress";
import { shikiPlugin } from '@vuepress/plugin-shiki'

import theme from "./theme";

export default defineUserConfig({
  base: "/",
  dest: "./dist",
  lang:"zh-CN",
  title:"ac-blog",
  description:"",
  head: [
    [
      "link",
      {
        rel: "stylesheet",
        href: "//at.alicdn.com/t/font_2410206_mfj6e1vbwo.css",
      },
    ],
  ],
  locales: {
    "/": {
      lang: "zh-CN",
      title: "主题演示",
      description: "vuepress-theme-hope 的演示",
    },
  },
  plugins: [
    shikiPlugin({
      theme:'material-palenight'
    }),
  ],
  theme,
});