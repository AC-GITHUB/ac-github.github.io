---
title: springMVC初始化流程源码解析
tag: 
  - spring
category: spring
description: 本文从源代码角度解析springMVC初始化的流程
date: 2018-11-20 22:05:40
---

在启动tomcat时会根据web.xml加载部署web项目,并初始化所有加载的HttpServlet即调用HttpServlet的init方法,在springMVC项目中惟一的HttpServlet是DispatcherServlet,所以springMVC项目启动时会调用DispatcherServlet的init方法,这个方法的实现在DispatcherServlet 父类HttpServletBean中,HttpServletBean的init方法会转到FrameworkServlet的 initServletBean方法,所以这是springMVC项目的初始化入口
下面分析流程
 1.第一步加载DispatcherServlet并初始化会访问DispatcherServlet的父类HttpServletBean的init方法,init方法会调用FrameworkServlet的initServletBean方法
~~~java
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
	//接下来查看initWebApplicationContext的具体内容
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
	//接下来查看createWebApplicationContext的具体内容
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
	//接下来查看configureAndRefreshWebApplicationContext的具体内容
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
	//接下来查看beanFactory解析springMVC.xml时都做了什么,解析springMVC.xml配置时关
	//于springMVC的标签都会转到MvcNamespaceHandler的init方法，然后调用的相关标签关联类的parse方法常用的配置为annotation-driven，这个配置会解析用注解配置的controller
	public void init() {
		registerBeanDefinitionParser("annotation-driven", new AnnotationDrivenBeanDefinitionParser());
		registerBeanDefinitionParser("default-servlet-handler", new DefaultServletHandlerBeanDefinitionParser());
		registerBeanDefinitionParser("interceptors", new InterceptorsBeanDefinitionParser());
		registerBeanDefinitionParser("resources", new ResourcesBeanDefinitionParser());
		registerBeanDefinitionParser("view-controller", new ViewControllerBeanDefinitionParser());
		registerBeanDefinitionParser("redirect-view-controller", new ViewControllerBeanDefinitionParser());
		registerBeanDefinitionParser("status-controller", new ViewControllerBeanDefinitionParser());
		registerBeanDefinitionParser("view-resolvers", new ViewResolversBeanDefinitionParser());
		registerBeanDefinitionParser("tiles-configurer", new TilesConfigurerBeanDefinitionParser());
		registerBeanDefinitionParser("freemarker-configurer", new FreeMarkerConfigurerBeanDefinitionParser());
		registerBeanDefinitionParser("groovy-configurer", new GroovyMarkupConfigurerBeanDefinitionParser());
		registerBeanDefinitionParser("script-template-configurer", new ScriptTemplateConfigurerBeanDefinitionParser());
		registerBeanDefinitionParser("cors", new CorsBeanDefinitionParser());
	}
	//接下来查看 AnnotationDrivenBeanDefinitionParser的parse方法,element为annotation-driven配置节点	
	public BeanDefinition parse(Element element, ParserContext parserContext) {
		Object source = parserContext.extractSource(element);
		XmlReaderContext readerContext = parserContext.getReaderContext();

		CompositeComponentDefinition compDefinition = new CompositeComponentDefinition(element.getTagName(), source);
		parserContext.pushContainingComponent(compDefinition);
        //获取annotation-driven节点配置的content-negotiation-manager属性,如果未配置，向beanFactory注入一个ContentNegotiationManagerFactoryBean类型的bean
		RuntimeBeanReference contentNegotiationManager = getContentNegotiationManager(element, source, parserContext);
        //向beanFactory注入一个RequestMappingHandlerMapping类型的bean,这个bean会在beanFactory预处理非懒加载的单例bean时加载初始化，
		该bean会为所有注解为controller的bean的方法提供路径预方法的映射
		contentNegotiationManager属性为contentNegotiationManager
		RootBeanDefinition handlerMappingDef = new RootBeanDefinition(RequestMappingHandlerMapping.class);
		handlerMappingDef.setSource(source);
		handlerMappingDef.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
		handlerMappingDef.getPropertyValues().add("order", 0);
		handlerMappingDef.getPropertyValues().add("contentNegotiationManager", contentNegotiationManager);
        //判断annotation-driven节点是否有enable-matrix-variables属性，如果设置RequestMappingHandlerMapping的removeSemicolonContent属性为配置的值取反
		if (element.hasAttribute("enable-matrix-variables")) {
			Boolean enableMatrixVariables = Boolean.valueOf(element.getAttribute("enable-matrix-variables"));
			handlerMappingDef.getPropertyValues().add("removeSemicolonContent", !enableMatrixVariables);
		}
        //处理annotation-driven节点的path-matching节点，对应配置设置为RequestMappingHandlerMapping的对应属性
		configurePathMatchingProperties(handlerMappingDef, element, parserContext);
		//注册RequestMappingHandlerMapping bean到beanFactory,名称为org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping
		readerContext.getRegistry().registerBeanDefinition(HANDLER_MAPPING_BEAN_NAME , handlerMappingDef);
        //向beanFactory注册一个名称为mvcCorsConfigurations的bean
		RuntimeBeanReference corsRef = MvcNamespaceUtils.registerCorsConfigurations(null, parserContext, source);
		//设置RequestMappingHandlerMapping的属性corsConfigurations为mvcCorsConfigurations bean
		handlerMappingDef.getPropertyValues().add("corsConfigurations", corsRef);
        //获取annotation-driven节点的conversion-service属性，如果存在则返回,如果不存在则构造一个FormattingConversionServiceFactoryBean类型的bean
		RuntimeBeanReference conversionService = getConversionService(element, source, parserContext);
		//获取annotation-driven节点的validator属性,如果存在则返回，如果不存在，则判断是否存在javax.validation.Validator这个类，如果有则
		构造一个org.springframework.validation.beanvalidation.OptionalValidatorFactoryBean类型的bean，如果不存在则返回null
		RuntimeBeanReference validator = getValidator(element, source, parserContext);
		//获取annotation-driven节点的message-codes-resolver属性,如果存在则返回，如果不存在,则返回null
		RuntimeBeanReference messageCodesResolver = getMessageCodesResolver(element);
        //构造一个ConfigurableWebBindingInitializer类型的bean，设置对应属性
		RootBeanDefinition bindingDef = new RootBeanDefinition(ConfigurableWebBindingInitializer.class);
		bindingDef.setSource(source);
		bindingDef.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
		bindingDef.getPropertyValues().add("conversionService", conversionService);
		bindingDef.getPropertyValues().add("validator", validator);
		bindingDef.getPropertyValues().add("messageCodesResolver", messageCodesResolver);
        //构造转换器
		ManagedList<?> messageConverters = getMessageConverters(element, source, parserContext);
		//获取annotation-driven节点的argument-resolvers属性，未设置则返回null
		ManagedList<?> argumentResolvers = getArgumentResolvers(element, parserContext);
		//获取annotation-driven节点的子节点return-value-handlers,未设置返回null
		ManagedList<?> returnValueHandlers = getReturnValueHandlers(element, parserContext);
		//获取annotation-driven节点的子节点async-support的default-timeout属性,未设置返回null
		String asyncTimeout = getAsyncTimeout(element);
		//获取annotation-driven节点的子节点async-support的task-executor属性,未设置返回null
		RuntimeBeanReference asyncExecutor = getAsyncExecutor(element);
		//获取annotation-driven节点的子节点async-support的子节点callable-interceptors,未设置返回[]列表
		ManagedList<?> callableInterceptors = getCallableInterceptors(element, source, parserContext);
		//获取annotation-driven节点的子节点async-support的子节点deferred-result-interceptors,未设置返回[]列表
		ManagedList<?> deferredResultInterceptors = getDeferredResultInterceptors(element, source, parserContext);
        // 构造一个RequestMappingHandlerAdapter类型的bean，设置对应属性
		RootBeanDefinition handlerAdapterDef = new RootBeanDefinition(RequestMappingHandlerAdapter.class);
		handlerAdapterDef.setSource(source);
		handlerAdapterDef.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
		handlerAdapterDef.getPropertyValues().add("contentNegotiationManager", contentNegotiationManager);
		handlerAdapterDef.getPropertyValues().add("webBindingInitializer", bindingDef);
		handlerAdapterDef.getPropertyValues().add("messageConverters", messageConverters);
		//如果有com.fasterxml.jackson.databind.ObjectMapper这个类，设置handlerAdapterDef beanr的requestBodyAdvice属性为JsonViewRequestBodyAdvice类
		addRequestBodyAdvice(handlerAdapterDef);
		//如果有com.fasterxml.jackson.databind.ObjectMapper这个类，设置handlerAdapterDefbeanr的responseBodyAdvice属性为JsonViewResponseBodyAdvice类
		addResponseBodyAdvice(handlerAdapterDef);

		if (element.hasAttribute("ignore-default-model-on-redirect")) {
			Boolean ignoreDefaultModel = Boolean.valueOf(element.getAttribute("ignore-default-model-on-redirect"));
			handlerAdapterDef.getPropertyValues().add("ignoreDefaultModelOnRedirect", ignoreDefaultModel);
		}
		if (argumentResolvers != null) {
			handlerAdapterDef.getPropertyValues().add("customArgumentResolvers", argumentResolvers);
		}
		if (returnValueHandlers != null) {
			handlerAdapterDef.getPropertyValues().add("customReturnValueHandlers", returnValueHandlers);
		}
		if (asyncTimeout != null) {
			handlerAdapterDef.getPropertyValues().add("asyncRequestTimeout", asyncTimeout);
		}
		if (asyncExecutor != null) {
			handlerAdapterDef.getPropertyValues().add("taskExecutor", asyncExecutor);
		}

		handlerAdapterDef.getPropertyValues().add("callableInterceptors", callableInterceptors);
		handlerAdapterDef.getPropertyValues().add("deferredResultInterceptors", deferredResultInterceptors);
		//向beanFactory注册一个RequestMappingHandlerAdapter类型的bean，名称为,名称为org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter
		这个bean会在beanFactory预处理非懒加载的单例bean时加载初始化，该bean负责请求参数的解析，适配，以及对应controller方法的调用
		readerContext.getRegistry().registerBeanDefinition(HANDLER_ADAPTER_BEAN_NAME , handlerAdapterDef);
        //向beanFactory注册一个CompositeUriComponentsContributorFactoryBean类型的bean
		String uriCompContribName = MvcUriComponentsBuilder.MVC_URI_COMPONENTS_CONTRIBUTOR_BEAN_NAME;
		RootBeanDefinition uriCompContribDef = new RootBeanDefinition(CompositeUriComponentsContributorFactoryBean.class);
		uriCompContribDef.setSource(source);
		uriCompContribDef.getPropertyValues().addPropertyValue("handlerAdapter", handlerAdapterDef);
		uriCompContribDef.getPropertyValues().addPropertyValue("conversionService", conversionService);
		readerContext.getRegistry().registerBeanDefinition(uriCompContribName, uriCompContribDef);
		
        //向beanFactory注册一个ConversionServiceExposingInterceptor类型的bean
		RootBeanDefinition csInterceptorDef = new RootBeanDefinition(ConversionServiceExposingInterceptor.class);
		csInterceptorDef.setSource(source);
	  csInterceptorDef.getConstructorArgumentValues().addIndexedArgumentValue(0, conversionService);
		 //向beanFactory注册一个MappedInterceptor类型的bean
		RootBeanDefinition mappedCsInterceptorDef = new RootBeanDefinition(MappedInterceptor.class);
		mappedCsInterceptorDef.setSource(source);
		mappedCsInterceptorDef.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
		mappedCsInterceptorDef.getConstructorArgumentValues().addIndexedArgumentValue(0, (Object) null);
		mappedCsInterceptorDef.getConstructorArgumentValues().addIndexedArgumentValue(1, csInterceptorDef);
		String mappedInterceptorName = readerContext.registerWithGeneratedName(mappedCsInterceptorDef);

        //向beanFactory注册一个ExceptionHandlerExceptionResolver类型的bean
		RootBeanDefinition exceptionResolver = new RootBeanDefinition(ExceptionHandlerExceptionResolver.class);
		exceptionResolver.setSource(source);
		exceptionResolver.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
		exceptionResolver.getPropertyValues().add("contentNegotiationManager", contentNegotiationManager);
		exceptionResolver.getPropertyValues().add("messageConverters", messageConverters);
		exceptionResolver.getPropertyValues().add("order", 0);
		//如果有com.fasterxml.jackson.databind.ObjectMapper这个类，设置exceptionResolver bean的responseBodyAdvice属性为JsonViewResponseBodyAdvice类
		addResponseBodyAdvice(exceptionResolver);

		if (argumentResolvers != null) {
			exceptionResolver.getPropertyValues().add("customArgumentResolvers", argumentResolvers);
		}
		if (returnValueHandlers != null) {
			exceptionResolver.getPropertyValues().add("customReturnValueHandlers", returnValueHandlers);
		}

		String methodExceptionResolverName = readerContext.registerWithGeneratedName(exceptionResolver);

        //向beanFactory注册一个ResponseStatusExceptionResolver类型的bean
		RootBeanDefinition statusExceptionResolver = new RootBeanDefinition(ResponseStatusExceptionResolver.class);
		statusExceptionResolver.setSource(source);
		statusExceptionResolver.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
		statusExceptionResolver.getPropertyValues().add("order", 1);
		String statusExResolverName = readerContext.registerWithGeneratedName(statusExceptionResolver);

        //向beanFactory注册一个DefaultHandlerExceptionResolver类型的bean
		RootBeanDefinition defaultExceptionResolver = new RootBeanDefinition(DefaultHandlerExceptionResolver.class);
		defaultExceptionResolver.setSource(source);
		defaultExceptionResolver.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
		defaultExceptionResolver.getPropertyValues().add("order", 2);
		String defaultExResolverName = readerContext.registerWithGeneratedName(defaultExceptionResolver);

		parserContext.registerComponent(new BeanComponentDefinition(handlerMappingDef, HANDLER_MAPPING_BEAN_NAME));
		parserContext.registerComponent(new BeanComponentDefinition(handlerAdapterDef, HANDLER_ADAPTER_BEAN_NAME));
		parserContext.registerComponent(new BeanComponentDefinition(uriCompContribDef, uriCompContribName));
		parserContext.registerComponent(new BeanComponentDefinition(exceptionResolver, methodExceptionResolverName));
		parserContext.registerComponent(new BeanComponentDefinition(statusExceptionResolver, statusExResolverName));
		parserContext.registerComponent(new BeanComponentDefinition(defaultExceptionResolver, defaultExResolverName));
		parserContext.registerComponent(new BeanComponentDefinition(mappedCsInterceptorDef, mappedInterceptorName));

		// Ensure BeanNameUrlHandlerMapping (SPR-8289) and default HandlerAdapters are not "turned off"
		
		MvcNamespaceUtils.registerDefaultComponents(parserContext, source);
       //向beanFactory注册一个BeanNameUrlHandlerMapping类型的bean，名称为org.springframework.web.servlet.handler.BeanNameUrlHandlerMapping
	   //向beanFactory注册一个HttpRequestHandlerAdapter类型的bean,名称为org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter
	   //向beanFactory注册一个SimpleControllerHandlerAdapter类型的bean,名称为org.springframework.web.servlet.mvc.SimpleControllerHandlerAdapter
	   //向beanFactory注册一个HandlerMappingIntrospector类型的bean,名称为org.springframework.web.servlet.handler.HandlerMappingIntrospector
		parserContext.popAndRegisterContainingComponent();

		return null;
	}
	//接下来查看RequestMappingHandlerMapping的初始化,因为RequestMappingHandlerMapping的父类AbstractHandlerMethodMapping实现了InitializingBean
	//所以在spring工厂启动处理单例bean时会调用InitializingBean
	public void afterPropertiesSet() {
	    //设置config为BuilderConfiguration
		this.config = new RequestMappingInfo.BuilderConfiguration();
		//设置config的属性urlPathHelper为UrlPathHelper实例
		this.config.setUrlPathHelper(getUrlPathHelper());
		//设置config的属性pathMatcher为AntPathMatcher实例
		this.config.setPathMatcher(getPathMatcher());
		//设置config的属性suffixPatternMatch为true
		this.config.setSuffixPatternMatch(this.useSuffixPatternMatch);
		//设置config的属性trailingSlashMatch为true
		this.config.setTrailingSlashMatch(this.useTrailingSlashMatch);
		//设置config的属性registeredSuffixPatternMatch为false
		this.config.setRegisteredSuffixPatternMatch(this.useRegisteredSuffixPatternMatch);
		//设置config的属性contentNegotiationManager,这个属性在RequestMappingHandlerMapping注入bean工厂时已注入，
		是ContentNegotiationManagerFactoryBean类型
		this.config.setContentNegotiationManager(getContentNegotiationManager());
        //调用AbstractHandlerMethodMapping的afterPropertiesSet方法，后又转到AbstractHandlerMethodMapping的initHandlerMethods
		super.afterPropertiesSet();
	}
	//接下来查看AbstractHandlerMethodMapping的initHandlerMethods方法
	protected void initHandlerMethods() {
	//获取bean工厂的所有的bean的name
		String[] beanNames = (this.detectHandlerMethodsInAncestorContexts ?
				BeanFactoryUtils.beanNamesForTypeIncludingAncestors(obtainApplicationContext(), Object.class) :
				obtainApplicationContext().getBeanNamesForType(Object.class));

		for (String beanName : beanNames) {
			if (!beanName.startsWith(SCOPED_TARGET_NAME_PREFIX)) {
				Class<?> beanType = null;
				try {
				//获取bean的class
					beanType = obtainApplicationContext().getType(beanName);
				}
				//isHandler方法在RequestMappingHandlerMapping类中实现，是用来判断bean是否有Controller或者RequestMapping注解
				if (beanType != null && isHandler(beanType)) {
				  
					detectHandlerMethods(beanName);
				}
			}
		}
		//该方法未被子类实现不做任何处理
		handlerMethodsInitialized(getHandlerMethods());
	}
	//接下来分析detectHandlerMethods方法
	protected void detectHandlerMethods(final Object handler) {
	 //判断handler类型这里为bean的name,所以是String
		Class<?> handlerType = (handler instanceof String ?
				obtainApplicationContext().getType((String) handler) : handler.getClass());

		if (handlerType != null) {
			final Class<?> userType = ClassUtils.getUserClass(handlerType);
			//在这里处理bean也就是Controller的所有的方法，会生成Method和RequestMappingInfo的映射
			Map<Method, T> methods = MethodIntrospector.selectMethods(userType,
					(MethodIntrospector.MetadataLookup<T>) method -> {
						try {
						//这里传入的参数为Method，userType为Controller的class
							return getMappingForMethod(method, userType);
						}
					});
			for (Map.Entry<Method, T> entry : methods.entrySet()) {
				Method invocableMethod = AopUtils.selectInvocableMethod(entry.getKey(), userType);
				T mapping = entry.getValue();
				//添加RequestMappingInfo到mappingRegistry
				registerHandlerMethod(handler, invocableMethod, mapping);
			}
		}
	}
	//接下来查看getMappingForMethod(method, userType)方法，这个方法的实现在RequestMappingHandlerMapping类中
	protected RequestMappingInfo getMappingForMethod(Method method, Class<?> handlerType) {
	  //可以看出具体的实现是createRequestMappingInfo方法
		RequestMappingInfo info = createRequestMappingInfo(method);
		if (info != null) {
		//这里会把Controller配置的RequestMapping和方法上配置的RequestMapping合并起来，path会做拼接
			RequestMappingInfo typeInfo = createRequestMappingInfo(handlerType);
			if (typeInfo != null) {
				info = typeInfo.combine(info);
			}
		}
		return info;
	}
	private RequestMappingInfo createRequestMappingInfo(AnnotatedElement element) {
	  //获取方法的RequestMapping注解
		RequestMapping requestMapping = AnnotatedElementUtils.findMergedAnnotation(element, RequestMapping.class);
		//getCustomTypeCondition方法返回时null，不做任何处理
		RequestCondition<?> condition = (element instanceof Class ?
				getCustomTypeCondition((Class<?>) element) : getCustomMethodCondition((Method) element));
		return (requestMapping != null ? createRequestMappingInfo(requestMapping, condition) : null);
	}
	protected RequestMappingInfo createRequestMappingInfo(
			RequestMapping requestMapping, @Nullable RequestCondition<?> customCondition) {
       //根据配置的RequestMapping构造一个RequestMappingInfo
		RequestMappingInfo.Builder builder = RequestMappingInfo
				.paths(resolveEmbeddedValuesInPatterns(requestMapping.path()))
				.methods(requestMapping.method())
				.params(requestMapping.params())
				.headers(requestMapping.headers())
				.consumes(requestMapping.consumes())
				.produces(requestMapping.produces())
				.mappingName(requestMapping.name());
		if (customCondition != null) {
			builder.customCondition(customCondition);
		}
		return builder.options(this.config).build();
	}
~~~
