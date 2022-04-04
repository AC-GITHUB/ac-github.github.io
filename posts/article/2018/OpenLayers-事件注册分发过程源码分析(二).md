---
title: OpenLayers-事件注册分发过程源码分析(二)
date:  2018-03-15 21:50:55
category: openlayers
description: OpenLayers-事件注册分发过程源码分析(二)
---
# event

 - ol.events.Event.stopPropagation = function(evt),停止事件传播
 - ol.events.Event.preventDefault = function(evt),停止事件传播
# eventtarget
 - ol.events.EventTarget.prototype.addEventListener = function(type, listener),注册type类型的事件
 - ol.events.EventTarget.prototype.dispatchEvent = function(event),分发事件
```javascript
 ol.events.EventTarget.prototype.dispatchEvent = function(event) {
 //构造事件对象
 var evt = typeof event === 'string' ? new ol.events.Event(event) : event;
 //获取事件类型
  var type = evt.type;
  //给事件执行目标赋值
  evt.target = this;
  //获取type类型所有已注册的事件
  var listeners = this.listeners_[type];
  var propagate;
  if (listeners) {
 //判断是否已有type类型的事件在执行
    if (!(type in this.dispatching_)) {
      this.dispatching_[type] = 0;
      this.pendingRemovals_[type] = 0;
    }
	//type类型事件执行数量加一
    ++this.dispatching_[type];
    for (var i = 0, ii = listeners.length; i < ii; ++i) {
	//执行type类型的事件
      if (listeners[i].call(this, evt) === false || evt.propagationStopped) {
        propagate = false;
        break;
      }
    }
	//type类型事件执行数量减一
    --this.dispatching_[type];
	//如果type类型事件执行数量为零,删除所有type类型的事件
    if (this.dispatching_[type] === 0) {
      var pendingRemovals = this.pendingRemovals_[type];
      delete this.pendingRemovals_[type];
      while (pendingRemovals--) {
        this.removeEventListener(type, ol.nullFunction);
      }
      delete this.dispatching_[type];
    }
    return propagate;
  }
};
````
 - ol.events.EventTarget.prototype.disposeInternal = function()，卸载所有事件
 - ol.events.EventTarget.prototype.getListeners = function(type),获取所有该类型的事件注册
 - ol.events.EventTarget.prototype.hasListener = function(opt_type),判断是否有该类型的事件
 - ol.events.EventTarget.prototype.removeEventListener = function(type, listener)，移除注册的事件
# condition
 - ol.events.condition.altKeyOnly = function(mapBrowserEvent),判断是否为alt键盘事件
 - ol.events.condition.altShiftKeysOnly = function(mapBrowserEvent),判断是否为atl和shift事件
 - ol.events.condition.click = function(mapBrowserEvent),判断是否为点击事件
 - ol.events.condition.mouseActionButton = function(mapBrowserEvent),判断是否为鼠标点击事件
 - ol.events.condition.pointerMove = function(mapBrowserEvent) ,判断是否为鼠标移动事件
 - ol.events.condition.singleClick = function(mapBrowserEvent),判断呢是否为单击事件
 - ol.events.condition.doubleClick = function(mapBrowserEvent),判断是否为双击事件
 - ol.events.condition.noModifierKeys = function(mapBrowserEvent),判断是否为键盘控制键事件
 - ol.events.condition.platformModifierKeyOnly = function(mapBrowserEvent),判断是否为键盘控制键事件
 - ol.events.condition.shiftKeyOnly = function(mapBrowserEvent),判断是否为shift键盘事件
 - ol.events.condition.targetNotEditable = function(mapBrowserEvent),判断目标对象是否为输入对象
 - ol.events.condition.mouseOnly = function(mapBrowserEvent)，判断是否为鼠标事件
 - ol.events.condition.primaryAction = function(mapBrowserEvent),判断是否为鼠标左键事件
# events
 - ol.events.bindListener_ = function(listenerObj),绑定事件到目标对象
 - ol.events.findListener_ = function(listeners, listener, opt_this, opt_setDeleteIndex)，根据listener在listeners中查找已注册的事件
 - ol.events.getListeners = function(target, type),获取type类型事件的注册列表
 - ol.events.getListenerMap_ = function(target),获取对象上注册的所有事件
 - ol.events.removeListeners_ = function(target, type),清除type类型的事件
 - ol.events.listen = function(target, type, listener, opt_this, opt_once),绑定type类型的listener到target
 - ol.events.listenOnce = function(target, type, listener, opt_this) 绑定type类型的listener到target,只执行一次
 - ol.events.unlisten = function(target, type, listener, opt_this),移除type类型的listener在target
 - ol.events.unlistenByKey = function(key),移除事件
 - ol.events.unlistenAll = function(target),移除所有的事件