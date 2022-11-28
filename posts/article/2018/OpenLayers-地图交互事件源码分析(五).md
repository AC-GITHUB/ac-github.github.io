---
title: OpenLayers-地图交互事件源码分析(五)  
date:  2018-03-17 14:17:18
category: openlayers
tag: openlayers
description: OpenLayers-地图交互事件源码分析(五)
---
<embed src="/static/articleImage/openlayers%E5%9C%B0%E5%9B%BE%E4%BA%A4%E4%BA%92%E4%BA%8B%E4%BB%B6%E7%BB%93%E6%9E%84.svg" type="image/svg+xml" style="width: 100%;height: 100%;"/>
# interaction

 - ol.interaction.Interaction.prototype.getActive = function()，查看工具是否可用
 - ol.interaction.Interaction.prototype.getMap = function(),获取当前地图对象
 - ol.interaction.Interaction.prototype.setActive = function(active),设置工具是否可用
 - ol.interaction.Interaction.prototype.setMap = function(map),设置工具地图对象
 - ol.interaction.Interaction.pan = function(view, delta, opt_duration),地图平移
 ```javascript
 ol.interaction.Interaction.pan = function(view, delta, opt_duration) {
 //获取视图中心点,delta平移的量
  var currentCenter = view.getCenter();
  if (currentCenter) {
  //构造新的视图中心点
    var center = view.constrainCenter(
        [currentCenter[0] + delta[0], currentCenter[1] + delta[1]]);
//移动到视图中心点
    if (opt_duration) {
      view.animate({
        duration: opt_duration,
        easing: ol.easing.linear,
        center: center
      });
    } else {
      view.setCenter(center);
    }
  }
};
````

 - ol.interaction.Interaction.rotate = function(view, rotation, opt_anchor, opt_duration),地图旋转，rotation旋转的角度
 - ol.interaction.Interaction.rotateWithoutConstraints = function(view, rotation, opt_anchor, opt_duration),地图旋转，rotation旋转的角度
 - ol.interaction.Interaction.zoom = function(view, resolution, opt_anchor, opt_duration, opt_direction),地图缩放,resolution需要缩放到分辨率
 - ol.interaction.Interaction.zoomByDelta = function(view, delta, opt_anchor, opt_duration),地图缩放,delta需要缩放量
 - ol.interaction.Interaction.zoomWithoutConstraints = function(view, resolution, opt_anchor, opt_duration),地图缩放,resolution需要缩放到分辨率
# doubleclickzoom
 - ol.interaction.DoubleClickZoom.handleEvent = function(mapBrowserEvent)，鼠标双击放大时响应事件
 ```javascript
 ol.interaction.DoubleClickZoom.handleEvent = function(mapBrowserEvent) {
  var stopEvent = false;
  //地图事件对象
  var browserEvent = mapBrowserEvent.originalEvent;
  //判断是否为双击事件
  if (mapBrowserEvent.type == ol.MapBrowserEventType.DBLCLICK) {
    var map = mapBrowserEvent.map;
    var anchor = mapBrowserEvent.coordinate;
	//获取放大缩小的量
    var delta = browserEvent.shiftKey ? -this.delta_ : this.delta_;
	//获取当前视图
    var view = map.getView();
	//缩放地图
    ol.interaction.Interaction.zoomByDelta(
        view, delta, anchor, this.duration_);
    mapBrowserEvent.preventDefault();
    stopEvent = true;
  }
  return !stopEvent;
};
 ```
# draganddrop
 - ol.interaction.DragAndDrop.handleDrop_ = function(event)，拖拽加载文件
```javascript
 ol.interaction.DragAndDrop.handleDrop_ = function(event) {
 //获取文件数组
  var files = event.dataTransfer.files;
  var i, ii, file;
  //遍历文件
  for (i = 0, ii = files.length; i < ii; ++i) {
    file = files.item(i);
	//读取加载文件
    var reader = new FileReader();
    reader.addEventListener(ol.events.EventType.LOAD,
        this.handleResult_.bind(this, file));
    reader.readAsText(file);
  }
};
```

 - ol.interaction.DragAndDrop.handleStop_ = function(event)，阻止事件冒泡
 - ol.interaction.DragAndDrop.prototype.handleResult_ = function(file, event)，添加文件到地图
 - ol.interaction.DragAndDrop.prototype.registerListeners_ = function(),注册拖拽事件
 - ol.interaction.DragAndDrop.prototype.setActive = function(active)，设置工具可用
 - ol.interaction.DragAndDrop.prototype.setMap = function(map)，设置工具绑定的地图
 - ol.interaction.DragAndDrop.prototype.tryReadFeatures_ = function(format, text, options)，读取要素
 - ol.interaction.DragAndDrop.prototype.unregisterListeners_ = function()，移除所有事件
# keyboardpan
 - ol.interaction.KeyboardPan.handleEvent = function(mapBrowserEvent),键盘移动事件
```javascript
 ol.interaction.KeyboardPan.handleEvent = function(mapBrowserEvent) {
  var stopEvent = false;
  //判断是否为键盘按下事件
  if (mapBrowserEvent.type == ol.events.EventType.KEYDOWN) {
    var keyEvent = mapBrowserEvent.originalEvent;
	//回去键盘代码
    var keyCode = keyEvent.keyCode;
	//判断是否为上下左右键
    if (this.condition_(mapBrowserEvent) &&
        (keyCode == ol.events.KeyCode.DOWN ||
        keyCode == ol.events.KeyCode.LEFT ||
        keyCode == ol.events.KeyCode.RIGHT ||
        keyCode == ol.events.KeyCode.UP)) {
		//获取当前地图
      var map = mapBrowserEvent.map;
	  //获取当前视图
      var view = map.getView();
	  //获取地图单位
      var mapUnitsDelta = view.getResolution() * this.pixelDelta_;
      var deltaX = 0, deltaY = 0;
      if (keyCode == ol.events.KeyCode.DOWN) {
        deltaY = -mapUnitsDelta;
      } else if (keyCode == ol.events.KeyCode.LEFT) {
        deltaX = -mapUnitsDelta;
      } else if (keyCode == ol.events.KeyCode.RIGHT) {
        deltaX = mapUnitsDelta;
      } else {
        deltaY = mapUnitsDelta;
      }
	  //构造偏移的量
      var delta = [deltaX, deltaY];
	  //旋转地图
      ol.coordinate.rotate(delta, view.getRotation());
	  //移动地图
      ol.interaction.Interaction.pan(view, delta, this.duration_);
      mapBrowserEvent.preventDefault();
      stopEvent = true;
    }
  }
  return !stopEvent;
};
```
#  keyboardzoom
 - ol.interaction.KeyboardZoom.handleEvent = function(mapBrowserEvent),键盘缩放
```javascript
ol.interaction.KeyboardZoom.handleEvent = function(mapBrowserEvent) {
  var stopEvent = false;
  //判断是否为键盘按下，释放事件
  if (mapBrowserEvent.type == ol.events.EventType.KEYDOWN ||
      mapBrowserEvent.type == ol.events.EventType.KEYPRESS) {
    var keyEvent = mapBrowserEvent.originalEvent;
	//获取键盘代码
    var charCode = keyEvent.charCode;
	//判断是否为'+'或者'-'键盘代码
    if (this.condition_(mapBrowserEvent) &&
        (charCode == '+'.charCodeAt(0) || charCode == '-'.charCodeAt(0))) {
      var map = mapBrowserEvent.map;
      var delta = (charCode == '+'.charCodeAt(0)) ? this.delta_ : -this.delta_;
	  //获取当前视图
      var view = map.getView();
	  //缩放地图
      ol.interaction.Interaction.zoomByDelta(
          view, delta, undefined, this.duration_);
      mapBrowserEvent.preventDefault();
      stopEvent = true;
    }
  }
  return !stopEvent;
};
```
#  mousewheelzoom

 - ol.interaction.MouseWheelZoom.handleEvent = function(mapBrowserEvent)
```javascript
ol.interaction.MouseWheelZoom.handleEvent = function(mapBrowserEvent) {
  var type = mapBrowserEvent.type;
  //判断是否为鼠标滚轮事件
  if (type !== ol.events.EventType.WHEEL && type !== ol.events.EventType.MOUSEWHEEL) {
    return true;
  }
//阻止事件冒泡
  mapBrowserEvent.preventDefault();
//获取当前地图
  var map = mapBrowserEvent.map;
  var wheelEvent = /** @type {WheelEvent} */ (mapBrowserEvent.originalEvent);
//获取当前鼠标坐标
  if (this.useAnchor_) {
    this.lastAnchor_ = mapBrowserEvent.coordinate;
  }

  // Delta normalisation inspired by
  // https://github.com/mapbox/mapbox-gl-js/blob/001c7b9/js/ui/handler/scroll_zoom.js
  //计算地图缩放的量
  var delta;
  if (mapBrowserEvent.type == ol.events.EventType.WHEEL) {
    delta = wheelEvent.deltaY;
    if (ol.has.FIREFOX &&
        wheelEvent.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
      delta /= ol.has.DEVICE_PIXEL_RATIO;
    }
    if (wheelEvent.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      delta *= 40;
    }
  } else if (mapBrowserEvent.type == ol.events.EventType.MOUSEWHEEL) {
    delta = -wheelEvent.wheelDeltaY;
    if (ol.has.SAFARI) {
      delta /= 3;
    }
  }

  if (delta === 0) {
    return false;
  }

  var now = Date.now();

  if (this.startTime_ === undefined) {
    this.startTime_ = now;
  }

  if (!this.mode_ || now - this.startTime_ > this.trackpadEventGap_) {
    this.mode_ = Math.abs(delta) < 4 ?
      ol.interaction.MouseWheelZoom.Mode_.TRACKPAD :
      ol.interaction.MouseWheelZoom.Mode_.WHEEL;
  }

  if (this.mode_ === ol.interaction.MouseWheelZoom.Mode_.TRACKPAD) {
    var view = map.getView();
    if (this.trackpadTimeoutId_) {
      clearTimeout(this.trackpadTimeoutId_);
    } else {
      view.setHint(ol.ViewHint.INTERACTING, 1);
    }
    this.trackpadTimeoutId_ = setTimeout(this.decrementInteractingHint_.bind(this), this.trackpadEventGap_);
    var resolution = view.getResolution() * Math.pow(2, delta / this.trackpadDeltaPerZoom_);
    var minResolution = view.getMinResolution();
    var maxResolution = view.getMaxResolution();
    var rebound = 0;
    if (resolution < minResolution) {
      resolution = Math.max(resolution, minResolution / this.trackpadZoomBuffer_);
      rebound = 1;
    } else if (resolution > maxResolution) {
      resolution = Math.min(resolution, maxResolution * this.trackpadZoomBuffer_);
      rebound = -1;
    }
    if (this.lastAnchor_) {
      var center = view.calculateCenterZoom(resolution, this.lastAnchor_);
      view.setCenter(view.constrainCenter(center));
    }
    view.setResolution(resolution);

    if (rebound === 0 && this.constrainResolution_) {
      view.animate({
        resolution: view.constrainResolution(resolution, delta > 0 ? -1 : 1),
        easing: ol.easing.easeOut,
        anchor: this.lastAnchor_,
        duration: this.duration_
      });
    }

    if (rebound > 0) {
      view.animate({
        resolution: minResolution,
        easing: ol.easing.easeOut,
        anchor: this.lastAnchor_,
        duration: 500
      });
    } else if (rebound < 0) {
      view.animate({
        resolution: maxResolution,
        easing: ol.easing.easeOut,
        anchor: this.lastAnchor_,
        duration: 500
      });
    }
    this.startTime_ = now;
    return false;
  }

  this.delta_ += delta;

  var timeLeft = Math.max(this.timeout_ - (now - this.startTime_), 0);

  clearTimeout(this.timeoutId_);
  this.timeoutId_ = setTimeout(this.handleWheelZoom_.bind(this, map), timeLeft);

  return false;
};
```
 - ol.interaction.MouseWheelZoom.prototype.decrementInteractingHint_ = function()
 - ol.interaction.MouseWheelZoom.prototype.handleWheelZoom_ = function(map) ,缩放地图
 - ol.interaction.MouseWheelZoom.prototype.setMouseAnchor = function(useAnchor) ，设置鼠标点击点
# pointer
 - ol.interaction.Pointer.centroid = function(pointerEvents),计算中心点
 - ol.interaction.Pointer.prototype.isPointerDraggingEvent_ = function(mapBrowserEvent)，判断是否为拖拽事件
 - ol.interaction.Pointer.prototype.updateTrackedPointers_ = function(mapBrowserEvent)
 - ol.interaction.Pointer.handleEvent = function(mapBrowserEvent)
 - ol.interaction.Pointer.prototype.shouldStopEvent = function(handled)
# select
 - ol.interaction.Select.prototype.addFeatureLayerAssociation_ = function(feature, layer),存储feature所在的layer
 - ol.interaction.Select.prototype.getFeatures = function()//获取选择的要素
 - ol.interaction.Select.prototype.getHitTolerance = function().//获取选择的容差
 - ol.interaction.Select.prototype.getLayer = function(feature),//获取feature所在的layer
 - ol.interaction.Select.handleEvent = function(mapBrowserEvent)
```javascript
ol.interaction.Select.handleEvent = function(mapBrowserEvent) {
  if (!this.condition_(mapBrowserEvent)) {
    return true;
  }
  var add = this.addCondition_(mapBrowserEvent);
  var remove = this.removeCondition_(mapBrowserEvent);
  var toggle = this.toggleCondition_(mapBrowserEvent);
  var set = !add && !remove && !toggle;
  var map = mapBrowserEvent.map;
  var features = this.featureOverlay_.getSource().getFeaturesCollection();
  var deselected = [];
  var selected = [];
  if (set) {
    // Replace the currently selected feature(s) with the feature(s) at the
    // pixel, or clear the selected feature(s) if there is no feature at
    // the pixel.
    ol.obj.clear(this.featureLayerAssociation_);
    map.forEachFeatureAtPixel(mapBrowserEvent.pixel,
        (
          /**
           * @param {ol.Feature|ol.render.Feature} feature Feature.
           * @param {ol.layer.Layer} layer Layer.
           * @return {boolean|undefined} Continue to iterate over the features.
           */
          function(feature, layer) {
            if (this.filter_(feature, layer)) {
              selected.push(feature);
              this.addFeatureLayerAssociation_(feature, layer);
              return !this.multi_;
            }
          }).bind(this), {
          layerFilter: this.layerFilter_,
          hitTolerance: this.hitTolerance_
        });
    var i;
    for (i = features.getLength() - 1; i >= 0; --i) {
      var feature = features.item(i);
      var index = selected.indexOf(feature);
      if (index > -1) {
        // feature is already selected
        selected.splice(index, 1);
      } else {
        features.remove(feature);
        deselected.push(feature);
      }
    }
    if (selected.length !== 0) {
      features.extend(selected);
    }
  } else {
    // Modify the currently selected feature(s).
    map.forEachFeatureAtPixel(mapBrowserEvent.pixel,
        (
          /**
           * @param {ol.Feature|ol.render.Feature} feature Feature.
           * @param {ol.layer.Layer} layer Layer.
           * @return {boolean|undefined} Continue to iterate over the features.
           */
          function(feature, layer) {
            if (this.filter_(feature, layer)) {
              if ((add || toggle) &&
                !ol.array.includes(features.getArray(), feature)) {
                selected.push(feature);
                this.addFeatureLayerAssociation_(feature, layer);
              } else if ((remove || toggle) &&
                ol.array.includes(features.getArray(), feature)) {
                deselected.push(feature);
                this.removeFeatureLayerAssociation_(feature);
              }
              return !this.multi_;
            }
          }).bind(this), {
          layerFilter: this.layerFilter_,
          hitTolerance: this.hitTolerance_
        });
    var j;
    for (j = deselected.length - 1; j >= 0; --j) {
      features.remove(deselected[j]);
    }
    features.extend(selected);
  }
  if (selected.length > 0 || deselected.length > 0) {
    this.dispatchEvent(
        new ol.interaction.Select.Event(ol.interaction.Select.EventType_.SELECT,
            selected, deselected, mapBrowserEvent));
  }
  return ol.events.condition.pointerMove(mapBrowserEvent);
};
```
 - ol.interaction.Select.prototype.setHitTolerance = function(hitTolerance)，//设置选择的容差
 - ol.interaction.Select.prototype.setMap = function(map) ，//设置当前的地图
 - ol.interaction.Select.getDefaultStyleFunction = function()//获取默认的选择样式
 - ol.interaction.Select.prototype.addFeature_ = function(evt),//添加选择的要素
 - ol.interaction.Select.prototype.removeFeature_ = function(evt)//清理选择要素
 - ol.interaction.Select.prototype.removeFeatureLayerAssociation_ = function(feature),//移除feature所在的图层

