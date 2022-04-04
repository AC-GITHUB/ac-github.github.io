---
title:  "设置输出JDK动态代理生成的代理类"
date:   2018-02-27 13:50:39
category: java
tag:
  - java
description: 设置输出JDK动态代理生成的代理类
---

```java
Field field = System.class.getDeclaredField("props");
field.setAccessible(true);
Properties props = (Properties) field.get(null);
props.put("sun.misc.ProxyGenerator.saveGeneratedFiles", "true");
```