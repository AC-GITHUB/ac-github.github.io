---
title: OpenLayers-pointer事件注册分发过程源码分析(四)  
date:  2018-03-16 09:14:02
category: openlayers
tag: openlayers
description: OpenLayers-pointer事件注册分发过程源码分析(四)
---
# pointerevent

 - ol.pointer.PointerEvent.prototype.getButtons_ = function(eventDict),获取所有鼠标按键的值
# pointereventhandler
 - ol.pointer.PointerEventHandler.prototype.registerSources = function(),注册所有的事件
 - ol.pointer.PointerEventHandler.prototype.registerSource = function(name, source)
 - ol.pointer.PointerEventHandler.prototype.register_ = function(),注册所有的事件
 - ol.pointer.PointerEventHandler.prototype.unregister_ = function(),卸载所有的事件
 - ol.pointer.PointerEventHandler.prototype.eventHandler_ = function(inEvent)
 - ol.pointer.PointerEventHandler.prototype.addEvents_ = function(events),注册给定事件
 - ol.pointer.PointerEventHandler.prototype.removeEvents_ = function(events),卸载给定的事件
 - ol.pointer.PointerEventHandler.prototype.cloneEvent = function(event, inEvent)
 - ol.pointer.PointerEventHandler.prototype.down = function(data, event)，响应鼠标按下事件
 - ol.pointer.PointerEventHandler.prototype.move = function(data, event)，鼠标移动事件
 - ol.pointer.PointerEventHandler.prototype.up = function(data, event)鼠标抬起事件
 - ol.pointer.PointerEventHandler.prototype.enter = function(data, event) 
 - ol.pointer.PointerEventHandler.prototype.leave = function(data, event)，鼠标离开事件
 - ol.pointer.PointerEventHandler.prototype.over = function(data, event)
 - ol.pointer.PointerEventHandler.prototype.out = function(data, event)
 - ol.pointer.PointerEventHandler.prototype.cancel = function(data, event) 
 - ol.pointer.PointerEventHandler.prototype.leaveOut = function(data, event)
 - ol.pointer.PointerEventHandler.prototype.enterOver = function(data, event)
 - ol.pointer.PointerEventHandler.prototype.contains_ = function(container, contained),判断contained是否包含在container中
 - ol.pointer.PointerEventHandler.prototype.makeEvent = function(inType, data, event)，构造事件对象
 - ol.pointer.PointerEventHandler.prototype.fireEvent = function(inType, data, event)，响应事件
 - ol.pointer.PointerEventHandler.prototype.fireNativeEvent = function(event)
 - ol.pointer.PointerEventHandler.prototype.wrapMouseEvent = function(eventType, event)，包装鼠标事件
 - ol.pointer.PointerEventHandler.prototype.disposeInternal = function() 卸载所有事件，释放对象
# nativesource
 - ol.pointer.NativeSource.prototype.pointerDown = function(inEvent)
 - ol.pointer.NativeSource.prototype.pointerMove = function(inEvent)
 - ol.pointer.NativeSource.prototype.pointerUp = function(inEvent)
 - ol.pointer.NativeSource.prototype.pointerOut = function(inEvent)
 - ol.pointer.NativeSource.prototype.pointerOver = function(inEvent)
 - ol.pointer.NativeSource.prototype.pointerCancel = function(inEvent) 
 - ol.pointer.NativeSource.prototype.lostPointerCapture = function(inEvent)
 - ol.pointer.NativeSource.prototype.gotPointerCapture = function(inEvent)
# mousesource
 - ol.pointer.MouseSource.prototype.isEventSimulatedFromTouch_ = function(inEvent)
 - ol.pointer.MouseSource.prepareEvent = function(inEvent, dispatcher)复制inEvent事件
 - ol.pointer.MouseSource.prototype.mousedown = function(inEvent) 响应鼠标点击事件
 - ol.pointer.MouseSource.prototype.mousemove = function(inEvent)响应鼠标移动事件
 - ol.pointer.MouseSource.prototype.mouseup = function(inEvent)
 - ol.pointer.MouseSource.prototype.mouseover = function(inEvent)
 - ol.pointer.MouseSource.prototype.mouseout = function(inEvent) 
 - ol.pointer.MouseSource.prototype.cancel = function(inEvent)
 - ol.pointer.MouseSource.prototype.cleanupMouse = function()
#  mssource
 - ol.pointer.MsSource.prototype.prepareEvent_ = function(inEvent) 
 - ol.pointer.MsSource.prototype.cleanup = function(pointerId) 
 - ol.pointer.MsSource.prototype.msPointerDown = function(inEvent)
 - ol.pointer.MsSource.prototype.msPointerMove = function(inEvent) 
 - ol.pointer.MsSource.prototype.msPointerUp = function(inEvent)
 - ol.pointer.MsSource.prototype.msPointerOut = function(inEvent)
 - ol.pointer.MsSource.prototype.msPointerOver = function(inEvent)
 - ol.pointer.MsSource.prototype.msPointerCancel = function(inEvent)
 - ol.pointer.MsSource.prototype.msLostPointerCapture = function(inEvent)
 - ol.pointer.MsSource.prototype.msGotPointerCapture = function(inEvent)

