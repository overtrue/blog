---
layout: post
title: laravel-mongodb 拓展与 MySQL 关联问题
excerpt: jenssegers/laravel-mongodb与MySQL关联查询时字段类型不一致导致查询不到结果的问题解决。
---

当我们在存储mongo数据的时候，整型字段存储的值为`NumberLong`格式，那么如果这个id来自于MySQL，在使用MySQL模型与MongoDB关联查询时就会踩到这个坑，从jenssegers/laravel-mongodb生成的SQL可以看到类似这样的结果：

```sql
...{"object_id":{"$in":["13", "15"]}}...
```

可是我们的期望是：

```sql
...{"object_id":{"$in":[13, 15]}}...
```

这里的13、15是MySQL里的一条记录，在mongo里的值为`NumberLong(13)`， 所以查询结果永远为空。
找遍了源码，没有一个更好的解决方法，后来只能使用Eloquent模型提供的[**属性修改器**](http://v4.golaravel.com/docs/4.2/eloquent#accessors-and-mutators)来实现：

在**MySQL的模型里**对相应字段使用修改器(这里以id为例)：

```php?start_inline=1
/**
 * 避免与mongo关联时id转为字符的问题
 *
 * @param string $id
 *
 * @return int
 */
public function getIdAttribute($id)
{
    return intval($id);
}
```

方法名：`get属性名大驼峰Attribute`, ex: `object_id` -> `getObjectIdAttribute`

框架源码参考：[getAttribute](https://github.com/laravel/framework/blob/4.2/src/Illuminate/Database/Eloquent/Model.php#L2409-L2419)
