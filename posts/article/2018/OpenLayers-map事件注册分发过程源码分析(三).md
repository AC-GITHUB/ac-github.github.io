---
title: OpenLayers-map事件注册分发过程源码分析(三)  
date:  2018-03-15 23:16:11
category: openlayers
tag: openlayers
description: OpenLayers-map事件注册分发过程源码分析(三)
---
![地图事件继承体系][1]
# mapevent

 - ol.MapEvent = function(type, map, opt_frameState),构造map事件
# mapbrowserevent
 - ol.MapBrowserEvent.prototype.preventDefault = function(),停止事件冒泡
 - ol.MapBrowserEvent.prototype.stopPropagation = function(),停止事件冒泡
# mapbrowsereventhandler
 - ol.MapBrowserEventHandler.prototype.emulateClick_ = function(pointerEvent)，判断是响应单击事件,还是响应双击事件
 - ol.MapBrowserEventHandler.prototype.updateActivePointers_ = function(pointerEvent)
 - ol.MapBrowserEventHandler.prototype.handlePointerUp_ = function(pointerEvent),响应鼠标抬起事件
 - ol.MapBrowserEventHandler.prototype.isMouseActionButton_ = function(pointerEvent)，判断是否点击了鼠标左键
 - ol.MapBrowserEventHandler.prototype.handlePointerDown_ = function(pointerEvent),响应鼠标点击事件
 - ol.MapBrowserEventHandler.prototype.handlePointerMove_ = function(pointerEvent),响应鼠标移动事件
 - ol.MapBrowserEventHandler.prototype.isMoving_ = function(pointerEvent) ,判断鼠标是否被移动
 - ol.MapBrowserEventHandler.prototype.disposeInternal = function() ,卸载所有的事件，释放对象

[1]: /static/articleImage/2018/openlayers%E5%9C%B0%E5%9B%BE%E4%BA%8B%E4%BB%B6%E7%BB%A7%E6%89%BF%E4%BD%93%E7%B3%BB.png