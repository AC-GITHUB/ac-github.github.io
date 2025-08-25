---
title: zookeeper原理
date:  2023-03-10 22:11:28
category: zookeeper
tag: zookeeper
description: zookeeper原理
---

1. ## 简介

   ZooKeeper 是一个开源的分布式协调服务，由雅虎创建，是 Google Chubby 的开源实现。分布式应用程序可以基于 ZooKeeper 实现诸如数据发布/订阅、命名服务、分布式协调/通知、集群管理、配置维护、分布式锁等功能。

2. ## 特点

   **最终一致性**：client不论连接到哪个Server，展示给它都是同一个视图，这是zookeeper最重要的特性；

   **可靠性**：具有简单、健壮、良好的性能，如果消息被某一台服务器接受，那么它将被所有的服务器接受；

   **实时性**：Zookeeper保证客户端将在一个时间间隔范围内获得服务器的更新信息，或者服务器失效的信息。但由于网络延时等原因，Zookeeper不能保证两个客户端能同时得到刚更新的数据，如果需要最新数据，应该在读数据之前调用sync()接口；

   **等待无关(wait-free)**：慢的或者失效的client，不得干预快速的client的请求，使得每个client都能有效的等待；

   **原子性**：更新只能成功或者失败，没有中间状态；

   **顺序性**：按照客户端发送请求的顺序更新数据。

3. ## 概念

   **集群**：由多个zookeeper server组成,server分为三种角色：**Leader**、**Follower**、**Observer**，server服务有三种状态：**LOOKING** 、**LEADING**、**FOLLOWING**、**OBSERVING**

4. ## 数据模型

   ```mermaid
   flowchart TD
       / --> app1
       / --> app2
       / --> app3
       app2 --> config1
       app2 --> config2
   
   ```

   zookeeper的数据存储是树状结构的，类似于Linux的文件系统，每个路径称为node

   **zxid**：类似于 RDBMS 中的事务 ID，用于标识一次更新操作的 Proposal ID。为了保证顺序性，该 zkid 必须单调递增。因此 Zookeeper 使用一个 64 位的数来表示，高 32 位是 Leader 的 epoch，从 1 开始，每次选出新的 Leader，epoch 加一。低 32 位为该 epoch 内的序号，每次 epoch 变化，都将低 32 位的序号重置。这样保证了 zkid 的全局递增性。

   node属性:

   - type:

     - PERSISTENT：客户端与zookeeper断开连接后，该节点依旧存在

     - PERSISTENT_SEQUENTIAL：客户端与zookeeper断开连接后，该节点依旧存在，只是Zookeeper给该节点名称进行顺序编号

     - EPHEMERAL：客户端与zookeeper断开连接后，该节点被删除

     - EPHEMERAL_SEQUENTIAL：客户端与zookeeper断开连接后，该节点被删除，只是Zookeeper给该节点名称进行顺序编号


   - czxid：创建节点的事务 zxid

   - mzxid：znode 最后更新的事务 zxid

   - ctime：znode 被创建的毫秒数

   - mtime：znode 最后修改的毫秒数

   - version：znode 版本号

   - cversion：znode 子节点版本号

   - aversion：znode acl版本号

   - ephemeralOwner：如果是临时节点，这个是 znode 拥有者的 session id。如果不是临时节点则是 0

   - pzxid：znode 最后更新的子节点 zxid

5. ## 工作原理

   Zookeeper的核心是原子广播，这个机制保证了各个Server之间的同步。实现这个机制的协议叫做Zab协议。**Zab协议有两种模式**，它们分别是恢复模式（选主）和广播模式（同步）。

   **恢复模式**：当服务启动或者在领导者崩溃后，Zab就进入了恢复模式，恢复模式不接受客户端请求，当领导者被选举出来，且大多数Server完成了和leader的状态同步以后，恢复模式就结束了。状态同步保证了leader和Server具有相同的系统状态。

   **广播模式**：一旦Leader已经和多数的Follower进行了状态同步后，他就可以开始广播消息了，即进入广播状态。这时候当一个Server加入ZooKeeper服务中，它会在恢复模式下启动，发现Leader，并和Leader进行状态同步。待到同步结束，它也参与消息广播。ZooKeeper的广播状态一直到Leader崩溃了或者Leader失去了大部分的Followers支持。

6. ## 节点数据写流程

   1. 在Client向Follwer 或 Observer 发出一个写的请求；
   2. Follwer 或 Observer 把请求发送给Leader；
   3. Leader接收到以后向所有follower发起提案；
   4. Follwer收到提案后执行写操作，然后把操作结果发送给Leader；
   5. 当多数follower返回提案结果后，leader会commit该提议，通知其他Follower 和 Observer 同步信息；
   6. Follwer 或Observer把请求结果返回给Client。

7. ## 节点数据读流程

   1. 在Client向Follwer 或 Observer 发出一个读的请求；
   2. Follwer 或 Observer 把请求结果返回给Client；

   