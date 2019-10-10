---
layout: post
title: 一种 Laravel 中简单设置多态关系模型别名（Polymorphic Types）的方式
excerpt: 我终于找到了一个比较方便的设置多态别名的方式了
---

作为 Laravel 的重度使用者肯定都对多态关系不默生，以官方文档为例，文章有标签，视频有标签，那么文章和视频这些模型与标签模型的关系就是[多态多对多（Many To Many (Polymorphic)）](https://laravel.com/docs/6.x/eloquent-relationships#many-to-many-polymorphic-relations)

如果我们给 ID 为 1 的文章打上两个标签，数据库标签关系表的的存储结果就是这样子：

```
> select * from taggables;
+--------+-------------+---------------+
| tag_id | taggable_id | taggable_type |
+--------+-------------+---------------+
|      1 |           1 | App\Post      |
|      2 |           1 | App\Post      |
+--------+-------------+---------------+
```

相信有不少人和我一样希望 `taggable_type` 的值不要直接用模型类名，而是使用表名：`posts`。官方文档的建议是：

```
use Illuminate\Database\Eloquent\Relations\Relation;

Relation::morphMap([
    'posts' => 'App\Post',
    'videos' => 'App\Video',
]);
```

> https://laravel.com/docs/6.x/eloquent-relationships#custom-polymorphic-types

我们可以将这个定义写到 AppServiceProvider 中，但是有一个非常严重的问题：**我们在新增或者删除模型的时候，会很容易忘记去更新这个定义**。我已经至少出现这个问题 3 次了，所以我一直在纠结有没有更好的方法，今天突然灵机一动，实现了一个看起来似乎是一个不错的方式，分享给大家。

## 思路来源

我尝试跟踪了一遍源码，发现模型中有一个方法 `getMorphClass`，多态关联的时候，就是用它来取目标对象的类型名称的，默认返回类名：

```php
public function getMorphClass()
{
    $morphMap = Relation::morphMap();

    if (! empty($morphMap) && in_array(static::class, $morphMap)) {
        return array_search(static::class, $morphMap, true);
    }

    return static::class;
}
```

那么，只要我们在模型中覆盖这个方法便可以方便的实现目标了。

## 实现目标

我们有两个选择去实现它：

1. 创建一个模型基类覆盖这个方法，所有的模型都来集成它即可；
2. 创建一个 trait，在需要的模型中引入它。

我当然会选择 trait 方式来实现，不管从定义还是代码耦合度上，使用 trait 来解决这类特性需求都是再适合不过了，如果你对 trait 还不太熟悉，可以阅读我之前的文章：[《我所理解的 PHP Trait》](https://overtrue.me/articles/2016/04/about-php-trait.html)

我们的目标是使用表名来做为关系类别名，那么在模型中如何获取表名呢，直接使用模型的 `getTable` 即可，那么整个 trait 的实现如下：

*app/Traits/UseTableNameAsMorphClass.php*
```php
<?php
namespace App\Traits;


trait UseTableNameAsMorphClass
{
    public function getMorphClass()
    {
        return $this->getTable();
    }
}
```

然后在我们需要用到关系类型的模型中引入它即可：

```php
<?php

namespace App;

use App\Traits\UseTableNameAsMorphClass;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
	use UseTableNameAsMorphClass;

	//...
}
```

## 友情提示

当然，如果你习惯给表名加前缀，或者你的表名与模型名不太一致，那么，你只需要修改 `trait` 中 `getMorphClass` 的实现即可，我个人的习惯是模型名就是表名的单数，不带前缀。

如果你有更好的实现方式，欢迎留言交流。