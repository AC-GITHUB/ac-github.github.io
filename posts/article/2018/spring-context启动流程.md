---
title: spring context启动流程
comment: true
tag: 
  - spring
category: spring
description: 本文主要描述springcontext 的启动流程以及启动时执行的方法
date: 2018-11-18 20:24:23
---
## springcontext 的启动流程源码
springcontext启动的流程都在AbstractApplicationContext类的refresh()中
~~~java
public void refresh() throws BeansException, IllegalStateException {
       Object var1 = this.startupShutdownMonitor;
		//获取监控锁防止多次启动
       synchronized(this.startupShutdownMonitor) {
		//初始化处理环境变量
            this.prepareRefresh();
//创建beanFactory，实现类DefaultListableBeanFactory,并加载bean定义到beanFactory
            ConfigurableListableBeanFactory beanFactory = this.obtainFreshBeanFactory();
			//设置beanFactory需要的参数
            this.prepareBeanFactory(beanFactory);
            try {
                this.postProcessBeanFactory(beanFactory);
    			//调用并执行所有的BeanFactoryPostProcessors
                this.invokeBeanFactoryPostProcessors(beanFactory);
    			//向beanFactory注册所有的BeanPostProcessor
                this.registerBeanPostProcessors(beanFactory);
    			//初始化MessageSource类
                this.initMessageSource();
    			//初始化注册ApplicationEventMulticaster
                this.initApplicationEventMulticaster();
                this.onRefresh();
    			//处理ApplicationListener
                this.registerListeners();
    			//完成初始化，并处理非懒加载的单例bean
                this.finishBeanFactoryInitialization(beanFactory);
    			//执行LifecycleProcessor,执行ApplicationEvent
                this.finishRefresh();
            } catch (BeansException var9) {
                if (this.logger.isWarnEnabled()) {
                    this.logger.warn("Exception encountered during
    				context initialization - cancelling refresh
    				attempt: " + var9);
                }
                this.destroyBeans();
                this.cancelRefresh(var9);
                throw var9;
            } finally {
                this.resetCommonCaches();
            }
    
        }
    }
~~~