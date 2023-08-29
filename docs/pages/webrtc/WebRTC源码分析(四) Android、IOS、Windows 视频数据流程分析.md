## 1. 简介

该篇文章主要针对在 (IOS、Android、Windows)平台上的视频数据的流程，只有当我们熟悉了这些流程后，才能快速针对性的去看某块代码。下面是一个简要的流程图，我们根据这个流程图然后来分析。

![WebRTC 简要数据流程图 (1)](http://devyk.top/2022/202308281502315.png)



**环境:**

- webrtc: m98
- Android / IOS 编解码：MediaCodec / VideoToolBox
- Windows 编解码：OpenH264 / FFmpeg H264
- Android / IOS / Windows 渲染：OpenGL ES / Metal / StretchDIBits



引用李超老师的一张数据流程图:

![image-20221119233539085](http://devyk.top/2022/202306111502251.png)

**建议阅读顺序:**

第一种方式: 

- IOS 阅读的话，可以参考 #? 序号，其它平台参考 IOS 阅读的顺序即可

第二种方式: 

- 平台采集 -> 公共编码 -> 平台编码 -> 公共编码  -> 封包 -> 发送->接收 -> 解包 -> 公共解码 -> 平台解码  

  -> 公共解码 -> 平台渲染



## 2. 发送

### 2.1 采集

#### 2.1.1 IOS

```tex
#8	webrtc::ObjCVideoTrackSource::OnCapturedFrame(RTCVideoFrame*) at webrtc/sdk/objc/native/src/objc_video_track_source.mm:124
#7	[RTCVideoSource capturer:didCaptureVideoFrame:] at webrtc/sdk/objc/api/peerconnection/RTCVideoSource.mm:79
#6	[RTCCameraVideoCapturer captureOutput:didOutputSampleBuffer:fromConnection:] at webrtc/sdk/objc/components/capturer/RTCCameraVideoCapturer.m:299
#5	[videoDataOutput setSampleBufferDelegate:self queue:self.frameQueue];
#4	[RTCCameraVideoCapturer setupVideoDataOutput] at webrtc/sdk/objc/components/capturer/RTCCameraVideoCapturer.m:455
#3	[RTCCameraVideoCapturer setupCaptureSession:] at webrtc/sdk/objc/components/capturer/RTCCameraVideoCapturer.m:438
#2	[RTCCameraVideoCapturer initWithDelegate:captureSession:] at webrtc/sdk/objc/components/capturer/RTCCameraVideoCapturer.m:73
#1	[RTCCameraVideoCapturer initWithDelegate:] at webrtc/sdk/objc/components/capturer/RTCCameraVideoCapturer.m:62


```



#### 2.1.2 Android 

```
########################### jni ###########################
webrtc::jni::AndroidVideoTrackSource::OnFrameCaptured
->android_video_track_source.cc:129
Java_org_webrtc_NativeAndroidVideoTrackSource_nativeOnFrameCaptured
->NativeAndroidVideoTrackSource_jni.h:109
########################### java ###########################
onFrameCaptured:58, NativeAndroidVideoTrackSource.java
nativeAndroidVideoTrackSource.onFrameCaptured(adaptedFrame):73, VideoSource.java
onFrameCaptured:62, VideoSource.java
onFrameCaptured:155, CameraCapture.java
events.onFrameCaptured:207, Camera2Session.java
listener.onFrame(frame):384, SurfaceTextureHelper.java
tryDeliverTextureFrame:207, SurfaceTextureHelper.java
capturer.startCapture(videoWidth, videoHeight, videoFps):960, PeerConnectionClient.java
setOnFrameAvailableListener:201, SurfaceTextureHelper.java
new SurfaceTextureHelper:75, SurfaceTextureHelper.java
create:64, SurfaceTextureHelper.java
create:92, SurfaceTextureHelper.java
SurfaceTextureHelper.create: SurfaceTextureHelper.java
createVideoTrack:957, PeerConnectionClient.java
```



#### 2.1.3 Windows

```
TestVideoCapturer::OnFrame(const VideoFrame& original_frame) test_video_captureer.cc 62
VcmCapturer::OnFrame(const VideoFrame& frame) vcm_capturer.cc 94
VideoCaptureImpl::DeliverCapturedFrame(VideoFrame& captureFrame) video_capture_impl.cc 107
VideoCaptureImpl::IncomingFrame  video_capture_impl.cc 117
CaptureSinkFilter::ProcessCapturedFrame sink_filter_ds.cc 916
CaptureInputPin::Receive(IMediaSample* media_sample) sink_filter_ds.cc 732

VideoCaptureDS::StartCapture(const VideoCaptureCapability& capability) video_capture_ds.cc 132
vcm_->StartCapture(capability_)  vcm_capturer.cc 55
VideoCaptureDS::Init(const char* deviceUniqueIdUTF8) video_capture_ds.cc 58
VideoCaptureImpl::Create video_capture_factory_windows.cc 31
VideoCaptureFactory::Create video_capture_factory.cc 22
VcmCapturer::Init vcm_capturer.cc 42
VcmCapturer::Create vcm_capturer.cc 70
CapturerTrackSource::Create()  conductor.cc 85
Conductor::AddTracks() conductor.cc 487
```



### 2.2 编码

公共部分:

```
#24	webrtc::VideoStreamEncoder::OnEncodedImage 
-> webrtc/video/video_stream_encoder.cc:1834

...//中间部分在下面的平台编码

#18	webrtc::VideoStreamEncoder::EncodeVideoFrame 
-> webrtc/video/video_stream_encoder.cc:1760
#17	webrtc::VideoStreamEncoder::MaybeEncodeVideoFrame
-> webrtc/video/video_stream_encoder.cc:1619
#16	webrtc::VideoStreamEncoder::OnFrame 
-> webrtc/video/video_stream_encoder.cc:1308
#15	webrtc::VideoStreamEncoder::CadenceCallback::OnFrame 
-> webrtc/video/video_stream_encoder.h:152
#14	webrtc::(anonymous namespace)::PassthroughAdapterMode::OnFrame(
-> webrtc/video/frame_cadence_adapter.cc:64
#13	webrtc::(anonymous namespace)::FrameCadenceAdapterImpl::OnFrameOnMainQueue
-> webrtc/video/frame_cadence_adapter.cc:269
#12	 webrtc::(anonymous namespace)::FrameCadenceAdapterImpl::OnFrame
-> webrtc/video/frame_cadence_adapter.cc:245
#11	webrtc::(anonymous namespace)::FrameCadenceAdapterImpl::OnFrame
-> webrtc/video/frame_cadence_adapter.cc:239
#10	rtc::VideoBroadcaster::OnFrame
-> webrtc/media/base/video_broadcaster.cc:97

//ios & android ,Windows 不执行 跳过， ↑ ↑ ↑ ↑
#9	rtc::AdaptedVideoTrackSource::OnFrame
-> webrtc/media/base/adapted_video_track_source.cc:60
```



#### 2.2.1 硬编码

##### 2.2.1.1 IOS

```
↑↑↑↑↑↑↑↑↑↑↑↑
看上面公共部分代码
↑↑↑↑↑↑↑↑↑↑↑↑

#23	invocation function for block in webrtc::(anonymous namespace)::ObjCVideoEncoder::RegisterEncodeCompleteCallback
-> webrtc/sdk/objc/native/src/objc_video_encoder_factory.mm:63

#22	-[RTCVideoEncoderH264 frameWasEncoded:flags:sampleBuffer:
codecSpecificInfo:width:height:renderTimeMs:timestamp:rotation:] 
-> webrtc/sdk/objc/components/video_codec/RTCVideoEncoderH264.mm:853

#21 in (anonymous namespace)::compressionOutputCallback
-> webrtc/sdk/objc/components/video_codec/RTCVideoEncoderH264.mm:161

#20	-[RTCVideoEncoderH264 encode:codecSpecificInfo:frameTypes:] 
-> webrtc/sdk/objc/components/video_codec/RTCVideoEncoderH264.mm:392

#19	webrtc::(anonymous namespace)::ObjCVideoEncoder::Encode
-> webrtc/sdk/objc/native/src/objc_video_encoder_factory.mm:81
```



##### 2.2.1.1 Android

```
########################### jni ###########################
↑↑↑↑↑↑↑↑↑↑↑↑
看上面公共部分代码
↑↑↑↑↑↑↑↑↑↑↑↑

callback_->OnEncodedImage video_encoder_wrapper.cc:310
VideoEncoderWrapper::OnEncodedFrame video_encoder_wrapper.cc:258
Java_org_webrtc_VideoEncoderWrapper_nativeOnEncodedFrame VideoEncoderWrapper_jni.h:41
########################### java ###########################
nativeOnEncodedFrame:41 VideoEncoderWrapper.java
callback.onEncodedFrame:642 HardwareVideoEncoder.java
deliverEncodedImage():565 HardwareVideoEncoder.java
textureEglBase.swapBuffers:425  HardwareVideoEncoder.java
videoFrameDrawer.drawFrame:424  HardwareVideoEncoder.java
encodeTextureBuffer:414  HardwareVideoEncoder.java
encode:344 HardwareVideoEncoder.java
########################### jni ###########################
Java_VideoEncoder_encode VideoEncoder_jni.h :492
webrtc::jni::VideoEncoderWrapper::Encode
->video_encoder_wrapper.cc:147

```



##### 2.2.1.1 Windows

```
//todo...没有硬编码环境
```



#### 2.2.3 软编码

**OpenH264:**

```
↑↑↑↑↑↑↑↑↑↑↑↑
看上面公共部分代码
↑↑↑↑↑↑↑↑↑↑↑↑
H264EncoderImpl::Encode h264_encoder_impl.cc 365
```



### 2.3 编码结束 -> RTP 打包

```
#36	webrtc::RtpPacketizerH264::PacketizeStapA
-> webrtc/modules/rtp_rtcp/source/rtp_format_h264.cc:161
#35	webrtc::RtpPacketizerH264::GeneratePackets
-> webrtc/modules/rtp_rtcp/source/rtp_format_h264.cc:103
#34	webrtc::RtpPacketizerH264::RtpPacketizerH264
-> webrtc/modules/rtp_rtcp/source/rtp_format_h264.cc:62
#33	webrtc::RtpPacketizerH264::RtpPacketizerH264
-> webrtc/modules/rtp_rtcp/source/rtp_format_h264.cc:51
#32	
#31 webrtc::RtpPacketizer::Create
-> webrtc/modules/rtp_rtcp/source/rtp_format.cc:43
#30	webrtc::RTPSenderVideo::SendVideo
-> webrtc/modules/rtp_rtcp/source/rtp_sender_video.cc:486
#29	webrtc::RTPSenderVideo::SendEncodedImage
-> webrtc/modules/rtp_rtcp/source/rtp_sender_video.cc:774
#28 webrtc::RtpVideoSender::OnEncodedImage
-> webrtc/call/rtp_video_sender.cc:600
#27	webrtc::internal::VideoSendStreamImpl::OnEncodedImage
-> webrtc/video/video_send_stream_impl.cc:566
#26 
#25 webrtc::VideoStreamEncoder::OnEncodedImage
-> webrtc/video/video_stream_encoder.cc:1904

```



### 2.4 打包完成 -> PacedSender 队列

```
#41	webrtc::PacingController::EnqueuePacket
-> webrtc/modules/pacing/pacing_controller.cc:241
#40	webrtc::TaskQueuePacedSender::EnqueuePackets 
-> webrtc/modules/pacing/task_queue_paced_sender.cc:145
#39 webrtc::TaskQueuePacedSender::EnqueuePackets
-> webrtc/modules/pacing/task_queue_paced_sender.cc:140
#38 webrtc::RTPSender::EnqueuePackets
-> webrtc/modules/rtp_rtcp/source/rtp_sender.cc:509
#37 webrtc::RTPSenderVideo::LogAndSendToNetwork
-> webrtc/modules/rtp_rtcp/source/rtp_sender_video.cc:210
```



### 2.5 Socket#send

```
#59 ::sendto
#58 rtc::PhysicalSocket::DoSendTo
-> webrtc/rtc_base/physical_socket_server.cc:510
#57 rtc::PhysicalSocket::SendTo
-> webrtc/rtc_base/physical_socket_server.cc:375
#56 rtc::AsyncUDPSocket::SendTo
-> webrtc/rtc_base/async_udp_socket.cc:84
#55 cricket::UDPPort::SendTo
-> webrtc/p2p/base/stun_port.cc:286
#54 cricket::ProxyConnection::Send
-> webrtc/p2p/base/connection.cc:1371
#53 cricket::P2PTransportChannel::SendPacket
-> webrtc/p2p/base/p2p_transport_channel.cc:1616
#52 cricket::DtlsTransport::SendPacket
-> webrtc/p2p/base/dtls_transport.cc:417
#51 webrtc::RtpTransport::SendPacket
-> webrtc/pc/rtp_transport.cc:147
#50 webrtc::SrtpTransport::SendRtpPacket
-> webrtc/pc/srtp_transport.cc:173
#49 cricket::BaseChannel::SendPacket
-> webrtc/pc/channel.cc:437
#48 cricket::BaseChannel::SendPacket
-> webrtc/pc/channel.cc:318
#47 cricket::MediaChannel::DoSendPacket
-> webrtc/media/base/media_channel.cc:163
#46	 cricket::MediaChannel::SendPacket
-> webrtc/media/base/media_channel.cc:71
#45	 cricket::MediaChannel::SendRtp
-> webrtc/media/base/media_channel.cc:184
#44	 cricket::WebRtcVideoChannel::SendRtp
-> webrtc/media/engine/webrtc_video_engine.cc:2058
#43	 webrtc::RtpSenderEgress::SendPacketToNetwork
-> webrtc/modules/rtp_rtcp/source/rtp_sender_egress.cc:553
#42	 webrtc::RtpSenderEgress::SendPacket
-> webrtc/modules/rtp_rtcp/source/rtp_sender_egress.cc:273
#41	 webrtc::ModuleRtpRtcpImpl2::TrySendPacket
-> webrtc/modules/rtp_rtcp/source/rtp_rtcp_impl2.cc:376
#40	 webrtc::PacketRouter::SendPacket
-> webrtc/modules/pacing/packet_router.cc:160
#39	 webrtc::PacingController::ProcessPackets
-> webrtc/modules/pacing/pacing_controller.cc:585
#38	webrtc::TaskQueuePacedSender::MaybeProcessPackets
-> webrtc/modules/pacing/task_queue_paced_sender.cc:234

```



## 3. 接收

### 3.1 接收 RTP 包

```
#12	cricket::WebRtcVideoChannel::OnPacketReceived
-> webrtc/media/engine/webrtc_video_engine.cc:1744
#11	cricket::BaseChannel::OnRtpPacket
-> webrtc/pc/channel.cc:467
#10	webrtc::RtpDemuxer::OnRtpPacket
-> webrtc/call/rtp_demuxer.cc:249
#09	webrtc::RtpTransport::DemuxPacket
-> webrtc/pc/rtp_transport.cc:194
#08	webrtc::SrtpTransport::OnRtpPacketReceived
-> webrtc/pc/srtp_transport.cc:226
#07	webrtc::RtpTransport::OnReadPacket
-> webrtc/pc/rtp_transport.cc:268
#06	 cricket::DtlsTransport::OnReadPacket
-> webrtc/p2p/base/dtls_transport.cc:627
#05	cricket::P2PTransportChannel::OnReadPacket
-> webrtc/p2p/base/p2p_transport_channel.cc:2215
#04	cricket::Connection::OnReadPacket
-> webrtc/p2p/base/connection.cc:465
#03	cricket::UDPPort::OnReadPacket
-> webrtc/p2p/base/stun_port.cc:394
#02	cricket::UDPPort::HandleIncomingPacket
-> webrtc/p2p/base/stun_port.cc:335
#01	cricket::AllocationSequence::OnReadPacket
-> webrtc/p2p/client/basic_port_allocator.cc:1639

```





### 3.2 解包 & 放入缓冲区

```
#25 webrtc::video_coding::FrameBuffer::InsertFrame
-> webrtc/modules/video_coding/frame_buffer2.cc:407
#24 webrtc::internal::VideoReceiveStream2::OnCompleteFrame
-> webrtc/video/video_receive_stream2.cc:660
#23 webrtc::RtpVideoStreamReceiver2::OnCompleteFrames
-> webrtc/video/rtp_video_stream_receiver2.cc:862
#22 webrtc::RtpVideoStreamReceiver2::OnAssembledFrame
-> webrtc/video/rtp_video_stream_receiver2.cc:850
#21 webrtc::RtpVideoStreamReceiver2::OnInsertedPacket
-> webrtc/video/rtp_video_stream_receiver2.cc:755
#20 webrtc::RtpVideoStreamReceiver2::OnReceivedPayloadData
-> webrtc/video/rtp_video_stream_receiver2.cc:620
#19 webrtc::RtpVideoStreamReceiver2::ReceivePacket
-> webrtc/video/rtp_video_stream_receiver2.cc:965
#18 webrtc::RtpVideoStreamReceiver2::OnRtpPacket
-> webrtc/video/rtp_video_stream_receiver2.cc:654
#17 webrtc::RtpDemuxer::OnRtpPacket
-> webrtc/call/rtp_demuxer.cc:249
#16 webrtc::RtpStreamReceiverController::OnRtpPacket
-> webrtc/call/rtp_stream_receiver_controller.cc:52
#15 webrtc::internal::Call::DeliverRtp
-> webrtc/call/call.cc:1615
#14	 webrtc::internal::Call::DeliverPacket
-> webrtc/call/call.cc:1637
#13	cricket::WebRtcVideoChannel::OnPacketReceived
-> webrtc/media/engine/webrtc_video_engine.cc:1748

```



### 3.3 解码

```
#48 rtc::VideoBroadcaster::OnFrame
-> webrtc/media/base/video_broadcaster.cc:97
#47 cricket::WebRtcVideoChannel::WebRtcVideoReceiveStream::OnFrame
-> webrtc/media/engine/webrtc_video_engine.cc:3129
#46 webrtc::internal::VideoReceiveStream2::OnFrame
-> webrtc/video/video_receive_stream2.cc:589
#45 webrtc::IncomingVideoStream::Dequeue
-> webrtc/common_video/incoming_video_stream.cc:56
#44 webrtc::IncomingVideoStream::OnFrame
-> webrtc/common_video/incoming_video_stream.cc:47
#43 webrtc::IncomingVideoStream::OnFrame
-> webrtc/common_video/incoming_video_stream.cc:44
#42 webrtc::internal::VideoStreamDecoder::FrameToRender
-> webrtc/video/video_stream_decoder2.cc:51
#41 webrtc::VCMDecodedFrameCallback::Decoded
-> webrtc/modules/video_coding/generic_decoder.cc:74
#39	 webrtc::VCMDecodedFrameCallback::Decoded
-> webrtc/modules/video_coding/generic_decoder.cc:69


//....看个平台的实现

#34 webrtc::VCMGenericDecoder::Decode
-> webrtc/modules/video_coding/generic_decoder.cc:283

#33 webrtc::VideoReceiver2::Decode
-> webrtc/modules/video_coding/video_receiver2.cc:109

#32 webrtc::internal::VideoReceiveStream2::DecodeAndMaybeDispatchEncodedFrame
-> webrtc/video/video_receive_stream2.cc:842

#31 webrtc::internal::VideoReceiveStream2::HandleEncodedFrame
-> webrtc/video/video_receive_stream2.cc:776

#30 webrtc::internal::VideoReceiveStream2::StartNextDecode
-> webrtc/video/video_receive_stream2.cc:729

#29 webrtc::video_coding::FrameBuffer::StartWaitForNextFrameOnQueue
-> webrtc/modules/video_coding/frame_buffer2.cc:131

#28 webrtc::RepeatingTaskHandle webrtc::RepeatingTaskHandle::
DelayedStart<webrtc::video_coding::FrameBuffer::StartWaitForNextFrameOnQueue
-> webrtc/rtc_base/task_utils/repeating_task.h:130

#27 webrtc::video_coding::FrameBuffer::StartWaitForNextFrameOnQueue
-> webrtc/modules/video_coding/frame_buffer2.cc:106

#26 webrtc::video_coding::FrameBuffer::InsertFrame
-> webrtc/modules/video_coding/frame_buffer2.cc:499

```



#### 3.3.1 硬解码

##### 3.3.1.1 IOS

```
↑↑↑↑↑↑↑↑↑↑↑↑
看上面公共部分代码
↑↑↑↑↑↑↑↑↑↑↑↑

#38	webrtc::(anonymous namespace)::ObjCVideoDecoder::RegisterDecodeCompleteCallback(
-> webrtc/sdk/objc/native/src/objc_video_decoder_factory.mm:70


#37	decompressionOutputCallback
-> webrtc/sdk/objc/components/video_codec/RTCVideoDecoderH264.mm:53

#36 -[RTCVideoDecoderH264 decode:missingFrames:codecSpecificInfo:renderTimeMs:] 
-> webrtc/sdk/objc/components/video_codec/RTCVideoDecoderH264.mm:107
#35	webrtc::(anonymous namespace)::ObjCVideoDecoder::Decode
-> webrtc/sdk/objc/native/src/objc_video_decoder_factory.mm:51

```

##### 3.3.1.2 Android

```
↑↑↑↑↑↑↑↑↑↑↑↑
看上面公共部分代码
↑↑↑↑↑↑↑↑↑↑↑↑
########################### jni ###########################
webrtc::jni::VideoDecoderWrapper video_deocder_wrapper.cc 191
Java_org_webrtc_VideoDecoderWrapper_nativeOnDecodedFrame VideoDecoderWrapper_jni.cc 50
Java_org_webrtc_VideoDecoderWrapper_nativeOnDecodedFrame VideoDecoderWrapper_jni.cc 41
########################### java ###########################
lambda$createDecoderCallback$0:22, VideoDecoderWrapper.java
onFrame:451, AndroidVideoDecoder.java
tryDeliverTextureFrame:384, SurfaceTextureHelper.java
lambda$new$tryDeliverTextureFrame$SurfaceTextureHelper:207, SurfaceTextureHelper.java
deliverDecodedFrame:402, AndroidVideoDecoder.java
decode:209, AndroidVideoDecoder.java
########################### jni ###########################
Java_VideoDecoder_decode VideoDecoder_jni.cc 146
webrtc::jni::VideoDecoderWrapper::Decode video_decoder_wrapper.cc 123
webrtc::VideoDecoderSoftwareFallbackWrapper video_decoder_software_fallback_wrapper.cc 187
```



##### 3.3.1.3 Windows

```
//todo ... 没有硬解码环境
```



#### 3.3.2 软解码

**FFmpeg h264:**

```
↑↑↑↑↑↑↑↑↑↑↑↑
看上面公共部分代码
↑↑↑↑↑↑↑↑↑↑↑↑
H264DecoderImpl::Decode h264_decoder_impl.cc 256
```



### 3.4 视频渲染

#### 3.4.1 IOS

```
#51	 -[RTCMTLVideoView renderFrame:] 
-> webrtc/sdk/objc/components/renderer/metal/RTCMTLVideoView.m:253
#50	 webrtc::VideoRendererAdapter::OnFrame
-> webrtc/sdk/objc/api/RTCVideoRendererAdapter.mm:40
#49	 webrtc::VideoRendererAdapter::OnFrame
-> webrtc/sdk/objc/api/RTCVideoRendererAdapter.mm:30

```



#### 3.4.2 Android 

```
########################### java ###########################
eglBase.swapBuffers:669 EglRenderer.java
frameDrawer.drawFrame:664 EglRenderer.java
renderFrameOnRenderThread:597 EglRenderer.java
onFrame:102 SurfaceEglRenderer.java
onFrame:184 SurfaceVideoRenderer.java
onFrame:138, CallActivity$ProxyVideoSink.java
########################### jni ###########################
Java_VideoSink_onFrame VideoSink_jni.h 43
webrtc::jni::VideoSinkWrapper::OnFrame video_sink.cc 24
```



#### 3.4.3 Windows

```
MainWnd::VideoRenderer::OnFrame(const webrtc::VideoFrame& video_frame) main_wnd.cc 613
```



## 总结

通过该篇文章我们已经大致熟悉了 WebRTC 在 IOS 、Android 、Windows 平台上的视频数据流程，在阅读代码的过程中，我们可以看一下它是如何做到的跨平台，相关跨平台的 API 又是如何设计的？这些都是值得我们去学习的。



## 参考

- [WebRTC Native M96 视频发送编码(OpenH264)流程以及接收视频包解码(FFmpeg)播放流程](https://dabaojian.blog.csdn.net/article/details/123012882)
- [WebRTC视频JitterBuffer详解](https://blog.csdn.net/sonysuqin/article/details/106629343)



