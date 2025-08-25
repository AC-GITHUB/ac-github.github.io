---
title: zookeeper数据流程源码(二)
date:  2023-03-25 19:32:16
category: zookeeper
tag: zookeeper
description: zookeeper数据流程源码(二)
---

1. ## zookeeper数据写入流程

   ![img](/static/articleImage/2023/Zookeeper写数据流程.awebp?url)

2. ## 客户端初始化流程

   @startuml
   !theme toy
   skinparam ActivityBackgroundColor FF6F61
   skinparam Shadowing true
   skinparam ActivityBorderThickness 2
   start
   :NIOServerCnxnFactory::configure;
   note right 
   设置maxClientCnxns参数，
   初始化Math.sqrt((float) numCores / 2)
   个selectorThreads
   初始化numWorkerThreads为2 * numCores;
   end note
   :NIOServerCnxnFactory::start;
   
   split
   :WorkerService::start;
   note right
   初始化numWorkerThreads个线程的线程池
   workers.add(
   Executors.newFixedThreadPool(
   numWorkerThreads, 
   new DaemonThreadFactory(threadNamePrefix)));
   end note
   
   split again
   :SelectorThread::start;
   :SelectorThread::run;
   :SelectorThread::select;
   
   split
   :SelectorThread::processAcceptedConnections 轮询获取接受的客户端;
   :NIOServerCnxnFactory::createConnection ;
   note right:包装socket为NIOServerCnxn,key.attach(cnxn);
   :NIOServerCnxnFactory::addCnxn;
   :SelectorThread::processInterestOpsUpdateRequests;
   split again
   :SelectorThread::handleIO;
   :WorkerService::schedule;
   note right
   将连接包装为IOWorkRequest，
   分发到WorkerService处理
   IOWorkRequest workRequest =
    new IOWorkRequest(this, key);
   workerPool.schedule(workRequest);
   提交请求到workerPool的workers线程池，
   最后转到
   NIOServerCnxnFactory::IOWorkRequest::doWork
   end note
   :NIOServerCnxn::doIO;
   :NIOServerCnxn::readPayload;
   :NIOServerCnxn::readRequest;
   :ZooKeeperServer::processPacket;
   :ZooKeeperServer::submitRequest;
   :RequestThrottler::submitRequest;
   note right: 提交请求到RequestThrottler::submittedRequests,异步线程单独处理
   :ZooKeeperServer::submitRequestNow;
   :ZooKeeperServer::submitRequestNow;
   :firstProcessor.processRequest(si);
   note right: firstProcessor对于不同的角色有不同的实现
   end split
   
   split again
   :AcceptThread::start;
   :AcceptThread::run;
   :AcceptThread::select;
   :AcceptThread::doAccept;
   :ServerSocketChannel::accept() 接受客户端连接;
   :SelectorThread::addAcceptedConnection() 接受客户端连接;
   note right
   轮询selectorThreads将接受的客户端连接，
   分发给SelectorThread处理
   // Round-robin assign this connection 
   //to a selector thread
   if (!selectorIterator.hasNext()) {
   selectorIterator = selectorThreads.iterator();
   }
   SelectorThread selectorThread = selectorIterator.next();
   selectorThread.addAcceptedConnection(sc)
   end note
   split again
   
   :ExpirerThread::start;
   end split
   end
   @enduml

   

3. ## leader客户端数据处理流程

   

4. ## following客户端数据处理流程

   

5. ## observeing客户端数据处理流程

   

6. kk

