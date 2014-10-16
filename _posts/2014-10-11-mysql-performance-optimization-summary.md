---
layout: post
title: MySQL性能优化小结
excerpt: 数据库设计和查询优化、服务器端优化以及存储引擎的选择，缓存优化技巧。
---

# 一.数据库设计和查询优化
1. Schema设计时主要考虑:标准化,数据类型,索引.
   - 一个数据库设计可以混合使用,一部分表格标准化,一部分表格非标准化.(非标准化表格适当冗余)
   - 最优的数据类型,使表在磁盘上占据的空间尽可能小,读写快,占用内存少.(索引也尽量建立在较小的列上)
   - 正确索引,提高Select,Update,Delete性能.
2. 不同的Sql不同的优化方案
   - Explain Sql查看结果,分析查询.
   - 查询使用匹配的类型.
   - 使用long-slow-queries记录较慢查询,分析优化.

# 二.服务器端优化
1. 安装适当的MySql版本.
 如果服务器使用Intel处理器,使用Intel C++版本可提高30 %效率
2. 配置优化.
 常见优化项:
  - `charset`  
  - `max_allowed_packet`  
  - `max_connections`  
  - `table_cache_size`  
  - `query_cache_size`

三.存储引擎优化

- **MyISAM**
    1. 引擎特点
       - 不支持事务,提供高速存储,检索以及全文搜索能力.
       - 宕机会破坏表.
       - 使用的磁盘和内存空间小.
       - 基于表的锁,并发更新数据会出现严重性能问题.
       - MySql只缓存索引,数据由OS缓存.
    2. 适用情况
       - 日志系统.
       - 只读操作或者大部分读操作.
       - 全表扫描.
       - 批量导入数据.
       - 没有事务的低并发读写.
    3. 优化策略
       - NOT NULL,可以减少磁盘存储.
       - Optimize Table,碎片整理,回收空闲空间.
       - Deleting/updating/adding大量数据的时候禁止使用index.
       - 参数优化,key_buffer_size_variable索引缓存设置.
       - 避免并发Inset Update.
- **InnoDB**
    1. 引擎特点
       - 具有提交,回滚和崩溃恢复能力的事务安全存储引擎.
       - 处理巨大数据量性能卓越,它的CPU使用效率非常高.
       - 需要更多的内存和磁盘存储空间.
       - 数据和索引都缓存在内存中.
    2. 适用情况
       - 需要事务的应用.
       - 高并发的应用.
       - 自动恢复.
       - 较快速的基于主键的操作.
    3. 优化策略
       - 尽量使用short,integer的主键.
       - 使用prefix keys,因为InnoDB没有key压缩功能.
       - 参数优化,innodb_buffer_pool_size,innodb_data_home_dir等等.

# 三. 缓存优化 
1. Memcached
2. Redis

转自： http://allensuiverson.blog.163.com/blog/static/133648269201310119491437/