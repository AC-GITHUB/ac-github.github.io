import { defineThemeConfig } from "vuepress-theme-hope";
import navbar from "./navbar";
import sidebar from "./sidebar";

export default defineThemeConfig({
  hostname: "https://ac-github.github.io",

  author: {
    name: "acc",
    url: "https://github.com/AC-GITHUB",
  },

  iconPrefix: "iconfont icon-",

  logo: "/avatar.jpeg",

  repo: "https://github.com/AC-GITHUB",

  docsDir: "demo/src",

  // navbar
  navbar: navbar,

  // sidebar
  sidebar: sidebar,

  footer: "默认页脚",

  displayFooter: true,

  editLink: false,

  pageInfo: ["Author", "Original", "Date", "Category", "Tag", "ReadingTime","Word"],

  blog: {
    name:"AC",
    avatar:"/avatar.jpeg",
    description: "一个开发者",
    intro: "https://github.com/AC-GITHUB",
    medias: {
      Baidu: "https://example.com"
    },
    roundAvatar:true
  },

  plugins: {
    blog: {
      autoExcerpt: true,
    },

    // 你也可以使用 Waline
    // comment: {
    //   type: "giscus",
    //   repo: "vuepress-theme-hope/giscus-discussions",
    //   repoId: "R_kgDOG_Pt2A",
    //   category: "Announcements",
    //   categoryId: "DIC_kwDOG_Pt2M4COD69",
    // },

    mdEnhance: {
      enableAll: true,
      presentation: {
        plugins: ["highlight", "math", "search", "notes", "zoom"],
      },
    },
  },
});
