---
layout: post
title: springMVC初始化流程源码解析
comments: true
tags: 
   - spring
categories: 'spring'
description: '本文从源代码角度解析springMVC初始化的流程'
excerpt: ''
date: 2018-11-20 22:05:40
updated: 2018-11-20 22:05:40
---
在启动tomcat时会根据web.xml加载部署web项目springMVC的加载是在DispatcherServlet初始化时.DispatcherServlet初始化时会加springMVC.xml里面的配置作为一WebApplicationContext容器下面分析流程
 1.第一步加载DispatcherServlet并初始化会访问DispatcherServlet的父类HttpServletBean的init方法,init方法会调用FrameworkServlet的initServletBean方法
{% codeblock FrameworkServlet initServletBean方法 lang:java  %}
protected final void initServletBean() throws ServletException {
		long startTime = System.currentTimeMillis();
		try {
		//初始化webApplicationContext默认实现是XmlWebApplicationContext，并刷新
			this.webApplicationContext = initWebApplicationContext();
			//不做任何处理，留给子类实现
			initFrameworkServlet();
		}
		catch (ServletException ex) {
			this.logger.error("Context initialization failed", ex);
			throw ex;
		}
		catch (RuntimeException ex) {
			this.logger.error("Context initialization failed", ex);
			throw ex;
		}
	}
	接下来查看initWebApplicationContext的具体内容
	protected WebApplicationContext initWebApplicationContext() {
	//获取WebApplicationContext的父容器，即spring容器
		WebApplicationContext rootContext =
				WebApplicationContextUtils.getWebApplicationContext(getServletContext());
		WebApplicationContext wac = null;
//如果当前WebApplicationContext已经初始化过则设置WebApplicationContext的父容器并刷新当前WebApplicationContext容器
		if (this.webApplicationContext != null) {
			// A context instance was injected at construction time -> use it
			wac = this.webApplicationContext;
			if (wac instanceof ConfigurableWebApplicationContext) {
				ConfigurableWebApplicationContext cwac = (ConfigurableWebApplicationContext) wac;
				if (!cwac.isActive()) {
					// The context has not yet been refreshed -> provide services such as
					// setting the parent context, setting the application context id, etc
					if (cwac.getParent() == null) {
						// The context instance was injected without an explicit parent -> set
						// the root application context (if any; may be null) as the parent
						cwac.setParent(rootContext);
					}
					configureAndRefreshWebApplicationContext(cwac);
				}
			}
		}
		//判断WebApplicationContext是否初始化过
		if (wac == null) {		
			// No context instance was injected at construction time -> see if one
			// has been registered in the servlet context. If one exists, it is assumed
			// that the parent context (if any) has already been set and that the
			// user has performed any initialization such as setting the context id		
			wac = findWebApplicationContext();
		}
		if (wac == null) {
			// No context instance is defined for this servlet -> create a local one
			//创建WebApplicationContext实例并启动，重点
			wac = createWebApplicationContext(rootContext);
		}
//调用onRefresh事件,调用DispatcherServlet的onRefresh初始化默认参数
		if (!this.refreshEventReceived) {
			// Either the context is not a ConfigurableApplicationContext with refresh
			// support or the context injected at construction time had already been
			// refreshed -> trigger initial onRefresh manually here.
			onRefresh(wac);
		}
//向当前ServletContext设置WebApplicationContext的实例
		if (this.publishContext) {
			// Publish the context as a servlet context attribute.
			String attrName = getServletContextAttributeName();
			getServletContext().setAttribute(attrName, wac);
		}

		return wac;
	}
	接下来查看createWebApplicationContext的具体内容
	protected WebApplicationContext createWebApplicationContext(@Nullable ApplicationContext parent) {
	//获取WebApplicationContext的实现类。默认是XmlWebApplicationContext
		Class<?> contextClass = getContextClass();
		if (!ConfigurableWebApplicationContext.class.isAssignableFrom(contextClass)) {
			throw new ApplicationContextException(
					"Fatal initialization error in servlet with name '" + getServletName() +
					"': custom WebApplicationContext class [" + contextClass.getName() +
					"] is not of type ConfigurableWebApplicationContext");
		}
		调用XmlWebApplicationContext的构造函数生成XmlWebApplicationContext
		ConfigurableWebApplicationContext wac =
				(ConfigurableWebApplicationContext) BeanUtils.instantiateClass(contextClass);
//设置Environment，默认是StandardServletEnvironment
		wac.setEnvironment(getEnvironment());
		//设置父容器
		wac.setParent(parent);
		//获取并设置springMVC.xml的文件路径，该文件在DispatcherServlet的初始化参数中配置
		String configLocation = getContextConfigLocation();
		if (configLocation != null) {
			wac.setConfigLocation(configLocation);
		}
		//配置并启动WebApplicationContext容器
		configureAndRefreshWebApplicationContext(wac);

		return wac;
	}
	接下来查看configureAndRefreshWebApplicationContext的具体内容
	protected void configureAndRefreshWebApplicationContext(ConfigurableWebApplicationContext wac) {
		//设置WebApplicationContext的id
		if (ObjectUtils.identityToString(wac).equals(wac.getId())) {
			// The application context id is still set to its original default value
			// -> assign a more useful id based on available information
			if (this.contextId != null) {
				wac.setId(this.contextId);
			}
			else {
				// Generate default id...
				wac.setId(ConfigurableWebApplicationContext.APPLICATION_CONTEXT_ID_PREFIX +
						ObjectUtils.getDisplayString(getServletContext().getContextPath()) + '/' + getServletName());
			}
		}
		wac.setServletContext(getServletContext());
		wac.setServletConfig(getServletConfig());
		wac.setNamespace(getNamespace());
		//向容器添加监听
		wac.addApplicationListener(new SourceFilteringListener(wac, new ContextRefreshListener()));

		// The wac environment's #initPropertySources will be called in any case when the context
		// is refreshed; do it eagerly here to ensure servlet property sources are in place for
		// use in any post-processing or initialization that occurs below prior to #refresh
		ConfigurableEnvironment env = wac.getEnvironment();
		if (env instanceof ConfigurableWebEnvironment) {
			((ConfigurableWebEnvironment) env).initPropertySources(getServletContext(), getServletConfig());
		}
     //不做任何处理
		postProcessWebApplicationContext(wac);
		applyInitializers(wac);
		//启动WebApplicationContext容器
		wac.refresh();
	}
{% endcodeblock %}
