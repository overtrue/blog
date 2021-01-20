---
layout: post
title: 一种 Laravel 异常上下文解决方案
excerpt: 异常时我们通常希望在用户测给一个友好的提示，但默认使用框架的异常处理方案是不 OK 的。
---

最近项目遇到一个情况，我们在遇到用户访问某个信息没有权限的时候，希望提示详细的原因，比如当访问一个团队资源时非成员访问的场景下会提示一个：`您不是 [xxxxxx] 团队的成员，暂时无法查看，可<申请加入>`，同时需要显示打码后的团队名称，以及加入按钮，可是接口方的逻辑是当没有权限时直接 `abort` 了：

```php
abort_if(!$user->isMember($resouce->team), 403, '您无权访问该资源');
```

得到的响应结果如下：

```json
HTTP/1.0 403 Forbidden

{
	"message": "您无权访问该资源"
}
```

我们不肯能将 message 用 html 来完成前端提示页的展示，这样耦合性太强，违背了前后端分离的原则。我们的目标是返回如下的格式即可解决：

```json
HTTP/1.0 403 Forbidden

{
	"message": "您无权访问该资源",
	"team": {
		"id": "abxT8sioa0Ms",
		"name": "CoDesign****"
	}
}
```

通过携带上下文的方法传递数据，方便了前端同学自由组合。

## 开始改造

当然这并不是什么复杂的事情，直接修改原来的 `abort_if` 即可解决：

```diff
- abort_if(!$user->isMember($resouce->team), 403, '您无权访问该资源');
+ if (!$user->isMember($resouce->team)) {
+	return response()->json([
+		'message' => '您无权访问该资源',
+		'team' => [
+			'id' => $resouce->team_id,
+			'name'=> $resouce->team->desensitised_name,
+		]
+	], 403);
+ }
```

这样看起来解决了问题，可是试想一下，如果是在闭包里面检测到异常想要退出，上面这种 `return` 式的写法就会比较难搞了，毕竟 `return` 只会终止最近的上下文环境，我们还是希望像 `abort` 一样能终止整个应用的执行，再进行另一番改造。

## 优化实现

看了 `abort` 源码，我发现它的第一个参数其实支持 `\Symfony\Component\HttpFoundation\Response` 实例，而上面👆我们 `return` 的结果就是它的实例，所以我们只需要改成这样就可以了：

```php
 if (!$user->isMember($resouce->team)) {
	abort(response()->json([
		'message' => '您无权访问该资源',
		'team' => [
			'id' => $resouce->team_id,
			'name'=> $resouce->team->desensitised_name,
		]
	], 403));
 }
```

新的问题来了，如果需要复用的时候还是比较尴尬，这段代码将会重复出现在各种有此权限判断的地方，这并不是我们想要的。

## 逻辑复用

为了达到逻辑复用，我认证看了 `\App\Exceptions\Handler` 的实现，发现父类的 `render` 方法还有这么一个设计：

```php
public function render($request, Throwable $e)
{
    if (method_exists($e, 'render') && $response = $e->render($request)) {
        return Router::toResponse($request, $response);
    } elseif ($e instanceof Responsable) {
        return $e->toResponse($request);
    }

    //...
```

所以，我们可以将这个逻辑抽离为一个独立的异常类，实现 render 方法即可：

```bash
$ ./artisan make:exception NotTeamMemberException
```

代码如下：

```php
<?php

namespace App\Exceptions;

use App\Team;

class NotTeamMemberException extends \Exception
{
    public Team $team;

    public function __construct(Team $team, $message = "")
    {
        $this->team = $team;
        parent::__construct($message, 403);
    }

    public function render()
    {
        return response()->json(
            [
                'message' => !empty($this->message) ? $this->message : '您无权访问该资源',
                'team' => [
                    'id' => $this->team->id,
                    'name' => $this->team->desensitised_name,
                ],
            ],
            403
        );
    }
}

```

这样一来，我们的逻辑就变成了：

```php
if (!$user->isMember($resouce->team)) {
 	throw new NotTeamMemberException($resouce->team, '您无权访问该资源');
}
```

当然也可以简化为：

```php
\throw_if(!$user->isMember($resouce->team), NotTeamMemberException::class, $resouce->team, '您无权访问该资源');
```

问题到这里总算以一个比较完美的方式解决了，如果你有更好的方案欢迎评论探讨。

