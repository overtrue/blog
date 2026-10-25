---
layout: post
title: 处理 Laravel 5 默认事件
excerpt: Laravel 提供了很多默认事件，登录登出、数据库连接与查询、应用启动前后、缓存等等很多默认事件，本篇以用户登录事件来演示如何处理 Larvel 5 的默认事件。
---

Laravel 提供了很多默认事件，登录登出、数据库连接与查询、应用启动前后、缓存等等很多默认事件，本篇以用户登录事件来演示如何处理 Larvel 5 的默认事件。

我们的目的：**处理用户登录事件，在用户登录的时候给用户添加最后登录时间(`last_login_at`)，以及最后登录的IP(`last_ip`)**

用户的登录事件在 Laravel 5 里的事件名称是 `auth.login`。

### 第一步：创建事件处理器

Laravel 5 里直接使用命令即可创建一个事件处理器:

```php?start_inline=1
php artisan handler:event AuthLoginEventHandler
```

`AuthLoginEventHandler` 是我们定义的名称，你可以随意命名(合理的)，它会创建 `app/Handlers/Events/AuthLoginEventHandler.php`:

```php?start_inline=1
<?php namespace App\Handlers\Events;

use Illuminate\Contracts\Queue\ShouldBeQueued;
use Illuminate\Queue\InteractsWithQueue;

class AuthLoginEventHandler {

    /**
     * Create the event handler.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  Events  $event
     * @return void
     */
    public function handle(Event $event)
    {
        //
    }
}
```

### 第二步：注册监听

打开 `app/Providers/EventServiceProvider.php`，将我们的监听添加上:

```php?start_inline=1
protected $listen = [
    'auth.login' => [
        'App\Handlers\Events\AuthLoginEventHandler',
    ],
];
```

### 第三步：添加逻辑代码

我们的需求是：在用户登录的时候给用户添加最后登录时间(`last_login_at`)，以及最后登录的IP(`last_ip`)。
> 注意：这两个字段是我自己创建的
当然，这里只是举例，你可以在这里完成所有你想要的需求。

> 注意：框架默认的事件触发时的参数都可能不同，具体请查看框架源码或者参阅相关文档。
> 小窍门：使用 关键字 `fire('` 在框架目录中搜索，可以得到大部分的框架事件的调用处。

这里 `auth.login` 事件框架会传递两个参数：`用户实例`, `是否记住登录`，所以我们修改我们刚刚创建的 `AuthLoginEventHandler.php` 中的 `handle` 方法：

```php?start_inline=1
    /**
     * 处理用户登录
     *
     * @param User    $user     用户
     * @param boolean $remember 是否记住登录
     *
     * @return void
     */
    public function handle(User $user, $remember)
    {
        $user->last_login_at = Carbon::now();
        $user->last_ip = $this->request->ip();

        //TODO:其它动作，比如增加积分等等。

        $user->save();
    }
```

可以看到上面我们用到了 `Illuminate\Http\Request` 对象，所以我们还需要添加一个属性 `protected $request`，然后从构造方法 `__construct` 让框架注入进来（由框架完成注入）：

```php?start_inline=1
    ...

    /**
     * Request 对象
     *
     * @var Illuminate\Http\Request
     */
    protected $request;

    /**
     * Create the event handler.
     *
     * @return void
     */
    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    ...
```

我们所有用到的类请记得引入。最后完整的 `AuthLoginEventHandler.php` 如下：

```php?start_inline=1
<?php namespace App\Handlers\Events;

use Illuminate\Contracts\Queue\ShouldBeQueued;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Http\Request;
use App\Models\User;
use Carbon\Carbon;

class AuthLoginEventHandler {

    /**
     * Request 对象
     *
     * @var Illuminate\Http\Request
     */
    protected $request;

    /**
     * Create the event handler.
     *
     * @return void
     */
    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    /**
     * 处理用户登录
     *
     * @param User    $user     用户
     * @param boolean $remember 是否记住登录
     *
     * @return void
     */
    public function handle(User $user, $remember)
    {
        $user->last_login_at = Carbon::now();
        $user->last_ip = $this->request->ip();

        //TODO:其它动作，比如增加积分等等。

        $user->save();
    }
}
```

然后在用户登录的时候就会自动给用户字段 `last_login_at` 和 `last_ip` 补充内容了。是不是很方便呢？