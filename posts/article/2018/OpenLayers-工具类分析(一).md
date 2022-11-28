---
title: OpenLayers-工具类分析(一)  
date:  2018-03-14 21:14:33
category: openlayers
tag: openlayers
description: OpenLayers-工具类分析(一)
---
# disposable

 - ol.Disposable.prototype.dispose = function(),判断是否已释放对象，并调用ol.Disposable.prototype.disposeInternal
#  observable
 - ol.Observable.unByKey = function(key),删除该key的注册的事件
 - ol.Observable.prototype.changed = function(),分发执行改变事件
 - ol.Observable.prototype.getRevision = function() ,获取当前版本
 - ol.Observable.prototype.on = function(type, listener, opt_this),注册事件
 - ol.Observable.prototype.once = function(type, listener, opt_this),注册只执行一次的事件
 - ol.Observable.prototype.un = function(type, listener, opt_this),卸载注册的事件
# object
 - ol.Object.getChangeEventType = function(key)，根据传入的key获取事件类型
 - ol.Object.prototype.get = function(key)，根据key获取值
 - ol.Object.prototype.getKeys = function()获取所有key的集合
 - ol.Object.prototype.getProperties = function()获取所有的属性
 - ol.Object.prototype.notify = function(key, oldValue),通知所有注册的事件执行
 - ol.Object.prototype.set = function(key, value, opt_silent)设置属性
 - ol.Object.prototype.setProperties = function(values, opt_silent),合并values到当前的对象
 - ol.Object.prototype.unset = function(key, opt_silent),删除key项
![object集成体系][1]
# array类

 - ol.array.binarySearch = function(haystack, needle, opt_comparator)数组二分搜索给定的项是否存在于数组中，haystack搜索数据源,needle被查找的数据项,opt_comparator比较函数
 - ol.array.numberSafeCompareFunction = function(a, b)比较a,b两个数字类型的大小
 - ol.array.includes = function(arr, obj),查找obj是否包含于arr中
 - ol.array.linearFindNearest = function(arr, target, direction)在arr中查找与target的值最接近的数据
 - ol.array.reverseSubArray = function(arr, begin, end)反转数组中begin和end之间的数据
 - ol.array.extend = function(arr, data),将data添加到arr数组的后面
 - ol.array.remove = function(arr, obj),移除arr数组中的obj数据
 - ol.array.find = function(arr, func),通过func查找符合条件的数据
 - ol.array.equals = function(arr1, arr2)，比较arr1和arr2是否完全相等
 - ol.array.stableSort = function(arr, compareFnc),对数组排序,compareFnc数据比较函数
 - ol.array.findIndex = function(arr, func),查找arr中符合func中的条件的数据
 - ol.array.isSorted = function(arr, opt_func, opt_strict)
#  attribution
 - ol.Attribution.prototype.intersectsAnyTileRange = function(tileRanges, tileGrid, projection)
# centerconstraint
 - ol.CenterConstraint.createExtent = function(extent),输入一个矩形框,返回一个函数,该函数使用输入的坐标的x,y值与extent的四个值作对比，计算出接近中心点的坐标
 - ol.CenterConstraint.none = function(center),直接返回输入的值
#  collection
 - ol.Collection.prototype.clear = function()删除所有的数据
 - ol.Collection.prototype.extend = function(arr),将arr中的数据合并到zhge这个集合中
 - ol.Collection.prototype.forEach = function(f, opt_this),遍历集合使用f函数处理
 - ol.Collection.prototype.getArray = function(),返回集合绑定的数组
# coordinate
 - ol.coordinate.add = function(coordinate, delta),给coordinate中的x,y值加上delta中的x,y值
 - ol.coordinate.closestOnCircle = function(coordinate, circle),计算coordinate距离圆上最近点的坐标
 - ol.coordinate.closestOnSegment = function(coordinate, segment),计算坐标与线段的最近距离
 - ol.coordinate.createStringXY = function(opt_fractionDigits),返回格式化坐标的函数
 - ol.coordinate.degreesToStringHDMS = function(hemispheres, degrees, opt_fractionDigits)
 - ol.coordinate.format = function(coordinate, template, opt_fractionDigits),格式化坐标输出
 - ol.coordinate.equals = function(coordinate1, coordinate2),判断两个坐标是否相等
 - ol.coordinate.rotate = function(coordinate, angle),将坐标旋转一定的角度
 - ol.coordinate.scale = function(coordinate, scale),将坐标缩放一定的比例
 - ol.coordinate.sub = function(coordinate, delta)，将坐标减去一定的值
 - ol.coordinate.squaredDistance = function(coord1, coord2),返回两个坐标距离的平方
 - ol.coordinate.distance = function(coord1, coord2),计算两个坐标距离
 - ol.coordinate.squaredDistanceToSegment = function(coordinate, segment),返回点到线距离的平方
 - ol.coordinate.toStringHDMS = function(coordinate, opt_fractionDigits)
 - ol.coordinate.toStringXY = function(coordinate, opt_fractionDigits)转换坐标到字符串
# extent
 - ol.extent.boundingExtent = function(coordinates)计算coordinates的范围
 - ol.extent.boundingExtentXYs_ = function(xs, ys, opt_extent)计算coordinates的范围
 - ol.extent.buffer = function(extent, value, opt_extent),将extent缓冲一定的距离
 - ol.extent.clone = function(extent, opt_extent),复制extent
 - ol.extent.closestSquaredDistanceXY = function(extent, x, y)计算x,y到extent最近点距离的平方
 - ol.extent.containsCoordinate = function(extent, coordinate),计算坐标是否在extent之内
 - ol.extent.containsExtent = function(extent1, extent2),计算extent1是否包含extent2
 - ol.extent.containsXY = function(extent, x, y),计算坐标是否在extent之内
 - ol.extent.coordinateRelationship = function(extent, coordinate)判断坐标与extent的关系
 - ol.extent.createOrUpdate = function(minX, minY, maxX, maxY, opt_extent)，更新extent的值，不存在时新建
 - ol.extent.createOrUpdateFromCoordinates = function(coordinates, opt_extent)扩展extent到rings和extent并集的最大范围
 - ol.extent.createOrUpdateFromFlatCoordinates = function(flatCoordinates, offset, end, stride, opt_extent)扩展extent到flatCoordinates和extent并集的最大范围
 - ol.extent.createOrUpdateFromRings = function(rings, opt_extent)扩展extent到rings和extent并集的最大范围
 - ol.extent.equals = function(extent1, extent2),判断extent1和extent2是否相等
 - ol.extent.extend = function(extent1, extent2)，扩展extent1的范围到extent1和extent2合并的最大范围
 - ol.extent.extendCoordinate = function(extent, coordinate),扩展extent到coordinate和extent并集的最大范围
 - ol.extent.extendCoordinates = function(extent, coordinates),扩展extent到coordinates和extent并集的最大范围
 - ol.extent.extendFlatCoordinates = function(extent, flatCoordinates, offset, end, stride)扩展extent到flatCoordinates和extent并集的最大范围
 - ol.extent.extendRings = function(extent, rings)扩展extent到rings和extent并集的最大范围
 - ol.extent.extendXY = function(extent, x, y)扩展extent到坐标和extent并集的最大范围
 - ol.extent.forEachCorner = function(extent, callback, opt_this)
 - ol.extent.getArea = function(extent)返回extent的面积
 - ol.extent.getBottomLeft = function(extent),获取x,y最小的点
 - ol.extent.getBottomRight = function(extent) 获取x最大,y最小的点
 - ol.extent.getCenter = function(extent).获取中心点
 - ol.extent.getCorner = function(extent, corner)，角点坐标
 - ol.extent.getEnlargedArea = function(extent1, extent2)获取extent1和extent2并集的面积
 - ol.extent.getForViewAndSize = function(center, resolution, rotation, size, opt_extent)
 - ol.extent.getHeight = function(extent),获取高度
 - ol.extent.getIntersectionArea = function(extent1, extent2),获取extent1和extent2相交的面积
 - ol.extent.getIntersection = function(extent1, extent2, opt_extent),获取extent1和extent2相交的extent
 - ol.extent.getMargin = function(extent) ，获取长加宽
 - ol.extent.getSize = function(extent),获取宽和长
 - ol.extent.getTopLeft = function(extent)获取x最小,y最大的点
 - ol.extent.getTopRight = function(extent)获取x,y最大的点
 - ol.extent.getWidth = function(extent),获取宽度
 - ol.extent.intersects = function(extent1, extent2)判断extent1和extent2是否相交
 - ol.extent.isEmpty = function(extent) 判断是否为空
 - ol.extent.returnOrUpdate = function(extent, opt_extent)使用extent，更新opt_extent，opt_extent为空直接返回extent
 - ol.extent.scaleFromCenter = function(extent, value)缩放指定的倍数
 - ol.extent.intersectsSegment = function(extent, start, end)判断以start为起点,以end为终点的线段和extent是否相交
 - ol.extent.applyTransform = function(extent, transformFn, opt_extent)转换extent坐标
#  math
 - ol.math.clamp = function(value, min, max)计算中间值
 - ol.math.cosh，双曲余弦函数
 - ol.math.roundUpToPowerOfTwo = function(x)
# obj
 - ol.obj.assign=function(target, var_sources),合并var_sources的属性到target中，存在的覆盖，不存在的新建
 - ol.obj.clear = function(object)清空object
 - ol.obj.getValues = function(object)获取object的值作为数组
 - ol.obj.isEmpty = function(object) 判断对象是否为空
# resolutionconstraint
 - ol.ResolutionConstraint.createSnapToResolutions = function(resolutions)，返回一个函数,该函数根据传入的分辨率判断该分辨率的放大级别
 - ol.ResolutionConstraint.createSnapToPower = function(power, maxResolution, opt_maxLevel),返回一个函数
# rotationconstraint
 - ol.RotationConstraint.disable = function(rotation, delta)返回0
 - ol.RotationConstraint.none = function(rotation, delta)返回rotation+delta
 - ol.RotationConstraint.createSnapToN = function(n) 
 - ol.RotationConstraint.createSnapToZero = function(opt_tolerance)
# size
 - ol.size.buffer = function(size, buffer, opt_size),扩展size
 - ol.size.hasArea = function(size)，判断size是否有范围
 - ol.size.scale = function(size, ratio, opt_size),对size缩放一定的比例
 - ol.size.toSize = function(size, opt_size)转换为size
# transform
 - ol.transform.create = function()，创建空的转换器
 - ol.transform.reset = function(transform)，重置为初始的转换器
 - ol.transform.multiply = function(transform1, transform2) 
 - ol.transform.set = function(transform, a, b, c, d, e, f),将给定的值设置到转换器
 - ol.transform.setFromArray = function(transform1, transform2),将transform2复制到transform1
 - ol.transform.apply = function(transform, coordinate),使用给定的转换器，转换坐标
 - ol.transform.rotate = function(transform, angle),将给定的坐标转换一定的角度
 - ol.transform.scale = function(transform, x, y),将给定的坐标缩放一定的比例
 - ol.transform.translate = function(transform, dx, dy),将给定的坐标平移一定的比例
 - ol.transform.compose = function(transform, dx1, dy1, sx, sy, angle, dx2, dy2)，构造转换器
 - ol.transform.invert = function(transform),反转转换器
 - ol.transform.determinant = function(mat)，转换因子


[1]: /static/articleImage/2018/openlayers-object%E9%9B%86%E6%88%90%E4%BD%93%E7%B3%BB.png