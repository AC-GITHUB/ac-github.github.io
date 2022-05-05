import { navbar } from "vuepress-theme-hope";

export default navbar (
  [
    {text:"主页",icon:"home",link:"/"},
    {text:"分类",icon:"tree",link:"/category"},
    {text:"标签",icon:"tag",link:"/tag"},
    {text:"归档",icon:"line",link:"/timeline"},
    {text:"关于我",icon:"creative",link:"/about"}
  ]
);
