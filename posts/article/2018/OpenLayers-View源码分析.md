---
title: OpenLayers-View源码分析  
date:  2018-03-14 21:14:33
category: openlayers
description: OpenLayers-View源码分析
---
# OpenLayers-View源码分析
```javascript
ol.View = function(opt_options) {
  ol.Object.call(this);
  //合并后面对象的属性到第一个对象，相同属性合并
  var options = ol.obj.assign({}, opt_options);

  this.hints_ = [0, 0];
  this.animations_ = [];
  this.updateAnimationKey_;

  this.updateAnimations_ = this.updateAnimations_.bind(this);
  //创建坐标系统，默认是web墨卡托坐标系
  this.projection_ = ol.proj.createProjection(options.projection, 'EPSG:3857');

  this.applyOptions_(options);
};
ol.inherits(ol.View, ol.Object);


ol.View.prototype.applyOptions_ = function(options) {

  var properties = {};
  properties[ol.ViewProperty.CENTER] = options.center !== undefined ?
    options.center : null;
 //分辨率解析计算对象
  var resolutionConstraintInfo = ol.View.createResolutionConstraint_(
      options);

//显示的最大分辨率
  this.maxResolution_ = resolutionConstraintInfo.maxResolution;
//显示的最小分辨率
  this.minResolution_ = resolutionConstraintInfo.minResolution;
//放大的比率
  this.zoomFactor_ = resolutionConstraintInfo.zoomFactor;
//视图分辨率配置数组
  this.resolutions_ = options.resolutions;
//最小的视图缩放级别
  this.minZoom_ = resolutionConstraintInfo.minZoom;
//计算视图中心点对象
  var centerConstraint = ol.View.createCenterConstraint_(options);
  var resolutionConstraint = resolutionConstraintInfo.constraint;
  var rotationConstraint = ol.View.createRotationConstraint_(options);

 //视图约束条件配置
  this.constraints_ = {
    center: centerConstraint,
    resolution: resolutionConstraint,
    rotation: rotationConstraint
  };
  //设置当前视图显示的分辨率
  if (options.resolution !== undefined) {
    properties[ol.ViewProperty.RESOLUTION] = options.resolution;
  } else if (options.zoom !== undefined) {
    properties[ol.ViewProperty.RESOLUTION] = this.constrainResolution(
        this.maxResolution_, options.zoom - this.minZoom_);

    if (this.resolutions_) { // in case map zoom is out of min/max zoom range
      properties[ol.ViewProperty.RESOLUTION] = ol.math.clamp(
          Number(this.getResolution() || properties[ol.ViewProperty.RESOLUTION]),
          this.minResolution_, this.maxResolution_);
    }
  }
  //设置视图旋转角度
  properties[ol.ViewProperty.ROTATION] =
      options.rotation !== undefined ? options.rotation : 0;
  this.setProperties(properties);

  //视图参数
  this.options_ = options;

};

ol.View.prototype.getUpdatedOptions_ = function(newOptions) {
  var options = ol.obj.assign({}, this.options_);

  // preserve resolution (or zoom)
  if (options.resolution !== undefined) {
    options.resolution = this.getResolution();
  } else {
    options.zoom = this.getZoom();
  }

  // preserve center
  options.center = this.getCenter();

  // preserve rotation
  options.rotation = this.getRotation();

  return ol.obj.assign({}, options, newOptions);
};



ol.View.prototype.animate = function(var_args) {
  var animationCount = arguments.length;
  var callback;
  if (animationCount > 1 && typeof arguments[animationCount - 1] === 'function') {
    callback = arguments[animationCount - 1];
    --animationCount;
  }
  if (!this.isDef()) {
    // if view properties are not yet set, shortcut to the final state
    var state = arguments[animationCount - 1];
    if (state.center) {
      this.setCenter(state.center);
    }
    if (state.zoom !== undefined) {
      this.setZoom(state.zoom);
    }
    if (state.rotation !== undefined) {
      this.setRotation(state.rotation);
    }
    if (callback) {
      callback(true);
    }
    return;
  }
  var start = Date.now();
  var center = this.getCenter().slice();
  var resolution = this.getResolution();
  var rotation = this.getRotation();
  var series = [];
  for (var i = 0; i < animationCount; ++i) {
    var options = (arguments[i]);

    var animation =  ({
      start: start,
      complete: false,
      anchor: options.anchor,
      duration: options.duration !== undefined ? options.duration : 1000,
      easing: options.easing || ol.easing.inAndOut
    });

    if (options.center) {
      animation.sourceCenter = center;
      animation.targetCenter = options.center;
      center = animation.targetCenter;
    }

    if (options.zoom !== undefined) {
      animation.sourceResolution = resolution;
      animation.targetResolution = this.constrainResolution(
          this.maxResolution_, options.zoom - this.minZoom_, 0);
      resolution = animation.targetResolution;
    } else if (options.resolution) {
      animation.sourceResolution = resolution;
      animation.targetResolution = options.resolution;
      resolution = animation.targetResolution;
    }

    if (options.rotation !== undefined) {
      animation.sourceRotation = rotation;
      var delta = ol.math.modulo(options.rotation - rotation + Math.PI, 2 * Math.PI) - Math.PI;
      animation.targetRotation = rotation + delta;
      rotation = animation.targetRotation;
    }

    animation.callback = callback;

    // check if animation is a no-op
    if (ol.View.isNoopAnimation(animation)) {
      animation.complete = true;
      // we still push it onto the series for callback handling
    } else {
      start += animation.duration;
    }
    series.push(animation);
  }
  this.animations_.push(series);
  this.setHint(ol.ViewHint.ANIMATING, 1);
  this.updateAnimations_();
};



ol.View.prototype.getAnimating = function() {
  return this.hints_[ol.ViewHint.ANIMATING] > 0;
};



ol.View.prototype.getInteracting = function() {
  return this.hints_[ol.ViewHint.INTERACTING] > 0;
};



ol.View.prototype.cancelAnimations = function() {
  this.setHint(ol.ViewHint.ANIMATING, -this.hints_[ol.ViewHint.ANIMATING]);
  for (var i = 0, ii = this.animations_.length; i < ii; ++i) {
    var series = this.animations_[i];
    if (series[0].callback) {
      series[0].callback(false);
    }
  }
  this.animations_.length = 0;
};


ol.View.prototype.updateAnimations_ = function() {
  if (this.updateAnimationKey_ !== undefined) {
    cancelAnimationFrame(this.updateAnimationKey_);
    this.updateAnimationKey_ = undefined;
  }
  if (!this.getAnimating()) {
    return;
  }
  var now = Date.now();
  var more = false;
  for (var i = this.animations_.length - 1; i >= 0; --i) {
    var series = this.animations_[i];
    var seriesComplete = true;
    for (var j = 0, jj = series.length; j < jj; ++j) {
      var animation = series[j];
      if (animation.complete) {
        continue;
      }
      var elapsed = now - animation.start;
      var fraction = animation.duration > 0 ? elapsed / animation.duration : 1;
      if (fraction >= 1) {
        animation.complete = true;
        fraction = 1;
      } else {
        seriesComplete = false;
      }
      var progress = animation.easing(fraction);
      if (animation.sourceCenter) {
        var x0 = animation.sourceCenter[0];
        var y0 = animation.sourceCenter[1];
        var x1 = animation.targetCenter[0];
        var y1 = animation.targetCenter[1];
        var x = x0 + progress * (x1 - x0);
        var y = y0 + progress * (y1 - y0);
        this.set(ol.ViewProperty.CENTER, [x, y]);
      }
      if (animation.sourceResolution && animation.targetResolution) {
        var resolution = progress === 1 ?
          animation.targetResolution :
          animation.sourceResolution + progress * (animation.targetResolution - animation.sourceResolution);
        if (animation.anchor) {
          this.set(ol.ViewProperty.CENTER,
              this.calculateCenterZoom(resolution, animation.anchor));
        }
        this.set(ol.ViewProperty.RESOLUTION, resolution);
      }
      if (animation.sourceRotation !== undefined && animation.targetRotation !== undefined) {
        var rotation = progress === 1 ?
          ol.math.modulo(animation.targetRotation + Math.PI, 2 * Math.PI) - Math.PI :
          animation.sourceRotation + progress * (animation.targetRotation - animation.sourceRotation);
        if (animation.anchor) {
          this.set(ol.ViewProperty.CENTER,
              this.calculateCenterRotate(rotation, animation.anchor));
        }
        this.set(ol.ViewProperty.ROTATION, rotation);
      }
      more = true;
      if (!animation.complete) {
        break;
      }
    }
    if (seriesComplete) {
      this.animations_[i] = null;
      this.setHint(ol.ViewHint.ANIMATING, -1);
      var callback = series[0].callback;
      if (callback) {
        callback(true);
      }
    }
  }
  // prune completed series
  this.animations_ = this.animations_.filter(Boolean);
  if (more && this.updateAnimationKey_ === undefined) {
    this.updateAnimationKey_ = requestAnimationFrame(this.updateAnimations_);
  }
};


ol.View.prototype.calculateCenterRotate = function(rotation, anchor) {
  var center;
  var currentCenter = this.getCenter();
  if (currentCenter !== undefined) {
    center = [currentCenter[0] - anchor[0], currentCenter[1] - anchor[1]];
    ol.coordinate.rotate(center, rotation - this.getRotation());
    ol.coordinate.add(center, anchor);
  }
  return center;
};



ol.View.prototype.calculateCenterZoom = function(resolution, anchor) {
  var center;
  var currentCenter = this.getCenter();
  var currentResolution = this.getResolution();
  if (currentCenter !== undefined && currentResolution !== undefined) {
    var x = anchor[0] -
        resolution * (anchor[0] - currentCenter[0]) / currentResolution;
    var y = anchor[1] -
        resolution * (anchor[1] - currentCenter[1]) / currentResolution;
    center = [x, y];
  }
  return center;
};



ol.View.prototype.getSizeFromViewport_ = function() {
  var size = [100, 100];
  var selector = '.ol-viewport[data-view="' + ol.getUid(this) + '"]';
  var element = document.querySelector(selector);
  if (element) {
    var metrics = getComputedStyle(element);
    size[0] = parseInt(metrics.width, 10);
    size[1] = parseInt(metrics.height, 10);
  }
  return size;
};



ol.View.prototype.constrainCenter = function(center) {
  return this.constraints_.center(center);
};



ol.View.prototype.constrainResolution = function(
    resolution, opt_delta, opt_direction) {
  var delta = opt_delta || 0;
  var direction = opt_direction || 0;
  return this.constraints_.resolution(resolution, delta, direction);
};



ol.View.prototype.constrainRotation = function(rotation, opt_delta) {
  var delta = opt_delta || 0;
  return this.constraints_.rotation(rotation, delta);
};



ol.View.prototype.getCenter = function() {
  return  (
    this.get(ol.ViewProperty.CENTER));
};



ol.View.prototype.getConstraints = function() {
  return this.constraints_;
};


ol.View.prototype.getHints = function(opt_hints) {
  if (opt_hints !== undefined) {
    opt_hints[0] = this.hints_[0];
    opt_hints[1] = this.hints_[1];
    return opt_hints;
  } else {
    return this.hints_.slice();
  }
};



ol.View.prototype.calculateExtent = function(opt_size) {
  var size = opt_size || this.getSizeFromViewport_();
  var center =  (this.getCenter());
  ol.asserts.assert(center, 1); // The view center is not defined
  var resolution =  (this.getResolution());
  ol.asserts.assert(resolution !== undefined, 2); // The view resolution is not defined
  var rotation =  (this.getRotation());
  ol.asserts.assert(rotation !== undefined, 3); // The view rotation is not defined

  return ol.extent.getForViewAndSize(center, resolution, rotation, size);
};



ol.View.prototype.getMaxResolution = function() {
  return this.maxResolution_;
};



ol.View.prototype.getMinResolution = function() {
  return this.minResolution_;
};



ol.View.prototype.getMaxZoom = function() {
  return  (this.getZoomForResolution(this.minResolution_));
};



ol.View.prototype.setMaxZoom = function(zoom) {
  this.applyOptions_(this.getUpdatedOptions_({maxZoom: zoom}));
};



ol.View.prototype.getMinZoom = function() {
  return  (this.getZoomForResolution(this.maxResolution_));
};



ol.View.prototype.setMinZoom = function(zoom) {
  this.applyOptions_(this.getUpdatedOptions_({minZoom: zoom}));
};



ol.View.prototype.getProjection = function() {
  return this.projection_;
};



ol.View.prototype.getResolution = function() {
  return  (
    this.get(ol.ViewProperty.RESOLUTION));
};



ol.View.prototype.getResolutions = function() {
  return this.resolutions_;
};



ol.View.prototype.getResolutionForExtent = function(extent, opt_size) {
  var size = opt_size || this.getSizeFromViewport_();
  var xResolution = ol.extent.getWidth(extent) / size[0];
  var yResolution = ol.extent.getHeight(extent) / size[1];
  return Math.max(xResolution, yResolution);
};



ol.View.prototype.getResolutionForValueFunction = function(opt_power) {
  var power = opt_power || 2;
  var maxResolution = this.maxResolution_;
  var minResolution = this.minResolution_;
  var max = Math.log(maxResolution / minResolution) / Math.log(power);
  return (
    
    function(value) {
      var resolution = maxResolution / Math.pow(power, value * max);
      return resolution;
    });
};



ol.View.prototype.getRotation = function() {
  return  (this.get(ol.ViewProperty.ROTATION));
};



ol.View.prototype.getValueForResolutionFunction = function(opt_power) {
  var power = opt_power || 2;
  var maxResolution = this.maxResolution_;
  var minResolution = this.minResolution_;
  var max = Math.log(maxResolution / minResolution) / Math.log(power);
  return (
    
    function(resolution) {
      var value =
            (Math.log(maxResolution / resolution) / Math.log(power)) / max;
      return value;
    });
};



ol.View.prototype.getState = function() {
  var center =  (this.getCenter());
  var projection = this.getProjection();
  var resolution =  (this.getResolution());
  var rotation = this.getRotation();
  return  ({
    center: center.slice(),
    projection: projection !== undefined ? projection : null,
    resolution: resolution,
    rotation: rotation,
    zoom: this.getZoom()
  });
};



ol.View.prototype.getZoom = function() {
  var zoom;
  var resolution = this.getResolution();
  if (resolution !== undefined) {
    zoom = this.getZoomForResolution(resolution);
  }
  return zoom;
};



ol.View.prototype.getZoomForResolution = function(resolution) {
  var offset = this.minZoom_ || 0;
  var max, zoomFactor;
  if (this.resolutions_) {
    var nearest = ol.array.linearFindNearest(this.resolutions_, resolution, 1);
    offset = nearest;
    max = this.resolutions_[nearest];
    if (nearest == this.resolutions_.length - 1) {
      zoomFactor = 2;
    } else {
      zoomFactor = max / this.resolutions_[nearest + 1];
    }
  } else {
    max = this.maxResolution_;
    zoomFactor = this.zoomFactor_;
  }
  return offset + Math.log(max / resolution) / Math.log(zoomFactor);
};



ol.View.prototype.getResolutionForZoom = function(zoom) {
  return (this.constrainResolution(
      this.maxResolution_, zoom - this.minZoom_, 0));
};



ol.View.prototype.fit = function(geometryOrExtent, opt_options) {
  var options = opt_options || {};
  var size = options.size;
  if (!size) {
    size = this.getSizeFromViewport_();
  }
  
  var geometry;
  if (!(geometryOrExtent instanceof ol.geom.SimpleGeometry)) {
    ol.asserts.assert(Array.isArray(geometryOrExtent),
        24); // Invalid extent or geometry provided as `geometry`
    ol.asserts.assert(!ol.extent.isEmpty(geometryOrExtent),
        25); // Cannot fit empty extent provided as `geometry`
    geometry = ol.geom.Polygon.fromExtent(geometryOrExtent);
  } else if (geometryOrExtent.getType() === ol.geom.GeometryType.CIRCLE) {
    geometryOrExtent = geometryOrExtent.getExtent();
    geometry = ol.geom.Polygon.fromExtent(geometryOrExtent);
    geometry.rotate(this.getRotation(), ol.extent.getCenter(geometryOrExtent));
  } else {
    geometry = geometryOrExtent;
  }

  var padding = options.padding !== undefined ? options.padding : [0, 0, 0, 0];
  var constrainResolution = options.constrainResolution !== undefined ?
    options.constrainResolution : true;
  var nearest = options.nearest !== undefined ? options.nearest : false;
  var minResolution;
  if (options.minResolution !== undefined) {
    minResolution = options.minResolution;
  } else if (options.maxZoom !== undefined) {
    minResolution = this.constrainResolution(
        this.maxResolution_, options.maxZoom - this.minZoom_, 0);
  } else {
    minResolution = 0;
  }
  var coords = geometry.getFlatCoordinates();

  // calculate rotated extent
  var rotation = this.getRotation();
  var cosAngle = Math.cos(-rotation);
  var sinAngle = Math.sin(-rotation);
  var minRotX = +Infinity;
  var minRotY = +Infinity;
  var maxRotX = -Infinity;
  var maxRotY = -Infinity;
  var stride = geometry.getStride();
  for (var i = 0, ii = coords.length; i < ii; i += stride) {
    var rotX = coords[i] * cosAngle - coords[i + 1] * sinAngle;
    var rotY = coords[i] * sinAngle + coords[i + 1] * cosAngle;
    minRotX = Math.min(minRotX, rotX);
    minRotY = Math.min(minRotY, rotY);
    maxRotX = Math.max(maxRotX, rotX);
    maxRotY = Math.max(maxRotY, rotY);
  }

  // calculate resolution
  var resolution = this.getResolutionForExtent(
      [minRotX, minRotY, maxRotX, maxRotY],
      [size[0] - padding[1] - padding[3], size[1] - padding[0] - padding[2]]);
  resolution = isNaN(resolution) ? minResolution :
    Math.max(resolution, minResolution);
  if (constrainResolution) {
    var constrainedResolution = this.constrainResolution(resolution, 0, 0);
    if (!nearest && constrainedResolution < resolution) {
      constrainedResolution = this.constrainResolution(
          constrainedResolution, -1, 0);
    }
    resolution = constrainedResolution;
  }

  // calculate center
  sinAngle = -sinAngle; // go back to original rotation
  var centerRotX = (minRotX + maxRotX) / 2;
  var centerRotY = (minRotY + maxRotY) / 2;
  centerRotX += (padding[1] - padding[3]) / 2 * resolution;
  centerRotY += (padding[0] - padding[2]) / 2 * resolution;
  var centerX = centerRotX * cosAngle - centerRotY * sinAngle;
  var centerY = centerRotY * cosAngle + centerRotX * sinAngle;
  var center = [centerX, centerY];
  var callback = options.callback ? options.callback : ol.nullFunction;

  if (options.duration !== undefined) {
    this.animate({
      resolution: resolution,
      center: center,
      duration: options.duration,
      easing: options.easing
    }, callback);
  } else {
    this.setResolution(resolution);
    this.setCenter(center);
    setTimeout(callback.bind(undefined, true), 0);
  }
};



ol.View.prototype.centerOn = function(coordinate, size, position) {
  // calculate rotated position
  var rotation = this.getRotation();
  var cosAngle = Math.cos(-rotation);
  var sinAngle = Math.sin(-rotation);
  var rotX = coordinate[0] * cosAngle - coordinate[1] * sinAngle;
  var rotY = coordinate[1] * cosAngle + coordinate[0] * sinAngle;
  var resolution = this.getResolution();
  rotX += (size[0] / 2 - position[0]) * resolution;
  rotY += (position[1] - size[1] / 2) * resolution;

  // go back to original angle
  sinAngle = -sinAngle; // go back to original rotation
  var centerX = rotX * cosAngle - rotY * sinAngle;
  var centerY = rotY * cosAngle + rotX * sinAngle;

  this.setCenter([centerX, centerY]);
};



ol.View.prototype.isDef = function() {
  return !!this.getCenter() && this.getResolution() !== undefined;
};



ol.View.prototype.rotate = function(rotation, opt_anchor) {
  if (opt_anchor !== undefined) {
    var center = this.calculateCenterRotate(rotation, opt_anchor);
    this.setCenter(center);
  }
  this.setRotation(rotation);
};



ol.View.prototype.setCenter = function(center) {
  this.set(ol.ViewProperty.CENTER, center);
  if (this.getAnimating()) {
    this.cancelAnimations();
  }
};



ol.View.prototype.setHint = function(hint, delta) {
  this.hints_[hint] += delta;
  this.changed();
  return this.hints_[hint];
};


ol.View.prototype.setResolution = function(resolution) {
  this.set(ol.ViewProperty.RESOLUTION, resolution);
  if (this.getAnimating()) {
    this.cancelAnimations();
  }
};



ol.View.prototype.setRotation = function(rotation) {
  this.set(ol.ViewProperty.ROTATION, rotation);
  if (this.getAnimating()) {
    this.cancelAnimations();
  }
};



ol.View.prototype.setZoom = function(zoom) {
  this.setResolution(this.getResolutionForZoom(zoom));
};



ol.View.createCenterConstraint_ = function(options) {
  if (options.extent !== undefined) {
    return ol.CenterConstraint.createExtent(options.extent);
  } else {
    return ol.CenterConstraint.none;
  }
};



ol.View.createResolutionConstraint_ = function(options) {
  var resolutionConstraint;
  var maxResolution;
  var minResolution;

  // TODO: move these to be ol constants
  // see https://github.com/openlayers/openlayers/issues/2076
  var defaultMaxZoom = 28;
  var defaultZoomFactor = 2;

  var minZoom = options.minZoom !== undefined ?
    options.minZoom : ol.DEFAULT_MIN_ZOOM;

  var maxZoom = options.maxZoom !== undefined ?
    options.maxZoom : defaultMaxZoom;

  var zoomFactor = options.zoomFactor !== undefined ?
    options.zoomFactor : defaultZoomFactor;

  if (options.resolutions !== undefined) {
    var resolutions = options.resolutions;
    maxResolution = resolutions[minZoom];
    minResolution = resolutions[maxZoom] !== undefined ?
      resolutions[maxZoom] : resolutions[resolutions.length - 1];
    resolutionConstraint = ol.ResolutionConstraint.createSnapToResolutions(
        resolutions);
  } else {
    // calculate the default min and max resolution
    var projection = ol.proj.createProjection(options.projection, 'EPSG:3857');
    var extent = projection.getExtent();
    var size = !extent ?
      // use an extent that can fit the whole world if need be
      360 * ol.proj.METERS_PER_UNIT[ol.proj.Units.DEGREES] /
            projection.getMetersPerUnit() :
      Math.max(ol.extent.getWidth(extent), ol.extent.getHeight(extent));

    var defaultMaxResolution = size / ol.DEFAULT_TILE_SIZE / Math.pow(
        defaultZoomFactor, ol.DEFAULT_MIN_ZOOM);

    var defaultMinResolution = defaultMaxResolution / Math.pow(
        defaultZoomFactor, defaultMaxZoom - ol.DEFAULT_MIN_ZOOM);

    // user provided maxResolution takes precedence
    maxResolution = options.maxResolution;
    if (maxResolution !== undefined) {
      minZoom = 0;
    } else {
      maxResolution = defaultMaxResolution / Math.pow(zoomFactor, minZoom);
    }

    // user provided minResolution takes precedence
    minResolution = options.minResolution;
    if (minResolution === undefined) {
      if (options.maxZoom !== undefined) {
        if (options.maxResolution !== undefined) {
          minResolution = maxResolution / Math.pow(zoomFactor, maxZoom);
        } else {
          minResolution = defaultMaxResolution / Math.pow(zoomFactor, maxZoom);
        }
      } else {
        minResolution = defaultMinResolution;
      }
    }

    // given discrete zoom levels, minResolution may be different than provided
    maxZoom = minZoom + Math.floor(
        Math.log(maxResolution / minResolution) / Math.log(zoomFactor));
    minResolution = maxResolution / Math.pow(zoomFactor, maxZoom - minZoom);

    resolutionConstraint = ol.ResolutionConstraint.createSnapToPower(
        zoomFactor, maxResolution, maxZoom - minZoom);
  }
  return {constraint: resolutionConstraint, maxResolution: maxResolution,
    minResolution: minResolution, minZoom: minZoom, zoomFactor: zoomFactor};
};



ol.View.createRotationConstraint_ = function(options) {
  var enableRotation = options.enableRotation !== undefined ?
    options.enableRotation : true;
  if (enableRotation) {
    var constrainRotation = options.constrainRotation;
    if (constrainRotation === undefined || constrainRotation === true) {
      return ol.RotationConstraint.createSnapToZero();
    } else if (constrainRotation === false) {
      return ol.RotationConstraint.none;
    } else if (typeof constrainRotation === 'number') {
      return ol.RotationConstraint.createSnapToN(constrainRotation);
    } else {
      return ol.RotationConstraint.none;
    }
  } else {
    return ol.RotationConstraint.disable;
  }
};



ol.View.isNoopAnimation = function(animation) {
  if (animation.sourceCenter && animation.targetCenter) {
    if (!ol.coordinate.equals(animation.sourceCenter, animation.targetCenter)) {
      return false;
    }
  }
  if (animation.sourceResolution !== animation.targetResolution) {
    return false;
  }
  if (animation.sourceRotation !== animation.targetRotation) {
    return false;
  }
  return true;
};
```