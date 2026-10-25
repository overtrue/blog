---
layout: post
title: Laravel 中如何更方便的修改 Passport Personal Access Token 过期时间
---

认真看过 [Laravel Passport 文档](https://laravel.com/docs/5.7/passport#configuration) 的人应该知道，它的 Personal Access Token 是不支持自定义过期时间的，`tokensExpireIn` 对此类 token 无效，原文如下：

> Personal access tokens are always long-lived. Their lifetime is not modified when using the tokensExpireIn or refreshTokensExpireIn methods.

默认时间为 1 年，但是这可能不满足我们的需求，我们想要改成其它更短的时间怎么办呢？今天尝试了一下，应该算是全网可以找到的最简单方法了，直接在 `app/Providers/AppServiceProvider` 中添加一句就可以搞定，下面以改为有效期为 1 周的示例来演示：

*app/Providers/AppServiceProvider.php*
```php
<?php
//...
use Laravel\Passport\Bridge\PersonalAccessGrant;
use League\OAuth2\Server\AuthorizationServer;
//...

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        $this->app->get(AuthorizationServer::class)
              ->enableGrantType(new PersonalAccessGrant(), new \DateInterval('P1W'));
    }
   
    //...
}
//...
```

关于时间值的写法，请参考:
> https://secure.php.net/manual/en/dateinterval.construct.php
