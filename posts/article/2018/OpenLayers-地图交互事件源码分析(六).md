---
title: OpenLayers-地图交互事件源码分析(六)  
date:  2018-03-17 16:23:18
category: openlayers
tag: openlayers
description: OpenLayers-地图交互事件源码分析(六)
---
# pointer
 - ol.interaction.Pointer.centroid = function(pointerEvents)
 - ol.interaction.Pointer.prototype.isPointerDraggingEvent_ = function(mapBrowserEvent)
 - ol.interaction.Pointer.prototype.updateTrackedPointers_ = function(mapBrowserEvent)
 - ol.interaction.Pointer.handleEvent = function(mapBrowserEvent)
 - ol.interaction.Pointer.prototype.shouldStopEvent = function(handled)
# dragbox
 - ol.interaction.DragBox.defaultBoxEndCondition = function(mapBrowserEvent, startPixel, endPixel)，判断是否符合框选放大的条件
 - ol.interaction.DragBox.handleDragEvent_ = function(mapBrowserEvent),响应拖拽事件
 - ol.interaction.DragBox.prototype.getGeometry = function(),获取选择框的矢量图形
 - ol.interaction.DragBox.handleUpEvent_ = function(mapBrowserEvent)
 - ol.interaction.DragBox.handleDownEvent_ = function(mapBrowserEvent)