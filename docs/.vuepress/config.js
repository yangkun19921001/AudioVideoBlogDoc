import { defineUserConfig, defaultTheme } from 'vuepress';
//const { commentPlugin } = require("vuepress-plugin-comment2");
//import {commentPlugin } from "vuepress-plugin-comment2";
import {GiscusCommentPlugin} from 'vuepress-plugin-giscus-comment';


export default defineUserConfig({
  base: '/AudioVideoBlog',
  lang: 'zh-CN',
  title: '音视星空',
  port: '8088', 
  description: '探索音视频领域的知识宝库',
  head: [['link', { rel: 'icon', href: '/images/logo.jpeg' }]],

  // 新增导航条的配置
  theme: defaultTheme({
    // tab栏的图标; 图片 / 会自动去public文件夹里找图片
    logo: '/images/logo.jpeg',

    // 顶部导航条   
    navbar: [
      {text: '首页', link: '/pages/home.md',},
      {text: 'WebRTC',link: '/pages/webrtc/WebRTC源码分析(一)Android相机采集.md',},
    ],
    repo: 'https://github.com/yangkun19921001/AudioVideoBlogDoc',
    docsDir: 'docs/',
    docsBranch: 'main',
    editLink: true,
    editLinkPattern: ':repo/edit/:branch/:path',
    editLinkText: 'Edit this page',
    // 新增 侧边栏
    sidebar: {
      '/pages/webrtc/': [
        {
          children: [
            'WebRTC源码分析(一)Android相机采集'
          ,'WebRTC源码分析(二)Android视频硬件编码'
          ,'WebRTC 源码分析 (三) PeerConnection Client'
          ,'WebRTC P2P 从原理到应用'
          ,'WebRTC实战 - P2P音视频通话'
          ,'WebRTC 实战 - P2P架构的多人音视频通话解决方案'
          ,'WebRTC实战 - QT for Windows 实现多人音视频通话'
          ,'WebRTC实战 - mediasoup架构的多人音视频通话解决方案'
        ],
        },
      ], 
    },
  }),

  plugins: [
    // vuepress-plugin-comment2评论与阅读量插件
    // commentPlugin({
    //   // 插件选项
    //   provider: "Giscus", //评论服务提供者。
    //   comment: true, //启用评论功能
    //   repo: "yangkun19921001/AudioVideoBlogDoc", //远程仓库
    //   repoId: "R_kgDOJ8K9Rw", //对应自己的仓库Id
    //   category: "Announcements",
    //   categoryId: "DIC_kwDOJ8K9R84CX7pr" //对应自己的分类Id
    // }),

    new GiscusCommentPlugin({
      repo: 'yangkun19921001/AudioVideoBlogDoc',
      repoId: 'R_kgDOJ8K9Rw',
      category: 'Announcements',
      categoryId: 'DIC_kwDOJ8K9R84CX7pr',
      mapping: 'url',
      reactionsEnabled: false,
      emitMetadata: true,
      theme: 'light',
      inputPosition: 'bottom',
      lang: 'zh-CN',
      lazyLoading: true
  })
  ],
});
