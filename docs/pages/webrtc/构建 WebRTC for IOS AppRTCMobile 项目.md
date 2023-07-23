

## 简介

在之前的几篇文章中，我们已经学习了如何在 `Web`、`Windows` 和 `Android` 平台上封装和建立一个 P2P 和 P2PS 音视频通话项目。然而，我们还没有讨论在 `Linux` 和 `iOS` 平台上如何操作。因此，这篇文章将首先介绍如何在 `iOS` 平台上构建 `WebRTC AppRTCMobile` 项目。在后续的文章中，我们将继续探讨 `Linux` 平台的实现。

这是 `Android` 与 `IOS` 基于 `webrtc：m98` 构建的通话效果:

![img_v2_dede26f4-da7b-484c-a61b-b2d5a18f593g](http://devyk.top/2022/202307222212963.jpg)

如何还想了解  `Web` 、`Windows` 、`Android`  WebRTC 开发，可以移步如下文章

[WebRTC 系列文章](https://yangkun19921001.github.io/AudioVideoBlog/pages/webrtc/)

## 环境搭建

由于我们主要搭建官方的 `AppRTCMobile` 项目，所以就用不到之前开发的信令服务器，那么就只能用官方提供的 `AppRTC` 做为信令服务器了。

### 部署 AppRTC 信令服务器

我们可以使用 `docker` 来进行搭建

```shell
#https://hub.docker.com/r/piasy/apprtc-server/

docker run --rm --net=host \
  -e PUBLIC_IP=<server public IP> \
  -it piasy/apprtc-server
  
示例:
docker run --rm --net=host   -e PUBLIC_IP=192.144.201.2   -it piasy/apprtc-server

检查是否运行起来
lsof -i 8080
```

### WebRTC for IOS 编译

1. clone webrtc

   ```shell
   git clone git@github.com:yangkun19921001/OpenRTCClient.git
   git checkout develop
   
   #配置 OpenRTCClient/build_system 环境变量
   cd OpenRTCClient/webrtc
   
   webrtc_build gen ios arm64 debug ../build_system/build_options_set/default out 
   
   webrtc_build build ios arm64 debug ../build_system/build_options_set/default out
   
   ```

在编译的过程中，如果出现如下错误:

1.1 `../../../../../webrtc/third_party/ffmpeg/libavutil/macros.h:28:10: fatal error: 'libavutil/avconfig.h`

找到 `out/ios/arm64/debug/args.gn` ,将 `rtc_use_h264 = false`  改为 `false`

1.2 安装失败

![image-20230722225700632](http://devyk.top/2022/202307222257900.png)

`ios` 安装没有 `android` 那么方便，它对安装的应用安全性较高，所以我们要进行编译打开签名的配置

`ios_enable_code_signing = true`

1.3 `Bundle Identifier & info.list` 修改保持一致

<key>CFBundleIdentifier</key>

<string>xxx.xxx</string>

1.4 `Xcode 14 - Cannot code sign because the target does not have an Info.plist file`

```
Select Build Settings --> Packaging --> Generate info.plist File = info.plist 绝对路径
```



### 运行 AppRTCMobile

编译完成后，找到下图的文件然后双击打开

![image-20230722224648827](http://devyk.top/2022/202307222246188.png)

打开后是这样的

![image-20230722225118462](http://devyk.top/2022/202307222251477.png)

进行签名配置:

![image-20230722225333621](http://devyk.top/2022/202307222253861.png)



配置 info.plist 路径

![image-20230722225514346](http://devyk.top/2022/202307222255677.png)

还有一个问题，由于我当前 `IOS` 版本是 `16.5.1` ,然后 `XCode` 报不支持该设备

![image-20230722225754973](http://devyk.top/2022/202307222257325.png)

解决办法是升级 `OS` 和 `XCode` 版本，升级后的版本为:

![image-20230722225918748](http://devyk.top/2022/202307222259112.png)

![image-20230722225945378](http://devyk.top/2022/202307222259720.png)



然后，最后一步还需要再 `IPhone -> 设置 -> 通用 -> VPN 与设备管理中找到我们刚刚运行的 app, 然后点击信任`。

![image-20230722230411589](http://devyk.top/2022/202307222304121.png)

到这里，就能编译成功并运行起来了。

## 总结

今天算是搞了一天，最后终于是运行起来并达到了预期。

后续我们将继续分享 `webrtc` 相关的知识，下期再会！





## 简介

在之前的几篇文章中，我们已经学习了如何在 `Web`、`Windows` 和 `Android` 平台上封装和建立一个 P2P 和 P2PS 音视频通话项目。然而，我们还没有讨论在 `Linux` 和 `iOS` 平台上如何操作。因此，这篇文章将首先介绍如何在 `iOS` 平台上构建 `WebRTC AppRTCMobile` 项目。在后续的文章中，我们将继续探讨 `Linux` 平台的实现。

这是 `Android` 与 `IOS` 基于 `webrtc：m98` 构建的通话效果:

![img_v2_dede26f4-da7b-484c-a61b-b2d5a18f593g](http://devyk.top/2022/202307222212963.jpg)

如何还想了解  `Web` 、`Windows` 、`Android`  WebRTC 开发，可以移步如下文章

[WebRTC 系列文章](https://yangkun19921001.github.io/AudioVideoBlog/pages/webrtc/)

## 环境搭建

由于我们主要搭建官方的 `AppRTCMobile` 项目，所以就用不到之前开发的信令服务器，那么就只能用官方提供的 `AppRTC` 做为信令服务器了。

### 部署 AppRTC 信令服务器

我们可以使用 `docker` 来进行搭建

```shell
#https://hub.docker.com/r/piasy/apprtc-server/

docker run --rm --net=host \
  -e PUBLIC_IP=<server public IP> \
  -it piasy/apprtc-server
  
示例:
docker run --rm --net=host   -e PUBLIC_IP=192.144.201.2   -it piasy/apprtc-server

检查是否运行起来
lsof -i 8080
```

### WebRTC for IOS 编译

1. clone webrtc

   ```shell
   git clone git@github.com:yangkun19921001/OpenRTCClient.git
   git checkout develop
   
   #配置 OpenRTCClient/build_system 环境变量
   cd OpenRTCClient/webrtc
   
   webrtc_build gen ios arm64 debug ../build_system/build_options_set/default out 
   
   webrtc_build build ios arm64 debug ../build_system/build_options_set/default out
   
   ```

在编译的过程中，如果出现如下错误:

1.1 `../../../../../webrtc/third_party/ffmpeg/libavutil/macros.h:28:10: fatal error: 'libavutil/avconfig.h`

找到 `out/ios/arm64/debug/args.gn` ,将 `rtc_use_h264 = false`  改为 `false`

1.2 安装失败

![image-20230722225700632](http://devyk.top/2022/202307222257900.png)

`ios` 安装没有 `android` 那么方便，它对安装的应用安全性较高，所以我们要进行编译打开签名的配置

`ios_enable_code_signing = true`

1.3 `Bundle Identifier & info.list` 修改保持一致

<key>CFBundleIdentifier</key>

<string>xxx.xxx</string>

1.4 `Xcode 14 - Cannot code sign because the target does not have an Info.plist file`

```
Select Build Settings --> Packaging --> Generate info.plist File = info.plist 绝对路径
```



### 运行 AppRTCMobile

编译完成后，找到下图的文件然后双击打开

![image-20230722224648827](http://devyk.top/2022/202307222246188.png)

打开后是这样的

![image-20230722225118462](http://devyk.top/2022/202307222251477.png)

进行签名配置:

![image-20230722225333621](http://devyk.top/2022/202307222253861.png)



配置 info.plist 路径

![image-20230722225514346](http://devyk.top/2022/202307222255677.png)

还有一个问题，由于我当前 `IOS` 版本是 `16.5.1` ,然后 `XCode` 报不支持该设备

![image-20230722225754973](http://devyk.top/2022/202307222257325.png)

解决办法是升级 `OS` 和 `XCode` 版本，升级后的版本为:

![image-20230722225918748](http://devyk.top/2022/202307222259112.png)

![image-20230722225945378](http://devyk.top/2022/202307222259720.png)



然后，最后一步还需要再 `IPhone -> 设置 -> 通用 -> VPN 与设备管理中找到我们刚刚运行的 app, 然后点击信任`。

![image-20230722230411589](http://devyk.top/2022/202307222304121.png)

到这里，就能编译成功并运行起来了。

## 总结

今天算是搞了一天，最后终于是运行起来并达到了预期。

后续我们将继续分享 `webrtc` 相关的知识，下期再会！



