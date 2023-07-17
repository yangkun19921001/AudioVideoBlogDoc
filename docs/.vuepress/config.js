import { defineUserConfig, defaultTheme } from 'vuepress';




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
      {
        text: '首页',
        link: '/pages/home.md',
      },
      // {
      //   text: '基础概念',
      //   link: '/pages/base/a.md',
      // },
      // {
      //   text: 'OpenGL',
      //   link: '/pages/opengl/README.md',
      // },
      // {
      //   text: 'FFmpeg',
      //   link: '/pages/ffmpeg/README.md',
      // },
      {
        text: 'WebRTC',
        link: '/pages/webrtc/WebRTC源码分析(一)Android相机采集.md',
      },
      // {
      //   text: 'GStreamer',
      //   link: '/pages/gstreamer/README.md',
      // },
      // {
      //   text: '音视频处理',
      //   children: [
      //     {
      //       text: '采集',
      //       link: '/pages/capture/install_guide.md',
      //       // 该元素将一直处于激活状态
      //       activeMatch: '/pages/capture/install_guide.md',
      //     },
      //     {
      //       text: '编解码',
      //       link: '/pages/codec/detail_usage.md',
      //       activeMatch: '/pages/codec/detail_usage.md',
      //     },
      //     {
      //       text: '渲染',
      //       link: '/pages/render/other.md',
      //     }
      //   ],
      // },
      // {
      //   text: '流媒体协议',
      //   link: '/pages/stream/README.md',
      // },
      // {
      //   text: '解决方案',
      //   children: [
      //     {
      //       text: '音视频通话',
      //       link: '/pages/project/1.音视频通话.md',
      //       // 该元素将一直处于激活状态
      //       activeMatch: '/pages/project/1.音视频通话.md',
      //     },
      //     {
      //       text: '云游戏',
      //       link: '/pages/project/other.md',
      //     },
      //     {
      //       text: '远程控制',
      //       link: '/pages/project/other.md',
      //     },
      //   ],
      // },
    ],
    repo: 'https://github.com/yangkun19921001/AudioVideoBlogDoc',
    docsDir: 'docs/',
    docsBranch: 'main',
    editLink: true,
    editLinkPattern: ':repo/edit/:branch/:path',
    editLinkText: 'Edit this page',
    // 新增 侧边栏
    sidebar: {
      // '/pages/project/': [
      //   {
      //     children: ['1.音视频通话.md','2.P2P架构的多人音视频通话.md','3.SFU架构的多人音视频通话.md'],
      //   },
      // ],
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
      // '/pages/base/': [
      //   {
      //     children: ['a.md','b.md'],
      //   },
      // ],
      
    },
  }),
});
