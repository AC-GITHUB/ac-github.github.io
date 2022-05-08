---
title: cmake教程
date:  2022-05-06 22:18:41
category: c++
description: cmake教程
---

CMake 是一个管理源代码构建的工具。最初，CMake 被设计为各种语言生成`Makefile`的工具，今天 CMake 用于生成现代构建系统例如`Ninja`以及用于 Visual Studio 和 Xcode 等 IDE 的项目文件。

CMake 广泛用于 C 和 C++ 语言，但它也可以用于构建其他语言的源代码。cmake[官网](https://www.cmake.org)

## 初识cmake

优点：
1. 开源代码，使用类BSD许可发布。
2. 跨平台，并可以生成native编译配置文件，在linux/Unix平台，生成makefile,在苹果平台可以生成Xcode,在windows平台，可以生成MSVC的工程文件。
3. 能够管理大型项目。
4. 简化编译构建过程和编译过程。cmake的工具链：cmake+make。
5. 高效率，因为cmake在工具链中没有libtool。
6. 可扩展，可以为cmake编写特定功能的模块，扩展cmake功能。

缺点：
1. cmake只是看起来比较简单，使用并不简单；
2. 每个项目使用一个CMakeLists.txt（每个目录一个），使用的是cmake语法。
3. cmake跟已有体系配合不是特别的理想，比如pkgconfig。

## 一个简单的例子

1. 使用cmake需要编写编排文件，cmake的编排文件一般是CMakeLists.txt，最简单的编排文件如下：

   ~~~make
   # 设置必须的cmake最小版本
   cmake_minimum_required(VERSION 3.10)
   
   # 设置项目的名称
   project(hallo)
   
   # 生成可执行文件，也可生成库文件使用add_library指令，第一个参数为生成的目标文件的名称，
   # 第二个参数为源文件的路径可以是多个
   add_executable(hallo hallo.cpp)
   ~~~

2. 接下来构建生成

   ```shell
   #首先创建文件夹用于存放目标文件以及cmake产出的中间文件
   mkdir build
   cd build
   #使用cmake构建程序
   cmake ../
   ```

3. 到此就会生成hallo程序