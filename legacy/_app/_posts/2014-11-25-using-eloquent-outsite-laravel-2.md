---
layout: post
title: 在 Laravel 外使用 Eloquent（二）- 分页问题
excerpt: 在 Laravel 外使用 Eloquent 时分页问题的处理
---

在上一篇[《在Laravel外使用Eloquent（一）》](/2014/10/30/using-eloquent-outside-laravel.html) 中我们演示了如何引入Eloquent以及基本使用，但是如果细心的朋友肯定会发现，当你在使用paginate(15)来分页的时候是会报错的。因为我们没有依赖laravel的pagination模块。但是引入那个模块同时它内部依赖了symfony的http-foundation模块，意味着为了一个分页功能我们要装好多东西。于是我就实现了一个比较简单的分页类：

代码见：[https://github.com/overtrue/rester](https://github.com/overtrue/rester)

```php?start_inline=1
<?php

namespace Rester;

/**
 * Paginator.php
 *
 * (c) 2014 overtrue <anzhengchao@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author overtrue <anzhengchao@gmail.com>
 * @github https://github.com/overtrue
 * @url    http://overtrue.me
 * @date   2014-10-23T20:05:33
 */

use Closure;
use Countable;
use ArrayAccess;
use Serializable;
use ArrayIterator;
use JsonSerializable;
use IteratorAggregate;

class Paginator implements
    ArrayAccess,
    Countable,
    IteratorAggregate,
    Serializable,
    JsonSerializable
{
    protected $pager;
    protected $pageSize;
    protected $total;
    protected $items;

    /**
     * Constructor
     *
     * @param \Slim\Http\Request $request
     * @param string             $pager
     */
    public function __construct($pager = 'page')
    {
        $this->pager = $pager;
    }

    /**
     * Make a pagination
     *
     * @param array   $items
     * @param integer $total
     * @param integer $pageSize
     *
     * @return array
     */
    public function make($items, $total, $pageSize = 10)
    {
        $this->total    = abs($total);
        $this->pageSize = $pageSize;
        $this->items = $items;

        return $this;
    }

    /**
     * Return current page
     *
     * @return integer
     */
    public function getCurrentPage($total = null)
    {
        $page = abs(app()->request->get('page', 1));

        if ($total) {
            $this->total = $total;
        }

        $page >= 1 || $page = 1;

        if ($this->items) {
            $totalPage = $this->getTotalPage();
            $page <= $totalPage || $page = $totalPage;
        }

        return $page;
    }

    /**
     * Return total pages
     *
     * @return integer
     */
    public function getTotalPage()
    {
        $this->pageSize > 0 || $this->pageSize = 10;

        $totalPage = ceil($this->total / $this->pageSize);

        $totalPage >= 1 || $totalPage = 1;

        return $totalPage;
    }

    public function links()
    {
        $html = '<ul class="pagination">';

        $totalPage   = $this->getTotalPage();
        $currentPage = $this->getCurrentPage();

        if ($totalPage < 10) {
            for ($i = 1; $i <= $totalPage; $i++) {
                $active = $i == $currentPage ? 'class="active"':'';
                $html .= "<li $active><a href=".$this->getLink($i).">$i</a></li>";
            }
        } else {

            if ($currentPage > 3) {
                $html .= "<li><a href=".$this->getLink(1).">&laquo;</a></li>";
                $start = $currentPage - 2;
            } else {
                $start = 1;
            }

            for ($i = $start; $i <= $currentPage; $i++) {
                $active = $i == $currentPage ? 'class="active"':'';
                $html .= "<li $active><a href=".$this->getLink($i).">$i</a></li>";
            }

            for ($i = $currentPage + 1; $i <= $currentPage + 3; $i++) {
                $active = $i == $currentPage ? 'class="active"':'';
                $html .= "<li $active><a href=".$this->getLink($i).">$i</a></li>";
            }

            if ($totalPage - $currentPage >= 5) {
                $html .= "<li><a href='javascript:void(0)'>...</a></li>";
                $html .= "<li><a href=".$this->getLink($totalPage).">$totalPage</a></li>";
            }
        }

        return $html .= '</ul>';
    }

    /**
     * getLink
     *
     * @param integer $page
     *
     * @return string
     */
    public function getLink($page)
    {
        static $query;

        if (is_null($query)) {
            $query = app()->request->get();
        }

        $query['page'] = $page;

        return "?" . http_build_query($query);
    }

     /** {@inhertDoc} */
    public function jsonSerialize()
    {
        return $this->items;
    }

    /** {@inhertDoc} */
    public function serialize()
    {
        return serialize($this->items);
    }

    /** {@inhertDoc} */
    public function unserialize($data)
    {
        return $this->items = unserialize($data);
    }

    /** {@inhertDoc} **/
    public function getIterator()
    {
        return new ArrayIterator($this->items);
    }

    /** {@inhertDoc} */
    public function count($mode = COUNT_NORMAL)
    {
        return count($this->items, $mode);
    }

    /**
     * Get a data by key
     *
     * @param string $key
     *
     * @return mixed
     */
    public function __get($key) {
        return $this[$key];
    }

    /**
     * Assigns a value to the specified data
     *
     * @param string $key
     * @param mixed  $value
     *
     * @return void
     */
    public function __set($key, $value)
    {
        $this->items[$key] = $value;
    }

    /**
     * Whether or not an data exists by key
     *
     * @param string $key
     *
     * @return bool
     */
    public function __isset($key)
    {
        return isset($this->items[$key]);
    }

    /**
     * Unsets an data by key
     *
     * @param string $key
     */
    public function __unset($key)
    {
        unset($this->items[$key]);
    }

    /**
     * Assigns a value to the specified offset
     *
     * @param string $offset
     * @param mixed  $value
     *
     * @return void
     */
    public function offsetSet($offset, $value)
    {
        $this->items[$offset] = $value;
    }

    /**
     * Whether or not an offset exists
     *
     * @param string $offset
     *
     * @access public
     *
     * @return bool
     */
    public function offsetExists($offset)
    {
        return isset($this->items[$offset]);
    }

    /**
     * Unsets an offset
     *
     * @param string $offset
     *
     * @return array
     */
    public function offsetUnset($offset)
    {
        if ($this->offsetExists($offset)) {
            unset($this->items[$offset]);
        }
    }

    /**
     * Returns the value at specified offset
     *
     * @param string $offset
     *
     * @return mixed
     */
    public function offsetGet($offset)
    {
        return $this->offsetExists($offset) ? array_get($this->items, $offset) : null;
    }
}
```

然后在我们初始化eloquent的方装载这个分页类到eloquent中就好：

```php?start_inline=1
//...
use Rester\Paginator;

// 注册分页类
Capsule::setPaginator(function() use ($app, $config) {
    return new Paginator($app->request, $config->get('pager', 'page'));
});

//...
```
完整的eloquent初始化步骤请参考：

https://github.com/overtrue/rester/blob/master/start/eloquent.php


然后我们就可以正常使用分页功能了：

```php?start_inline=1
$users = User::paginate(15);
$users = User::where('status', 1)->paginate(15);
...
```

因为上面的分页类实现了常用的[预定义接口](http://php.net/manual/zh/reserved.interfaces.php), 所以你可以很方便的使用分页结果：

```php?start_inline=1
// 遍历
foreach ($users as $user) {
    // do sth.
}

// json encode
$json = json_encode($users);

// count
$count = count($users);

//...
```
另外还考虑到了大家不一定全用它写接口用，所以分页类同样实现了Laravel里的生成分页链接的方法：`$users->links()`, 它会生成bootstrap格式的分页列表：

```html
<ul class="pagination">
    <li><a href="#">&laquo;</a></li>
    <li><a href="#">1</a></li>
    <li><a href="#">2</a></li>
    <li><a href="#">3</a></li>
    <li><a href="#">4</a></li>
    <li><a href="#">5</a></li>
    <li><a href="#">&raquo;</a></li>
</ul>
```
demo:

```php?start_inline=1
<div class="container">
    <?php foreach ($users as $user): ?>
        <?php echo $user->name; ?>
    <?php endforeach; ?>
</div>

<?php echo $users->links(); ?>
```

OK,那么现在你就可以很方便的在你的项目里无忧的使用Eloquent啦。
