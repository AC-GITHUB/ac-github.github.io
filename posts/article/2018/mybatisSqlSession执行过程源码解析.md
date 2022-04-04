---
title: mybatisSqlSession执行过程源码解析
tag: 
  - mybatis
category: mybatis
description: '本文主要解析SqlSession执行sql语句的详细过程'
date: 2018-11-25 00:59:12
---
1. 首先查看mybatis的入口DefaultSqlSessionFactory
```java
//获取SqlSession
public SqlSession openSession() {
        return this.openSessionFromDataSource(this.configuration.getDefaultExecutorType(), (TransactionIsolationLevel)null, false);
    }
	
	 private SqlSession openSessionFromDataSource(ExecutorType execType, TransactionIsolationLevel level, boolean autoCommit) {
        Transaction tx = null;

        DefaultSqlSession var8;
        try {
		    //获取Configuration的environment属性
            Environment environment = this.configuration.getEnvironment();
			//获取Configuration的environment的TransactionFactory新建一个事物
            TransactionFactory transactionFactory = this.getTransactionFactoryFromEnvironment(environment);
            tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);
			//获取执行器，负责执行sql语句，使用默认类型ExecutorType.Simple		
            Executor executor = this.configuration.newExecutor(tx, execType);
            var8 = new DefaultSqlSession(this.configuration, executor, autoCommit);
        } catch (Exception var12) {
            this.closeTransaction(tx);
            throw ExceptionFactory.wrapException("Error opening session.  Cause: " + var12, var12);
        } finally {
            ErrorContext.instance().reset();
        }

        return var8;
    }
	public Executor newExecutor(Transaction transaction, ExecutorType executorType) {
	    //判断执行器的类型
        executorType = executorType == null ? this.defaultExecutorType : executorType;
        executorType = executorType == null ? ExecutorType.SIMPLE : executorType;
		//根据执行器类型，返回不同的执行器
        Object executor;
        if (ExecutorType.BATCH == executorType) {
            executor = new BatchExecutor(this, transaction);
        } else if (ExecutorType.REUSE == executorType) {
            executor = new ReuseExecutor(this, transaction);
        } else {
            executor = new SimpleExecutor(this, transaction);
        }
       /*判断是否开启一级缓存，默认开启，如果开启一级缓存使用CachingExecutor执行器，一级缓存是在SqlSession 层面进行缓存的,即，
	   同一个SqlSession ，多次调用同一个Mapper和同一个方法的同一个参数，只会进行一次数据库查询，然后把数据缓存到缓冲中，
	   以后直接先从缓存中取出数据，不会直接去查数据库*/
        if (this.cacheEnabled) {
            executor = new CachingExecutor((Executor)executor);
        }
        //调用插件,传入对象为执行器对象
        Executor executor = (Executor)this.interceptorChain.pluginAll(executor);
        return executor;
    }
	//接下来查看SqlSession的selectOne方法，statement为mapper接口的全路径名称加上调用的方法名,parameter为查询参数
	public <T> T selectOne(String statement, Object parameter) {
        List<T> list = this.selectList(statement, parameter);
        if (list.size() == 1) {
            return list.get(0);
        } 
    }
	 public <E> List<E> selectList(String statement, Object parameter) {
        return this.selectList(statement, parameter, RowBounds.DEFAULT);
    }
	public <E> List<E> selectList(String statement, Object parameter, RowBounds rowBounds) {
        List var5;
        try {
		    //从configuration中根据mapper接口的全路径名加上方法名获取一个MappedStatement
            MappedStatement ms = this.configuration.getMappedStatement(statement);
			//包装参数
			DefaultSqlSession.StrictMap map;
        if (object instanceof Collection) {
            map = new DefaultSqlSession.StrictMap();
            map.put("collection", object);
            if (object instanceof List) {
                map.put("list", object);
            }

            return map;
        } else if (object != null && object.getClass().isArray()) {
            map = new DefaultSqlSession.StrictMap();
            map.put("array", object);
            return map;
        } else {
            return object;
        }
		    //利用执行器查询数据库
            var5 = this.executor.query(ms, this.wrapCollection(parameter), rowBounds, Executor.NO_RESULT_HANDLER);
        } catch (Exception var9) {
            throw ExceptionFactory.wrapException("Error querying database.  Cause: " + var9, var9);
        } finally {
            ErrorContext.instance().reset();
        }

        return var5;
    }
	//接下来查看CachingExecutor的query方法，到这里resultHandler是null，rowBounds使用默认值,parameterObject是传入的参数本身或者是一个map对象
	public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException {
	    //获取根据参数包装的BoundSql
        BoundSql boundSql = ms.getBoundSql(parameterObject);
		//构造一个缓存key判断该查询是否已经有缓存
        CacheKey key = this.createCacheKey(ms, parameterObject, rowBounds, boundSql);
        return this.query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
    }
	//接下来查看CachingExecutor的query方法
	 public <E> List<E> query(MappedStatement ms, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
	    //判断是否开启了二级缓存
        Cache cache = ms.getCache();
        if (cache != null) {
		    //判断是否需要清理二级缓存,清理二级缓存
            this.flushCacheIfRequired(ms);
			//判断该查询是否需要使用二级缓存是否
            if (ms.isUseCache() && resultHandler == null) {
                this.ensureNoOutParams(ms, parameterObject, boundSql);
				//根据缓存key获取二级缓存的缓存内容
                List<E> list = (List)this.tcm.getObject(cache, key);
                if (list == null) {
				    //获取查询结果
                    list = this.delegate.query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
					//将查询结果添加到二级缓存
                    this.tcm.putObject(cache, key, list);
                }

                return list;
            }
        }
       // 这个方法最终调用BaseExecutor的query方法
        return this.delegate.query(ms, parameterObject, rowBounds, resultHandler, key, boundSql);
    }
	public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
        ErrorContext.instance().resource(ms.getResource()).activity("executing a query").object(ms.getId());
        if (this.closed) {
            throw new ExecutorException("Executor was closed.");
        } else {
		//判断是否为第一次查询，以及是否需要清理缓存，queryStack第一次使用为0
            if (this.queryStack == 0 && ms.isFlushCacheRequired()) {
                this.clearLocalCache();
            }

            List list;
            try {
                ++this.queryStack;
				//根据缓存key获取一级缓存结果
                list = resultHandler == null ? (List)this.localCache.getObject(key) : null;
				//判断是否为游标执行器，如果是则另行处理
                if (list != null) {
                    this.handleLocallyCachedOutputParameters(ms, key, parameter, boundSql);
                } else {//没有缓存则查询数据库
                    list = this.queryFromDatabase(ms, parameter, rowBounds, resultHandler, key, boundSql);
                }
            } finally {
                --this.queryStack;
            }

            if (this.queryStack == 0) {
                Iterator i$ = this.deferredLoads.iterator();

                while(i$.hasNext()) {
                    BaseExecutor.DeferredLoad deferredLoad = (BaseExecutor.DeferredLoad)i$.next();
                    deferredLoad.load();
                }

                this.deferredLoads.clear();
                if (this.configuration.getLocalCacheScope() == LocalCacheScope.STATEMENT) {
                    this.clearLocalCache();
                }
            }

            return list;
        }
    }
	//接下来查看查询数据库的代码
	private <E> List<E> queryFromDatabase(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
        this.localCache.putObject(key, ExecutionPlaceholder.EXECUTION_PLACEHOLDER);

        List list;
        try {
		//查询数据库，该方法最终为SimpleExecutor的doQuery方法
            list = this.doQuery(ms, parameter, rowBounds, resultHandler, boundSql);
        } finally {
            this.localCache.removeObject(key);
        }
       //将查询结果加入一级缓存
        this.localCache.putObject(key, list);
        if (ms.getStatementType() == StatementType.CALLABLE) {
            this.localOutputParameterCache.putObject(key, parameter);
        }

        return list;
    }
	 public <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) throws SQLException {
        Statement stmt = null;

        List var9;
        try {
            Configuration configuration = ms.getConfiguration();
		/*新构造一个StatementHandler,实现是RoutingStatementHandler，此时this.wrapper是执行器本身,最终代理到SimpleStatementHandler	,代码如下
			 StatementHandler statementHandler = new RoutingStatementHandler(executor, mappedStatement, parameterObject, rowBounds, resultHandler, boundSql);
			 调用一次插件
        StatementHandler statementHandler = (StatementHandler)this.interceptorChain.pluginAll(statementHandler);
        return statementHandler;
		接下来查看SimpleStatementHandler的构造方法
		public SimpleStatementHandler(Executor executor, MappedStatement mappedStatement, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {
        super(executor, mappedStatement, parameter, rowBounds, resultHandler, boundSql);
    }
	最后这个方法到BaseStatementHandler的构造方法
	protected BaseStatementHandler(Executor executor, MappedStatement mappedStatement, Object parameterObject, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) {
        this.configuration = mappedStatement.getConfiguration();
        this.executor = executor;
        this.mappedStatement = mappedStatement;
        this.rowBounds = rowBounds;
        this.typeHandlerRegistry = this.configuration.getTypeHandlerRegistry();
        this.objectFactory = this.configuration.getObjectFactory();
        if (boundSql == null) {
            this.generateKeys(parameterObject);
            boundSql = mappedStatement.getBoundSql(parameterObject);
        }

        this.boundSql = boundSql;
		新构造一个parameterHandler，代码如下
		ParameterHandler parameterHandler = mappedStatement.getLang().createParameterHandler(mappedStatement, parameterObject, boundSql);
		调用一次插件
        parameterHandler = (ParameterHandler)this.interceptorChain.pluginAll(parameterHandler);
        return parameterHandler;

        this.parameterHandler = this.configuration.newParameterHandler(mappedStatement, parameterObject, boundSql);
		新构造一个resultSetHandler，代码如下
		ResultSetHandler resultSetHandler = new DefaultResultSetHandler(executor, mappedStatement, parameterHandler, resultHandler, boundSql, rowBounds);
		调用一次插件
        ResultSetHandler resultSetHandler = (ResultSetHandler)this.interceptorChain.pluginAll(resultSetHandler);
        return resultSetHandler;
		
        this.resultSetHandler = this.configuration.newResultSetHandler(executor, mappedStatement, rowBounds, this.parameterHandler, resultHandler, boundSql);
    }*/
	
            StatementHandler handler = configuration.newStatementHandler(this.wrapper, ms, parameter, rowBounds, resultHandler, boundSql);
			//获取一个jdbc Connection,以及获取jdbc Statement
			Connection connection = this.getConnection(statementLog);
			//调用SimpleStatementHandler的prepare方法代码如下
			ErrorContext.instance().sql(this.boundSql.getSql());
        Statement statement = null;

        try {
            statement = this.instantiateStatement(connection);
            this.setStatementTimeout(statement);
            this.setFetchSize(statement);
            return statement;
        }
        Statement stmt = handler.prepare(connection);
        handler.parameterize(stmt);
        return stmt;
            stmt = this.prepareStatement(handler, ms.getStatementLog());
			//执行sql获取结果
            var9 = handler.query(stmt, resultHandler);
        } finally {
            this.closeStatement(stmt);
        }

        return var9;
    }
	//查看sql执行结果
	 public <E> List<E> query(Statement statement, ResultHandler resultHandler) throws SQLException {
        String sql = this.boundSql.getSql();
        statement.execute(sql);
		//将jdbc结果映射为java对象返回
        return this.resultSetHandler.handleResultSets(statement);
    }
	//接下来解析SqlSession的update,delete，insert方法，这三个方法最后都会转到下面这个方法
	public int update(String statement, Object parameter) {
        int var4;
        try {
            this.dirty = true;
			//获取一个MappedStatement
            MappedStatement ms = this.configuration.getMappedStatement(statement);
			//这个方法会调用CachingExecutor的update方法
            var4 = this.executor.update(ms, this.wrapCollection(parameter));
        } 
        return var4;
    }
	//CachingExecutor的update方法
	public int update(MappedStatement ms, Object parameterObject) throws SQLException {
	      //判断如果有二级缓存清理二级缓存
        this.flushCacheIfRequired(ms);
		//这个delegate是SimpleExecutor,所以会调用BaseExecutor的update方法
        return this.delegate.update(ms, parameterObject);
    }
	//BaseExecutor的update方法
	public int update(MappedStatement ms, Object parameter) throws SQLException {
        if (this.closed) {
            throw new ExecutorException("Executor was closed.");
        } else {
		//清理一级缓存
            this.clearLocalCache();
			//到这儿调用SimpleExecutor的doUpdate方法
            return this.doUpdate(ms, parameter);
        }
    }
	//SimpleExecutor的doUpdate方法
	public int doUpdate(MappedStatement ms, Object parameter) throws SQLException {
        Statement stmt = null;
        int var6;
        try {
            Configuration configuration = ms.getConfiguration();
            StatementHandler handler = configuration.newStatementHandler(this, ms, parameter, RowBounds.DEFAULT, (ResultHandler)null, (BoundSql)null);
            stmt = this.prepareStatement(handler, ms.getStatementLog());
			//这个方法会调用SimpleStatementHandler的update方法
            var6 = handler.update(stmt);
        } finally {
            this.closeStatement(stmt);
        }

        return var6;
    }
	//SimpleStatementHandler的update方法
	public int update(Statement statement) throws SQLException {
        String sql = this.boundSql.getSql();
        Object parameterObject = this.boundSql.getParameterObject();
		//获取主键映射
        KeyGenerator keyGenerator = this.mappedStatement.getKeyGenerator();
        int rows;
        if (keyGenerator instanceof Jdbc3KeyGenerator) {
		    //执行sql语句
            statement.execute(sql, 1);
			//获取受影响行的数量
            rows = statement.getUpdateCount();
			//处理主键映射，主要用于增加和删除时可以返回受影响的主键
            keyGenerator.processAfter(this.executor, this.mappedStatement, statement, parameterObject);
        } else if (keyGenerator instanceof SelectKeyGenerator) {
            statement.execute(sql);
            rows = statement.getUpdateCount();
            keyGenerator.processAfter(this.executor, this.mappedStatement, statement, parameterObject);
        } else {
            statement.execute(sql);
            rows = statement.getUpdateCount();
        }

        return rows;
    }
```