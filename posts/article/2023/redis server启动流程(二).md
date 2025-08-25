---
title: redis server启动流程(二)
date:  2023-03-25 19:35:48
category: redis
tag: redis
description: redis server启动流程(二)

---

1. ## redis启动流程

   @startuml
   !theme toy
   autonumber
   participant server as server
   participant ae as ae
   ==启动流程==
   server -> server : main
   note left: 启动函数
   activate server
   server -> setproctitle : spt_init
   activate setproctitle
   server -> server : initServerConfig
   server -> config : initConfigValues
   activate config
   server -> acl : ACLInit
   activate acl
   server -> module : moduleInitModulesSystem
   activate module
   server -> connection : connTypeInitialize
   activate connection
   group #FEFECE initServer
   server -> server : initServer
   server -> server : setupSignalHandlers
   server -> ae : aeCreateEventLoop
   activate ae
   server -> ae : aeCreateTimeEvent
   server -> ae : aeCreateFileEvent
   server -> ae : aeSetBeforeSleepProc
   server -> ae : aeSetAfterSleepProc
   server -> eval : scriptingInit
   activate eval
   server -> functions : functionsInit
   activate functions
   server -> slowlog : slowlogInit
   activate slowlog
   server -> latency : latencyMonitorInit
   activate latency
   server -> acl : ACLUpdateDefaultUserPassword
   server -> debug : applyWatchdogPeriod
   activate debug
   server -> server : initServerClientMemUsageBuckets
   end
   server -> acl : ACLLoadUsersAtStartup
   group #FEFECE initListeners
   server -> server : initListeners
   server -> connection : connectionByType
   server -> connection : connListen
   server -> server : createSocketAcceptHandler
   end
   server -> server : InitServerLast
   server -> aof : aofLoadManifestFromDisk
   activate aof
   server -> server : loadDataFromDisk
   server -> aof : aofOpenIfNeededOnServerStart
   server -> aof : aofDelHistoryFiles
   server -> ae : aeMain
   @enduml

   

2. hh

