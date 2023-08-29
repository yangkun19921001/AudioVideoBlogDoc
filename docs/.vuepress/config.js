import { defineUserConfig } from "@vuepress/cli";
import { defaultTheme } from "@vuepress/theme-default";
import { commentPlugin } from "vuepress-plugin-comment2";


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
      {text: 'WebRTC',link: '/pages/webrtc/README.md',},
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
           'WebRTC P2P 从原理到应用'
          ,'WebRTC源码分析(一)Android相机采集'
          ,'WebRTC源码分析(二)Android视频硬件编码'
          ,'WebRTC源码分析(三)PeerConnection Client'
          ,'WebRTC源码分析(四) Android、IOS、Windows 视频数据流程分析'
          ,'WebRTC实战 - P2P音视频通话'
          ,'WebRTC实战 - P2P架构的多人音视频通话解决方案'
          ,'WebRTC实战 - QT for Windows 实现多人音视频通话'
          ,'WebRTC实战 - mediasoup架构的多人音视频通话解决方案'
          ,'构建 WebRTC for IOS AppRTCMobile 项目'
        ],
        },
      ], 
    },
  }),

  plugins: [
    commentPlugin({
      provider: "Giscus",
    }),
  ],
});
