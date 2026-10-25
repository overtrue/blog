---
layout: post
title: Laravel 获取当前控制器名称或方法
excerpt: 在 Laravel 项目中获取当前被调用的控制器名称和方法
---

我们有时候需要获取当前 Laravel 项目的控制器或者方法名，框架默认是不会提供单独的方法的，框架只提供了如下的方法：

```php?start_inline=1
\Route::current()->getActionName();
```

返回的结果是：

```php?start_inline=1
App\Http\Controllers\WelcomeController@index
```

可是这不是我们想要的，我们只想获取控制器名或者方法名，那么，你可以自定义下面三个函数来实现：

```php?start_inline=1
/**
 * 获取当前控制器名
 *
 * @return string
 */
public function getCurrentControllerName()
{
    return getCurrentAction()['controller'];
}

/**
 * 获取当前方法名
 *
 * @return string
 */
public function getCurrentMethodName()
{
    return getCurrentAction()['method'];
}

/**
 * 获取当前控制器与方法
 *
 * @return array
 */
public function getCurrentAction()
{
    $action = \Route::current()->getActionName();
    list($class, $method) = explode('@', $action);

    return ['controller' => $class, 'method' => $method];
}
```

另外推荐近期完成的两个 Laravel 拓展包：

- [overtrue/laravel-lang](https://github.com/overtrue/laravel-lang) 基于 [Laravel4-lang](https://github.com/caouecs/Laravel4-lang) 的 44 语种语言文件
- [overtrue/laravel-pinyin](https://github.com/overtrue/laravel-pinyin) Laravel 中文转拼音， 基于 [overtrue/pinyin](https://github.com/overtrue/pinyin)
