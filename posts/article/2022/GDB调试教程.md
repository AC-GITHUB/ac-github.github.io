---
title: gdb调试教程
date:  2022-05-04 19:56:38
category: c++
description: GDB调试教程
---
本文主要介绍gdb相关的知识，[gdb官网](https://sourceware.org/gdb/)

## GDB功能

GDB目的是让你看到程序在执行时“内部”发生了什么——或者另一个程序在它崩溃的那一刻正在做什么。

一般来说，GDB主要帮助你完成下面四个方面的功能：

1. 启动你的程序，可以按照你的自定义的要求随心所欲的运行程序。
2. 可让被调试的程序在你所指定的调置的断点处停住。
3. 当程序被停住时，可以检查此时你的程序中所发生的事。
4. 你可以改变你的程序，将一个BUG产生的影响修正从而测试其他BUG。

## 一个简单的例子

使用gdb调试的程序需要在编译时加入-g 参数，例如：gcc -g -o hallo ./hallo.c

1. 启动gdb 

   gdb ./hallo 启动成功时输出如下信息:

   ![image-20220504203419742](/static/articleImage/2022/image-20220504203419742.png)

2. 在main函数处设置断点

   ~~~
   break main
   ~~~

3. 启动调试程序

   ~~~
   run
   ~~~

4. 单步执行

   ~~~
   step
   ~~~

5. 执行到下一个断点

   ~~~
   continue
   ~~~

## GDB的停止与执行

1. 断点

   断点是gdb程序执行时需要停止的地方。断点是用`break`命令（缩写 `b`）设置的。断点语法：

   | 语法                           | 说明                                                         |
   | ------------------------------ | ------------------------------------------------------------ |
   | break location                 | 在给定位置设置断点，可以指定函数名、行号或指令地址。<br />断点将在程序执行指定位置中的任何代码之前停止程序。 |
   | break … if cond                | 使用条件cond设置断点；每次到达断点时计算表达式 cond ，如果cond计算结果为真。则停止 |
   | break filename:linenum         | 在filename文件的linenum行处设置断点                          |
   | info breakpoints/info break    | 查看所有断点                                                 |
   | clear location/delete location | 清理location位置处设置的断点                                 |
   | save breakpoints [filename]    | 由于设置断点信息仅用于本次会话，因此可以保存断点信息到文件，以便于下次使用时不用重新设置 |
   | start                          | 执行程序并在入口处设置                                       |
   
1. 在断点处继续执行。继续执行的语法

   | 语法                   | 说明                                                         |
   | ---------------------- | ------------------------------------------------------------ |
   | continue（缩写c）      | 自断点处继续执行，直到执行到下一个断点                       |
   | step（缩写s）          | 执行下一行代码，遇到函数时会进入函数内部单行执行             |
   | next（缩写n）          | 执行下一行代码，遇到函数时会执行函数并返回，不会进入函数内部单步执行 |
   | jump（缩写j） location | 跳到location处执行                                           |
   
1. 查看变量值以及源码。显示信息语法

   | 语法                     | 说明                               |
   | ------------------------ | ---------------------------------- |
   | info registers           | 查看寄存器的值                     |
   | Info os type             | 查看os信息                         |
   | list linenum             | 打印行号前后的源码行               |
   | list function            | 打印function函数的源码             |
   | list first,last          | 打印first到last之间的源码          |
   | print（缩写p）           | 查看变量的值，例如：print x        |
   | print file::variable     | 输出file文件的variable变量的值     |
   | print function::variable | 输出function函数的variable变量的值 |
   | print expr               | 输出一个表达式的值                 |
   | x/nfu addr               | 查看addr内存的值                   |
   
1. tui方式查看

   GDB文本用户界面 (TUI) 是一个终端界面，它使用库 在单独的文本窗口`curses`中显示源文件、汇编输出、程序寄存器和GDB命令。

   tui可以展示这几个窗口：命令，源码，汇编，寄存器
   
   启动tui的命令tui enable，可以使用tui layout splint展示源码窗户以及汇编窗户
   
   在tui窗口可以看到当前执行的行（以深色背景标识）以及设置的断点
   
1. 其他辅助命令

   | 命令 <div style="width:150px" /> | 说明                                                         |
   | ----------------- | ------------------------------------------------------- |
   | help（h）     | 列出所有的命令                                               |
   | quit（缩写q） | 退出调试                                                     |
   | info（缩写i） | 该命令（缩写`i`）用于描述程序的状态。例如，您可以使用 显示传递给函数的参数`info args`，使用 列出当前使用的寄存器`info registers`，或者使用 列出您设置的断点`info breakpoints` |
   | show | 与 相比`info`，`show`用于描述 GDB本身的状态。 |
   |               |                                                              |
   
   
   
6. 配置

   gdb的全局配置文件在/etc/gdbinit，需要设置全局配置时可修改该文件







