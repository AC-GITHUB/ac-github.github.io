---
title: zookeeper启动流程源码(一)
date:  2023-03-11 22:09:23
category: zookeeper
tag: zookeeper
description: zookeeper启动流程源码(一)
---

1. ## 源码目录介绍

   [源码地址](https://github.com/apache/zookeeper.git)

   ![zookeeper源码目录](/static/articleImage/2023/zookeeper源码目录.png)

2. ## zookeeper启动流程

   ![img](/static/articleImage/2023/zookeeper启动流程源码.png)

3. ## 启动顺序图

   @startuml
   !theme toy
   autonumber
   participant QuorumPeerMain as main
   participant QuorumPeer as peer
   participant ZKDatabase as db
   participant ServerCnxnFactory as connFc
   participant FastLeaderElection as fle
   participant QuorumCnxManager.Listener as qcmL
   main -> main : main
   note left: 主函数启动入口
   activate main
   main -> main : initializeAndRun
   note left: 解析配置
   main -> main : runFromConfig
   note left: 启动
   main -> connFc : configure
   note right: 配置网络参数
   activate connFc
   main -> peer : initialize
   activate peer
   main -> peer : start
   peer -> db : loadDatabase
   note right: 加载已存在的数据，新启动的程序初始化数据文件
   activate db
   peer -> connFc : start
   note right: 启动数据请求的网络连接
   peer -> qcmL : start
   note right: 启动选举管理
   activate qcmL
   peer -> fle : start
   note right: 启动选举
   activate fle
   peer -> peer : run
   note right: 启动线程
   @enduml


4. ## 选举网络启动流程


   @startuml
   !theme toy
   autonumber
   participant QuorumCnxManager.Listener as lis
   participant QuorumCnxManager.Listener.ListenerHandler as lish
   participant QuorumCnxManager as qcm
   participant QuorumCnxManager.SendWorker as sendW
   participant QuorumCnxManager.RecvWorker as recvW
   ==选举网络初始化==
   lis -> lis : run
   note left: 启动线程
   activate lis
   lis -> lish : run
   note left: 启动线程
   activate lish
   lish -> lish : acceptConnections 
   note right: 创建服务端socket监听选举服务端口，接受连接
   lish -> qcm : receiveConnection
   activate qcm
   qcm -> qcm : handleConnection
   note right: 创建对应的SendWorker和RecvWorker并绑定对应的scoket
   qcm -> sendW : run
   note right: 循环获取queueSendMap中的数据发送到对应的服务
   activate sendW
   qcm -> recvW : run
   note right: 读取socket对应的数据包装为QuorumCnxManager.Message，添加到recvQueue
   activate recvW
   @enduml


5. ## 选举逻辑流程


   @startuml
   !theme toy
   autonumber
   participant FastLeaderElection as fle
   participant QuorumCnxManager as qcm
   participant FastLeaderElection.Messenger as messenger
   participant FastLeaderElection.Messenger.WorkerReceiver as wRcve
   participant FastLeaderElection.Messenger.WorkerSender as wSend
   ==选举逻辑初始化==
   fle -> fle : start
   note left: 启动线程
   activate fle
   fle -> messenger : run
   activate messenger
   messenger -> wSend : run
   note left: 循环获取sendqueue队列数据发送
   activate wSend
   messenger -> wRcve : run
   note left: 循环获取QuorumCnxManager::recvQueue队列数据
   activate wRcve
   @enduml


   1. ### 选举数据发送流程

      @startuml
      !theme toy
      autonumber
      participant FastLeaderElection.Messenger.WorkerSender as wSend
      participant QuorumCnxManager as qcm
      ==选举数据发送==
      wSend -> wSend : run
      note left: 循环获取sendqueue队列数据发送
      activate wSend
      wSend -> wSend : process
      wSend -> qcm : toSend
      activate qcm
      qcm -> qcm : connectOne
      qcm -> qcm : connectOne
      qcm -> qcm : initiateConnectionAsync
      qcm -> qcm : initiateConnection
      qcm -> qcm : startConnection
      @enduml

      

   2. ### 选举数据接受流程


      @startuml
      !theme toy
      skinparam ActivityBackgroundColor FF6F61
      skinparam ActivityBorderThickness 2
      skinparam Shadowing true
      start
      :FastLeaderElection.WorkerReceiver::run;
      :QuorumCnxManager::pollRecvQueue 拉取其他服务器的投票数据;
      :解析投票数据;
      if(投票数据来无投票权的服务器) is(是) then
      :发送自身数据到对方;
      else
      :将获取的选票放入recvqueue队列;
      :发送自身数据到对方;
      endif
      end
      @enduml


      

   3. ### 选举流程


      @startuml
      !theme toy
      skinparam ActivityBackgroundColor FF6F61
      skinparam ActivityBorderThickness 2
      skinparam Shadowing true
      start
      :QuorumPeer::run;
      :FastLeaderElection::lookForLeader 查找leader节点获取选票;
      :FastLeaderElection::sendNotifications 发送自身选票到其他节点,投自己一票;
      :FastLeaderElection::recvqueue 拉取其他节点的投票信息;
      switch (投票方节点的状态)
      case ( **LOOKING** )
        if (投票节点任期大于当前任期) then (是)
        :更新当前任期为投票节点任期;
        elseif (投票方节点的数据大于当前) then (是)
        :更新当前节点数据为投票节点数据;
        endif
        :将选票放入recvset，如果已收集完成所有选票则，
         则按照epoch>zxid>id的顺序找最大，最大的则为leader;
      case ( **OBSERVING** ) 
        :不处理;
      case ( **FOLLOWING** )
        :FastLeaderElection::receivedFollowingNotification 
         检查是否已找到leader，找到则设置leader，否则记录投票信息;
      case ( **LEADING** )
        :FastLeaderElection::receivedLeadingNotification 
         检查是否已找到leader，找到则设置leader，否则记录投票信息;
      endswitch
      end
      @enduml

      

6. ## leader服务器初始化流程

   @startuml
   !theme toy
   skinparam ActivityBackgroundColor FF6F61
   skinparam ActivityBorderThickness 2
   skinparam Shadowing true
   |#HoneyDew|sw1|主流程
   |#PapayaWhip|sw2|数据同步流程
   |sw1|
   start
   :QuorumPeer::run 找到leader;
   :QuorumPeer::makeLeader,初始化leader;
   :Leader::lead,初始化leader;
   split
   :Leader::getEpochToPropose 获取新的任期;
   :Leader::startZkServer 启动LeaderZooKeeperServer并创建必要参数;
   :判断如果未设置zookeeper.leaderServes为no 
   设置cnxnFactory.setZooKeeperServer(zks)，
   设置改参数后node方可接受客户端链接;
   :死循环，每隔tickTime个时间周期之后，
   向所有链接到leader的node发送ping消息,ping消息包含leader的最大zxid;
   
   split again
   |sw2|
   :LearnerCnxAcceptor.run;
   :LearnerCnxAcceptorHandler.run 启动leader服务;
   :LearnerCnxAcceptorHandler.acceptConnections 启动leader服务接收链接;
   :LearnerHandler.run 当有客户端链接时，创建socket绑定到LearnerHandler;
   :readRecord读取node发送到leader的数据包
   第一个数据包的类型必须是Leader.FOLLOWERINFO或者Leader.OBSERVERINFO;
   :解析数据包并发送Leader.LEADERINFO类型的数据包到node,
   node必须回复一个Leader.ACKEPOCH类型的数据包;
   :syncFollower;
   
   
   end split
   end
   @enduml

   

7. ## following初始化流程

   @startuml
   !theme toy
   skinparam ActivityBackgroundColor FF6F61
   skinparam ActivityBorderThickness 2
   skinparam Shadowing true
   start
   :QuorumPeer::run 设置node角色为Follower;
   :QuorumPeer::makeFollower,初始化Follower;
   :Follower::followLeader,初始化Follower;
   :Learner::findLeader 查找选中的leader;
   :Learner::connectToLeader 连接leader;
   :Learner::registerWithLeader;
   :向leader发送一个Leader.FOLLOWERINFO类型的数据包
   :读取leader回复的Leader.LEADERINFO类型的消息;
   :向leader回复一个Leader.ACKEPOCH类型的消息;
   :Learner::syncWithLeader;
   :死循环读取来自leader的消息;
   note right
     在创建socket时设置setSoTimeout(tickTime * initLimit),
     由于leader会定时发送ping消息,间隔为tickTime * initLimit,
     当leader宕机之后，follower读取超时时，会抛出异常中断循环
     关闭socket，重新更新当前node节点的状态为LOOKING，重新进入选举流程
   end note
   end
   @enduml

   

8. ## observeing初始化流程

@startuml
!theme toy
skinparam ActivityBackgroundColor FF6F61
skinparam Shadowing true
skinparam ActivityBorderThickness 2
start
:QuorumPeer::run 设置node角色为Observer;
:QuorumPeer::makeObserver,初始化Observer;
:Follower::observeLeader,初始化Observer;
:Observer::findLearnerMaster 查找选中的leader;
:Learner::connectToLeader 连接leader;
:Learner::registerWithLeader;
:向leader发送一个Leader.OBSERVERINFO类型的数据包
:读取leader回复的Leader.LEADERINFO类型的消息;
:向leader回复一个Leader.ACKEPOCH类型的消息;
:Learner::syncWithLeader;
:死循环读取来自leader的消息;
note right
  在创建socket时设置setSoTimeout(tickTime * initLimit),
  由于leader会定时发送ping消息,间隔为tickTime * initLimit,
  当leader宕机之后，follower读取超时时，会抛出异常中断循环
  关闭socket，重新更新当前node节点的状态为LOOKING，重新进入选举流程
end note
end
@enduml

