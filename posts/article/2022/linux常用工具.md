---
title: linux常用工具
date:  2022-11-27 21:07:38
category: linux
tag: linux
description: linux常用工具

---

## linux性能分析

### [性能分析网站](https://www.brendangregg.com/linuxperf.html)

### 性能分析总览图

![img](/static/articleImage/2022/linux_perf_tools_full.png)



## 性能分析工具

1. ### top

   top 是一个性能分析工具，能够实时显示系统中各个进程的资源占用状况，与Windows的任务管理器类似

   可以查看的信息：

   1. 系统负载
   2. CPU使用率(总体/分进程)
   3. 内存使用率(总体/分进程)

2. ### vmstat

   是Linux中监控内存的常用工具，可对操作系统的虚拟内存、进程、CPU等的整体情况进行监视

   可以查看的信息：

   1. 查看slab信息
   2. 查看磁盘信息(每秒的读写的块)
   3. 查看运行的进程和等待运行进程的数量
   4. 查看CPU在内核和用户空间的运行时间
   5. 查看系统每秒中断数量和每秒cpu上下文切换时间

3. ### iostat

   iostat命令是Linux系统上查看I/O性能最基本的工具，其全称为 I/O statistics。iostat能统计磁盘活动情况，也能统计CPU使用情况

   可以查看的信息：

   1. 查看cpu信息，用户空间执行时间，内核空间执行时间，iostat -c
   2. 查看io设备的读写速度以及读写数据量，iostat -d

4. ### pidstat

   查看进程关联的信息

   可以查看的信息：

   1. 查看磁盘读写信息，pidstat -d
   2. 查看进程调度信息，pidstat -R
   3. 查看内存信息，pidstat -r
   4. 查看线程信息，pidstat -t
   5. 查看cpu信息，pidstat -u

5. ### sar

   sar 是分析系统性能的重要工具之一，通过该命令可以全面地获取系统的 CPU、运行队列、磁盘读写（I/O）、分区（交换区）、内存、CPU 中断和网络等性能数据

   可以查看的信息：

   1. 内存页写入写出信息
   2. 磁盘写入写出信息
   3. cpu执行信息，cpu中断信息

6. ### lsof

   查看进程打开的文件

   可以查看的信息：

   1. 进程打开的文件, lsof -p pid
   2. 查看文件被占用的进程，lsof file
   3. 查看占用端口的进程，lsof -i tcp:port
   4. 查看用户打开的文件，lsof -u user

7. ### strace

   查看进程或者程序的全部系统调用

   可以查看的信息：

   1. 查看进程的系统调用，strace -p pid
   2. 仅跟踪指定系统调用，strace --trace=open

8. ### pstack

   查看进程栈信息

9. ### perf

   系统分析工具

10. u

## 性能测试工具

1. ### fio - IO压测工具

   文件系统和磁盘IO基准测试工具

2. ### iperf - TCP/UDP吞吐量压测工具

   以客户端和服务器通信的方式，测试一段时间内的平均吞吐量

3. ### pktgen - 网络性能压测工具

   用于测试网络性能（PPS，吞吐量）

4. j

