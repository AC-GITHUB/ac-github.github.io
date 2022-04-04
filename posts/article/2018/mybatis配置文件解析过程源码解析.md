---
title: mybatis配置文件解析过程源码解析
tag: 
  - mybatis
category: mybatis
description: 本文描述mybatsi的配置文件以及mapper映射文件的解析过程
date: 2018-11-24 21:47:32
---
1. 首先查看mybatis的入口SqlSessionFactoryBuilder
```java
//加载mybatis-config.xml
public SqlSessionFactory build(Reader reader) {
        return this.build((Reader)reader, (String)null, (Properties)null);
   }
    //建立一个SqlSessionFactory
    public SqlSessionFactory build(Reader reader, String environment, Properties properties) {
        SqlSessionFactory var5;
        try {
            //初始化一个XMLConfigBuilder
            XMLConfigBuilder parser = new XMLConfigBuilder(reader, environment, properties);
           //建立SqlSessionFactory用于生成SqlSession，重点方法parser.parse()
            var5 = this.build(parser.parse());
        } 
        return var5;
    }
```
2. 接下来重点分析XMLConfigBuilder parse()方法
```java
//先查看构造初始化方法
private XMLConfigBuilder(XPathParser parser, String environment, Properties props) {
         //new 一个Configuration
        super(new Configuration());
         //设置的默认的localReflectorFactory
        this.localReflectorFactory = new DefaultReflectorFactory();
        ErrorContext.instance().resource("SQL Mapper Configuration");
        this.configuration.setVariables(props);
        this.parsed = false;
        this.environment = environment;
        this.parser = parser;
    }
	//接下来查看parse方法
	public Configuration parse() {
        //判断是否已经解析过了
        if (this.parsed) {
            throw new BuilderException("Each XMLConfigBuilder can only be used once.");
        } else {
            this.parsed = true;
           //解析配置mybatis-config.xml,this.parse是XPathParser用于从获取xml的节点
            this.parseConfiguration(this.parser.evalNode("/configuration"));
            return this.configuration;
        }
    }
	private void parseConfiguration(XNode root) {
        try {
            //解析配置的properties节点，解析后放置到Configuration的variables属性中
            this.propertiesElement(root.evalNode("properties"));
            //解析typeAliases节点，解析后加入到Configuration的typeAliasRegistry
            this.typeAliasesElement(root.evalNode("typeAliases"));
           //解析plugins节点，plugin是实现了Interceptor接口的类,解析后加入到Configuration的interceptorChain中
            this.pluginElement(root.evalNode("plugins"));
            //解析objectFactory节点，解析后设置Configuration的objectFactory属性，未配置时默认DefaultObjectFactory
            this.objectFactoryElement(root.evalNode("objectFactory"));
            //解析objectWrapperFactory节点，解析后设置Configuration的objectWrapperFactory,未配置时默认DefaultObjectWrapperFactory
            this.objectWrapperFactoryElement(root.evalNode("objectWrapperFactory"));
           //解析reflectionFactory节点，解析后设置Configuration的reflectorFactory，未配置时默认DefaultReflectorFactory
           this.reflectionFactoryElement(root.evalNode("reflectionFactory"));
           //解析settings节点,获取settings的值设置Configuration对应的属性,未配置时使用默认值
            this.settingsElement(root.evalNode("settings"));
             //解析environments，使用默认值设置Configuration的environment属性
            this.environmentsElement(root.evalNode("environments"));
             //解析databaseIdProvider节点,解析后,设置Configuration的databaseId属性
            this.databaseIdProviderElement(root.evalNode("databaseIdProvider"));
             //解析typeHandlers节点,提供jdbc类型和java类型的转换，解析后添加到Configuration的typeHandlerRegistry属性
            this.typeHandlerElement(root.evalNode("typeHandlers"));
            //最重要的部分解析mapper文件
            this.mapperElement(root.evalNode("mappers"));
        } catch (Exception var3) {
            throw new BuilderException("Error parsing SQL Mapper Configuration. Cause: " + var3, var3);
        }
    }
    //解析mapper文件
	private void mapperElement(XNode parent) throws Exception {
        if (parent != null) {
            //获取所有的子节点
            Iterator i$ = parent.getChildren().iterator();

            while(true) {
                while(i$.hasNext()) {
                    XNode child = (XNode)i$.next();
                    String resource;
                     //判断mapper类型，调用不同的解析方法，重点查看resource类型的节点解析
                    if ("package".equals(child.getName())) {
                        resource = child.getStringAttribute("name");
                        this.configuration.addMappers(resource);
                    } else {
                       //获取节点属性
                        resource = child.getStringAttribute("resource");//获取mapper.xml的路径
                        String url = child.getStringAttribute("url");
                        String mapperClass = child.getStringAttribute("class");
                        XMLMapperBuilder mapperParser;
                        InputStream inputStream;
                        if (resource != null && url == null && mapperClass == null) {
                            ErrorContext.instance().resource(resource);
                            inputStream = Resources.getResourceAsStream(resource);
                            //解析mapper.xml，重点
                            mapperParser = new XMLMapperBuilder(inputStream, this.configuration, resource, this.configuration.getSqlFragments());
                            mapperParser.parse();
                        } else if (resource == null && url != null && mapperClass == null) {
                            ErrorContext.instance().resource(url);
                            inputStream = Resources.getUrlAsStream(url);
                            mapperParser = new XMLMapperBuilder(inputStream, this.configuration, url, this.configuration.getSqlFragments());
                            mapperParser.parse();
                        } else {
                            if (resource != null || url != null || mapperClass == null) {
                                throw new BuilderException("A mapper element may only specify a url, resource or class, but not more than one.");
                            }

                            Class<?> mapperInterface = Resources.classForName(mapperClass);
                            this.configuration.addMapper(mapperInterface);
                        }
                    }
                }

                return;
            }
        }
    }
```
2.接下来重点分析XMLMapperBuilder的parse方法
```java
//先查看构造初始化方法
private XMLMapperBuilder(XPathParser parser, Configuration configuration, String resource, Map<String, XNode> sqlFragments) {
        super(configuration);
         //新构造一个MapperBuilderAssistant
        this.builderAssistant = new MapperBuilderAssistant(configuration, resource);
        this.parser = parser;
        this.sqlFragments = sqlFragments;
        this.resource = resource;
    }
    //接下来查看parse方法
	public void parse() {
         //判断是否解析过,判断Configuration的loadedResources属性里是否包含resource
        if (!this.configuration.isResourceLoaded(this.resource)) {
             //解析mapper文件,重点
            this.configurationElement(this.parser.evalNode("/mapper"));
             //向Configuration的loadedResources属性添加resource的路径，以便于判断是否解析过mapper文件
            this.configuration.addLoadedResource(this.resource);
            this.bindMapperForNamespace();
        }
        this.parsePendingResultMaps();
        this.parsePendingChacheRefs();
        this.parsePendingStatements();
    }
	private void configurationElement(XNode context) {
        try {
             //获取mapper的namespace属性
            String namespace = context.getStringAttribute("namespace");
            if (namespace != null && !namespace.equals("")) {
                //设置MapperBuilderAssistant的namespace属性
                this.builderAssistant.setCurrentNamespace(namespace);
               //解析cache-ref，结果添加到Configuration的cacheRefMap属性,key为mapper的namespace,value值为cache-ref的namespace
                this.cacheRefElement(context.evalNode("cache-ref"));
                //解析cache节点,结果添加到Configuration的caches属性,key为mapper的namespace,value为cache实现类，默认是PerpetualCache
                this.cacheElement(context.evalNode("cache"));
               //解析parameterMap节点,解析结果添加到Configuration的parameterMaps属性,key为parameterMap的id,value为parameterMap，对应的属性填充
                this.parameterMapElement(context.evalNodes("/mapper/parameterMap"));
              //解析resultMap节点,解析结果添加到Configuration的resultMaps属性，key为mapper的namespace加上resultMap的id保证唯一性,value为ResultMap对应属性填充
                this.resultMapElements(context.evalNodes("/mapper/resultMap"));
                //解析sql节点，解析结果添加到Configuration的sqlFragments属性,key为mapper的namespace加上sql的id保证唯一性,value为sql节点对应属性填充
                this.sqlElement(context.evalNodes("/mapper/sql"));
              //解析 select|insert|update|delete节点，解析结果添加到 Configuration的mappedStatements属性,
			  key为mapper的namespace加上节点的id保证唯一性,value为MappedStatement节点对应属性填
			  this.buildStatementFromContext(context.evalNodes("select|insert|update|delete"));
            } else {
                throw new BuilderException("Mapper's namespace cannot be empty");
            }
        } catch (Exception var3) {
            throw new BuilderException("Error parsing Mapper XML. Cause: " + var3, var3);
        }
    }
	//接下来查看parse方法中剩余的几个步骤
	public void parse() {
        if (!this.configuration.isResourceLoaded(this.resource)) {
            this.configurationElement(this.parser.evalNode("/mapper"));
            this.configuration.addLoadedResource(this.resource);
			//处理mapper.xml文件绑定的java接口，重点
            this.bindMapperForNamespace();
        }
        //重新处理ResultMap有处理异常的ResultMap，如果还有异常就删除
        this.parsePendingResultMaps();
		 //重新处理ChacheRef有处理异常的ChacheRef，如果还有异常就删除
        this.parsePendingChacheRefs();
		 //重新处理Statement有处理异常的Statement，如果还有异常就删除
        this.parsePendingStatements();
    }
	//接下来查看处理mapper.xml文件绑定的java接口
	private void bindMapperForNamespace() {
        String namespace = this.builderAssistant.getCurrentNamespace();
        if (namespace != null) {
            Class boundType = null;
            try {
			   //获取mapper.xml绑定的java接口的class文件
                boundType = Resources.classForName(namespace);
            } catch (ClassNotFoundException var4) {
                ;
            }

            if (boundType != null && !this.configuration.hasMapper(boundType)) {
			  //添加到configuration的loadedResources属性
                this.configuration.addLoadedResource("namespace:" + namespace);
				//添加到configuration的mapperRegistry属性中
                this.configuration.addMapper(boundType);
            }
        }

    }
	//接下里查看添加mapper.xml绑定的java接口到configuration的mapperRegistry属性中
	//的过程
	public <T> void addMapper(Class<T> type) {
	  //判断类型是否为接口
        if (type.isInterface()) {
		//判断该类已经注册过了
            if (this.hasMapper(type)) {
                throw new BindingException("Type " + type + " is already known to the MapperRegistry.");
            }

            boolean loadCompleted = false;

            try {
			  //添加一个接口的包装MapperProxyFactory到configuration的mapperRegistry属性
			  //的knownMappers属性中
                this.knownMappers.put(type, new MapperProxyFactory(type));
				//包装一个MapperAnnotationBuilder
                MapperAnnotationBuilder parser = new MapperAnnotationBuilder(this.config, type);
				//判断java接口的mapper.xml文件是否解析，如果没有解析，解析mapper.xml
                parser.parse();
                loadCompleted = true;
            } finally {
                if (!loadCompleted) {
                    this.knownMappers.remove(type);
                }

            }
        }

    }
```