---
title: springMVC处理请求过程源码解析
tag: 
   - spring
category: 'spring'
description: '本文从源代码角度解析springMVC处理http请求的过程,以及返回的流程'
date: 2018-11-26 22:24:21
---
在发送http请求时所有的方法都会首先请求HttpServlet的service方法，在DispatcherServlet这个方法的实现是父类FrameworkServlet的service方法，所以http请求的入口在这里，
下面分析流程
```java
protected void service(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
       //获得请求的http方法，请求方法有(GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS, TRACE)这些方法
		HttpMethod httpMethod = HttpMethod.resolve(request.getMethod());
		if (httpMethod == HttpMethod.PATCH || httpMethod == null) {
			processRequest(request, response);
		}
		else {
		   //这方法会调用HttpServlet的service方法,这个方法会根据不同的http请求方法转到FrameworkServlet对应的方法，这些方法最后都会调用FrameworkServlet的processRequest
			super.service(request, response);
		}
	}
	//接下来分析FrameworkServlet的processRequest方法
	protected final void processRequest(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		long startTime = System.currentTimeMillis();
		Throwable failureCause = null;

		LocaleContext previousLocaleContext = LocaleContextHolder.getLocaleContext();
		LocaleContext localeContext = buildLocaleContext(request);

       //构造一个ServletRequestAttributes实例，可以不用通过controller层在service层直接获取HttpServletRequest和HttpServletResponse
		RequestAttributes previousAttributes = RequestContextHolder.getRequestAttributes();
		ServletRequestAttributes requestAttributes = buildRequestAttributes(request, response, previousAttributes);
       //构造一个WebAsyncManager并给HttpServletRequest添加一个属性，key为org.springframework.web.context.request.async.WebAsyncManager,值为WebAsyncManager
		WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);
		asyncManager.registerCallableInterceptor(FrameworkServlet.class.getName(), new RequestBindingInterceptor());

		initContextHolders(request, localeContext, requestAttributes);

		try {
		//这个方法的实现是DispatcherServlet的doService
			doService(request, response);
		}
		catch (ServletException | IOException ex) {
			failureCause = ex;
			throw ex;
		}
		catch (Throwable ex) {
			failureCause = ex;
			throw new NestedServletException("Request processing failed", ex);
		}

		finally {
			resetContextHolders(request, previousLocaleContext, previousAttributes);
			if (requestAttributes != null) {
				requestAttributes.requestCompleted();
			}

			if (logger.isDebugEnabled()) {
				if (failureCause != null) {
					this.logger.debug("Could not complete request", failureCause);
				}
				else {
					if (asyncManager.isConcurrentHandlingStarted()) {
						logger.debug("Leaving response open for concurrent processing");
					}
					else {
						this.logger.debug("Successfully completed request");
					}
				}
			}

			publishRequestHandledEvent(request, response, startTime, failureCause);
		}
	}
	//接下来查看DispatcherServlet的doService
	protected void doService(HttpServletRequest request, HttpServletResponse response) throws Exception {

		// Keep a snapshot of the request attributes in case of an include,
		// to be able to restore the original attributes after the include.
		Map<String, Object> attributesSnapshot = null;
		//判断HttpServletRequest是否有javax.servlet.include.request_uri这个属性，新的请求为null，返回false
		if (WebUtils.isIncludeRequest(request)) {
			attributesSnapshot = new HashMap<>();
			Enumeration<?> attrNames = request.getAttributeNames();
			while (attrNames.hasMoreElements()) {
				String attrName = (String) attrNames.nextElement();
				if (this.cleanupAfterInclude || attrName.startsWith(DEFAULT_STRATEGIES_PREFIX)) {
					attributesSnapshot.put(attrName, request.getAttribute(attrName));
				}
			}
		}
         //为HttpServletRequest设置一些后期会用到的属性
		// Make framework objects available to handlers and view objects.
		request.setAttribute(WEB_APPLICATION_CONTEXT_ATTRIBUTE, getWebApplicationContext());
		request.setAttribute(LOCALE_RESOLVER_ATTRIBUTE, this.localeResolver);
		request.setAttribute(THEME_RESOLVER_ATTRIBUTE, this.themeResolver);
		request.setAttribute(THEME_SOURCE_ATTRIBUTE, getThemeSource());
       //未设置则为null
		if (this.flashMapManager != null) {
			FlashMap inputFlashMap = this.flashMapManager.retrieveAndUpdate(request, response);
			if (inputFlashMap != null) {
				request.setAttribute(INPUT_FLASH_MAP_ATTRIBUTE, Collections.unmodifiableMap(inputFlashMap));
			}
			request.setAttribute(OUTPUT_FLASH_MAP_ATTRIBUTE, new FlashMap());
			request.setAttribute(FLASH_MAP_MANAGER_ATTRIBUTE, this.flashMapManager);
		}

		try {
			doDispatch(request, response);
		}
		finally {
			if (!WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {
				// Restore the original attribute snapshot, in case of an include.
				if (attributesSnapshot != null) {
					restoreAttributesAfterInclude(request, attributesSnapshot);
				}
			}
		}
	}
	//接下来查看DispatcherServlet的doDispatch，该类是请求的核心方法，这个方法负责请求路径与controller的方法的映射，以及方法的执行，结果返回
	protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
		HttpServletRequest processedRequest = request;
		HandlerExecutionChain mappedHandler = null;
		boolean multipartRequestParsed = false;

		WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);

		try {
			ModelAndView mv = null;
			Exception dispatchException = null;

			try {
			//检查是否为上传文件的请求
				processedRequest = checkMultipart(request);
				multipartRequestParsed = (processedRequest != request);

				// Determine handler for the current request.
				//根据HttpServletRequest请求查找匹配controller的方法,返回一个HandlerExecutionChain,该类包含匹配的MVC拦截器以及匹配的controller方法
				mappedHandler = getHandler(processedRequest);
				if (mappedHandler == null) {
				   //没有匹配的方法返回404错误
					noHandlerFound(processedRequest, response);
					return;
				}

				// Determine handler adapter for the current request.
				//获取一个可以执行该匹配的HandlerAdapter
				HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

				// Process last-modified header, if supported by the handler.
				String method = request.getMethod();
				boolean isGet = "GET".equals(method);
				if (isGet || "HEAD".equals(method)) {
					long lastModified = ha.getLastModified(request, mappedHandler.getHandler());
					if (logger.isDebugEnabled()) {
						logger.debug("Last-Modified value for [" + getRequestUri(request) + "] is: " + lastModified);
					}
					if (new ServletWebRequest(request, response).checkNotModified(lastModified) && isGet) {
						return;
					}
				}
               //执行拦截器的前置方法，如果返回false直接返回
				if (!mappedHandler.applyPreHandle(processedRequest, response)) {
					return;
				}

				// Actually invoke the handler.
			  //执行controll的匹配方法
				mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

				if (asyncManager.isConcurrentHandlingStarted()) {
					return;
				}
                 //处理返回的ViewName
				applyDefaultViewName(processedRequest, mv);
				//执行拦截器的后置方法
				mappedHandler.applyPostHandle(processedRequest, response, mv);
			}
			catch (Exception ex) {
				dispatchException = ex;
			}
			catch (Throwable err) {
				// As of 4.3, we're processing Errors thrown from handler methods as well,
				// making them available for @ExceptionHandler methods and other scenarios.
				dispatchException = new NestedServletException("Handler dispatch failed", err);
			}
			processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
		}
		catch (Exception ex) {
			triggerAfterCompletion(processedRequest, response, mappedHandler, ex);
		}
		catch (Throwable err) {
			triggerAfterCompletion(processedRequest, response, mappedHandler,
					new NestedServletException("Handler processing failed", err));
		}
		finally {
			if (asyncManager.isConcurrentHandlingStarted()) {
				// Instead of postHandle and afterCompletion
				if (mappedHandler != null) {
					mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);
				}
			}
			else {
				// Clean up any resources used by a multipart request.
				if (multipartRequestParsed) {
					cleanupMultipart(processedRequest);
				}
			}
		}
	}
	//接下来先查看根据HttpServletRequest请求查找匹配controller的方法的过程
	protected HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
		if (this.handlerMappings != null) {
			for (HandlerMapping hm : this.handlerMappings) {
				//在springMVC注解项目中为RequestMappingHandlerMapping，这个在springMVC中配置的getHandler方法会转到AbstractHandlerMapping的getHandler方法
				HandlerExecutionChain handler = hm.getHandler(request);
				if (handler != null) {
					return handler;
				}
			}
		}
		return null;
	}
	//接下来先查看AbstractHandlerMapping的getHandler方法
	public final HandlerExecutionChain getHandler(HttpServletRequest request) throws Exception {
	 //这个getHandlerInternal方法的实现是AbstractHandlerMethodMapping的getHandlerInternal方法，返回是HandlerMethod
		Object handler = getHandlerInternal(request);
		if (handler == null) {
			handler = getDefaultHandler();
		}
		if (handler == null) {
			return null;
		}
		// Bean name or resolved handler?
		if (handler instanceof String) {
			String handlerName = (String) handler;
			handler = obtainApplicationContext().getBean(handlerName);
		}
       //包装为一个HandlerExecutionChain,包含匹配的MVC拦截器以及匹配的controller方法
		HandlerExecutionChain executionChain = getHandlerExecutionChain(handler, request);
		if (CorsUtils.isCorsRequest(request)) {
			CorsConfiguration globalConfig = this.globalCorsConfigSource.getCorsConfiguration(request);
			CorsConfiguration handlerConfig = getCorsConfiguration(handler, request);
			CorsConfiguration config = (globalConfig != null ? globalConfig.combine(handlerConfig) : handlerConfig);
			executionChain = getCorsHandlerExecutionChain(request, executionChain, config);
		}
		return executionChain;
	}
	//接下来查看AbstractHandlerMethodMapping的getHandlerInternal方法
	protected HandlerMethod getHandlerInternal(HttpServletRequest request) throws Exception {
	   //获取一个路径，即去掉了ServletContext路径名称和查询参数的路径名
		String lookupPath = getUrlPathHelper().getLookupPathForRequest(request);
		if (logger.isDebugEnabled()) {
			logger.debug("Looking up handler method for path " + lookupPath);
		}
		this.mappingRegistry.acquireReadLock();
		try {
		   //根据路径和HttpServletRequest生成HandlerMethod
			HandlerMethod handlerMethod = lookupHandlerMethod(lookupPath, request);
			return (handlerMethod != null ? handlerMethod.createWithResolvedBean() : null);
		}
		finally {
			this.mappingRegistry.releaseReadLock();
		}
	}
   //接下来查看lookupHandlerMethod方法
   protected HandlerMethod lookupHandlerMethod(String lookupPath, HttpServletRequest request) throws Exception {
		List<Match> matches = new ArrayList<>();
		//根据请求路径获取RequestMappingInfo
		List<T> directPathMatches = this.mappingRegistry.getMappingsByUrl(lookupPath);
		if (directPathMatches != null) {
		   //根据获取到的RequestMappingInfo以及HandlerMethod构造Match,加入集合中
			addMatchingMappings(directPathMatches, matches, request);
		}
		if (matches.isEmpty()) {
			// No choice but to go through all mappings...
			addMatchingMappings(this.mappingRegistry.getMappings().keySet(), matches, request);
		}

		if (!matches.isEmpty()) {
		   //对所有匹配的Match做一个排序，大多数情况都会是一个匹配，这一步略过
			Comparator<Match> comparator = new MatchComparator(getMappingComparator(request));
			matches.sort(comparator);
			Match bestMatch = matches.get(0);
			if (matches.size() > 1) {
				if (CorsUtils.isPreFlightRequest(request)) {
					return PREFLIGHT_AMBIGUOUS_MATCH;
				}
				Match secondBestMatch = matches.get(1);
				if (comparator.compare(bestMatch, secondBestMatch) == 0) {
					Method m1 = bestMatch.handlerMethod.getMethod();
					Method m2 = secondBestMatch.handlerMethod.getMethod();
					throw new IllegalStateException("Ambiguous handler methods mapped for HTTP path '" +
							request.getRequestURL() + "': {" + m1 + ", " + m2 + "}");
				}
			}
			//这个方法的是实现是RequestMappingInfoHandlerMapping的handleMatch方法，该方法会处理路径参数
			handleMatch(bestMatch.mapping, lookupPath, request);
			//返回匹配到的HandlerMethod，最后被封装为HandlerExecutionChain返回到DispatcherServlet的doDispatch方法里，交给HandlerAdapter执行
			return bestMatch.handlerMethod;
		}
		else {
			return handleNoMatch(this.mappingRegistry.getMappings().keySet(), lookupPath, request);
		}
	}
	//接下来查看RequestMappingHandlerAdapter的handle方法，这个方法是由RequestMappingHandlerAdapter的父类AbstractHandlerMethodAdapter调用的
	public final ModelAndView handle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
        //最后会转到RequestMappingHandlerAdapter的handleInternal方法
		return handleInternal(request, response, (HandlerMethod) handler);
	}
	protected ModelAndView handleInternal(HttpServletRequest request,
			HttpServletResponse response, HandlerMethod handlerMethod) throws Exception {

		ModelAndView mav;
		checkRequest(request);

		// Execute invokeHandlerMethod in synchronized block if required.
		if (this.synchronizeOnSession) {
			HttpSession session = request.getSession(false);
			if (session != null) {
				Object mutex = WebUtils.getSessionMutex(session);
				synchronized (mutex) {
					mav = invokeHandlerMethod(request, response, handlerMethod);
				}
			}
			else {
				// No HttpSession available -> no mutex necessary
				mav = invokeHandlerMethod(request, response, handlerMethod);
			}
		}
		else {
			// No synchronization on session demanded at all...
			mav = invokeHandlerMethod(request, response, handlerMethod);
		}

		if (!response.containsHeader(HEADER_CACHE_CONTROL)) {
			if (getSessionAttributesHandler(handlerMethod).hasSessionAttributes()) {
				applyCacheSeconds(response, this.cacheSecondsForSessionAttributeHandlers);
			}
			else {
				prepareResponse(response);
			}
		}

		return mav;
	}
	
```
