---
layout: post
title: 在 Laravel 外使用 Eloquent（一）
excerpt: 详细讲解如何在你自己的非Laravel项目里使用Laravel的强大ORM：Eloquent.
---


不得不承认Laravel的Eloquent是一个很棒的ORM，其实Laravel框架的设计本身结构使用的是subtree实现(外层使用的[git-subsplit](https://github.com/dflydev/git-subsplit)) , 也就是说Eloquent是独立的模块，我们也可以在自己的项目里通过composer来使用Eloquent，本文就详细讲解如何在自己的项目集成Eloquent。

## 安装

首先我们得有`composer`，安装方法请详见：[https://getcomposer.org/doc/00-intro.md ](https://getcomposer.org/doc/00-intro.md)
可能没有翻墙的情况下使用composer会比较慢，那么这里同样有福利：[http://pkg.phpcomposer.com/](http://pkg.phpcomposer.com/) 。

我们这里建议一个项目demo, 然后我们在demo目录下执行：

```shell
composer require illuminate/database:~4.2
```

那么你应该会看到：

```shell
Using version ~4.2 for illuminate/database
./composer.json has been created
Loading composer repositories with package information
Updating dependencies (including require-dev)
  - Installing nesbot/carbon (1.13.0)
    Loading from cache

  - Installing illuminate/support (v4.2.9)
    Downloading: 100%
    Downloading: 100%
    Downloading: 100%

    Failed, trying the next URL
    Downloading: 100%

  - Installing illuminate/container (v4.2.9)
    Downloading: 100%

  - Installing illuminate/events (v4.2.9)
    Downloading: 100%

  - Installing illuminate/database (v4.2.9)
    Downloading: 100%

Writing lock file
Generating autoload files
```

这样就表示Eloquent已经安装好了。


## 配置

下面我们来配置Eloquent。

1. 首先我们创建一个入口文件，如果你的项目已经有内容，那么同理在你的项目入口文件加入即可：

demo/start.php:

```php?start_inline=1
<?php

// 载入composer的autoload文件
include __DIR__ . '/vendor/autoload.php';
```
然后我们加入数据库配置：

```php?start_inline=1
$database = [
    'driver'    => 'mysql',
    'host'      => 'localhost',
    'database'  => 'demo',
    'username'  => 'root',
    'password'  => '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
];
```

上面我们的数据库配置，库名`demo`,用户名`root`,密码为空,这个`demo`是我在mysql里建立好的空数据库。


然后我们加入Eloquent初始化代码：

```php?start_inline=1
use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;

// 创建链接
$capsule->addConnection($database);

// 设置全局静态可访问
$capsule->setAsGlobal();

// 启动Eloquent
$capsule->bootEloquent();

```

那么Eloquent就配置完成了。

最终的文件`demo/start.php`应该是这样：

demo/start.php:

```php?start_inline=1
<?php

// 载入composer的autoload文件
include __DIR__ . '/vendor/autoload.php';

$database = [
    'driver'    => 'mysql',
    'host'      => 'localhost',
    'database'  => 'demo',
    'username'  => 'root',
    'password'  => '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
];

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager as Capsule;//如果你不喜欢这个名称，as DB;就好

$capsule = new Capsule;

// 创建链接
$capsule->addConnection($database);

// 设置全局静态可访问
$capsule->setAsGlobal();

// 启动Eloquent
$capsule->bootEloquent();
```

那么现在只要你需要使用到Eloquent的地方载入这个文件即可， 下面我们来简单介绍一下使用。

## 建表

配置完成了，我们再来使用Eloquent的结构生成器创建数据库的表：

demo/table.php

```php?start_inline=1
<?php

//包含Eloquent的初始化文件
include __DIR__ . '/start.php';

use Illuminate\Database\Capsule\Manager as Capsule;

Capsule::schema()->create('users', function($table)
{
    $table->increments('id');
    $table->string('username', 40);
    $table->string('email')->unique();
    $table->timestamps();
});
```

然后我们运行table.php，两种方式：浏览器打开，或者命令行运行：
```shell
php table.php
```

然后我们的查看MySQL数据库`domo`里就会有一个`users`表了:

![demo-db]({{ site.url }}/attachments/images/db-demo.png)

##  写入数据

表建立好了，然后我们插入数据，我们同样创建一个文件 `demo/insert.php`来做实验：


```php?start_inline=1
<?php

//包含Eloquent的初始化文件
include __DIR__ . '/start.php';

use Illuminate\Database\Capsule\Manager as Capsule;

Capsule::table('users')->insert(array(
        array('username' => 'Hello',  'email' => 'hello@world.com'),
        array('username' => 'Carlos',  'email' => 'anzhengchao@gmail.com'),
        array('username' => 'Overtrue',  'email' => 'i@overtrue.me'),
    ));


```

我们写入了3条数据。

## 使用模型

只要你的模型继承Eloquent的Model类，就没问题了：

```php?start_inline=1

use  Illuminate\Database\Eloquent\Model  as Eloquent;

class User extends  Eloquent
{
	protected $table = 'users';
}

```

那么你就可以很方便的像在Laravel框架里一样使用Eloquent了：

```php?start_inline=1
// 查询id为2的
$users = User::find(2);

// 查询全部
$users = User::all();

// 创建数据
$user = new User;
$user->username = 'someone';
$user->email = 'some@overtrue.me';
$user->save();

// ... 更多

```

OK，这基本上就搞定了，当然，你用分页的时候会出问题，我们下一节再讲。

为了给大家一个完整的示例，我这里使用[Slim](https://github.com/codeguy/slim)结合Eloquent做了一个实例：[overtrue/rester](https://github.com/overtrue/rester)

[《在Laravel外使用Eloquent（二）- 分页问题》](/2014/11/25/using-eloquent-outside-laravel-2.html)

更多关于Eloquent的使用请参考: [http://v4.golaravel.com/docs/4.1/eloquent](http://v4.golaravel.com/docs/4.1/eloquent)

## 有用的链接
- [Laravel官网](http://laravel.com)
- [Laravel中文网](http://golaravel.com)
