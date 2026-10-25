---
layout: post
title: 全局 exception handler 的黑科技用法
excerpt: 在 PHP 全局异常处理器注册函数 set_exception_handler 注册一个新的 handler 之前备份前一个 handler， 并调用它来处理非自己业务的异常
---

今天在写 [overtrue/wechat 3.0](https://github.com/overtrue/wechat/tree/3.0) 的时候，考虑到用户 debug 的问题。期望把日志包括产生的异常日志都记到用户配置的日志文件里。

因为代码在不同的组件，不可能用 `try...catch`。我打算使用 [set_exception_handler](http://php.net/manual/en/function.set-exception-handler.php) 注册一个全局异常处理器来做这事儿，但是，我这个只是一个开源组件，可能会被用户用到各种各样的环境中，所以，不能破坏原有框架或者用户自己定义的异常处理器，因为 `set_exception_handler` 会覆盖前面设置的，所以问题就卡住了。

然后我找到了 [restore_exception_handler](http://php.net/manual/en/function.restore-exception-handler.php)，以为找到了救命稻草，于是我把代码改成如下：

```php?start_inline=1
<?php

class MyException extends Exception {}

set_exception_handler(function(Exception $e){
    echo "Old handler:".$e->getMessage();
});

set_exception_handler(function(Exception $e) {
    if ($e instanceof MyException) {
        echo "New handler:".$e->getMessage();
        return;
    }

    restore_exception_handler(); // 还原之前的设定然后下面再抛出

    throw $e;
});

// throw new MyException("Exception two", 1);
throw new Exception("Exception two", 1);
```
然后就报错了...

```
PHP Fatal error:  Cannot destroy active lambda function in /Users/overtrue/www/foo.php on line 15
```

于是 google, stackoverflow... 都无解。

后来又仔细研究了文档，终于，我发现了：

> Returns the name of the previously defined exception handler, or NULL on error. If no previous handler was defined, NULL is also returned.

于是此问题得以圆满解决，虽然恢复原有的 handler 是不可能了，但是达到同样的效果就 OK 了。

```php?start_inline=1
<?php

class MyException extends Exception {}

set_exception_handler(function(Exception $e){
    echo "Old handler:".$e->getMessage();
});

$lastHandler = set_exception_handler(function(Exception $e) use (&$lastHandler) {
    if ($e instanceof MyException) {
        echo "New handler:".$e->getMessage();
        return;
    }

    if (is_callable($lastHandler)) {
        return call_user_func_array($lastHandler, [$e]);
    }
});

// throw new MyException("Exception two", 1);
throw new Exception("Exception two", 1);
```
利用 PHP 的引用，把 `$lastHandler` 引用到闭包里，这样毕竟 `set_exception_handler` 会比闭包先运行，所以就会把前一个 `handler` 拿到了，然后异常的时候，发现不是我的 `MyException` 就直接调用原来的 handler 来处理就好了。

然后我去回答了我之前搜索到没有答案的两个问题：

- [Cannot destroy active lambda function](http://stackoverflow.com/questions/14411492/cannot-destroy-active-lambda-function/34181805#34181805)
- [How can I retrieve the current error handler?](http://stackoverflow.com/questions/12378644/how-can-i-retrieve-the-current-error-handler)

希望有此想法的同学能得到帮助。 :smile:
