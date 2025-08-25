---
title: netty server启动流程(一)
date:  2023-03-31 22:27:06
category: netty
tag: netty
description: netty server启动流程(一)

---

1. ## netty server启动流程

   @startuml
   !theme toy
   autonumber
   participant ServerBootstrap as server
   participant DefaultChannelPipeline as pipeline
   participant NioServerSocketChannel as channel
   participant DefaultChannelHandlerContext as context
   participant DefaultChannelPipeline.HeadHandler as headHandler
   participant NioServerSocketChannel.NioMessageUnsafe as unsafe
   participant ServerSocketChannel as SocketChannel
   ==启动流程==
   server -> server : bind
   activate server
   server -> server : doBind
   server -> server : initAndRegister
   server -> server : newChannel
   server -> server : init
   server -> pipeline : addLast
   activate pipeline
   note left
   添加一个ChannelInitializer匿名实现
   在其initChannel方法中添加server的handler到pipeline
   并添加ServerBootstrapAcceptor到pipeline
   end note
   server -> server : doBind0
   server -> channel : bind
   activate channel
   channel -> pipeline : bind
   pipeline -> context : bind
   activate context
   context -> context: findAndInvokeBind
   context -> context: findContextOutbound
   note left: 查找bind
   context -> context: invokeBind
   context -> headHandler: bind
   context -> unsafe : bind
   activate unsafe
   unsafe -> channel : doBind
   channel -> SocketChannel: bind
   unsafe -> unsafe : invokeLater
   unsafe -> pipeline : fireChannelActive
   pipeline -> context : invokeChannelActive
   context -> 
   @enduml

   

2. kk