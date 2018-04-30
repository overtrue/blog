---
layout: post
title: 我所理解的 PHP Trait
excerpt: 以我的解理来描述 PHP 5.4 加入的 Trait 语法。
---

[Trait](http://php.net/manual/zh/language.oop5.traits.php) 是从 PHP 5.4 加入的一种细粒度代码复用的语法。以下是官方手册对 Trait 的描述：

> Trait 是为类似 PHP 的单继承语言而准备的一种代码复用机制。Trait 为了减少单继承语言的限制，使开发人员能够自由地在不同层次结构内独立的类中复用 method。Trait 和 Class 组合的语义定义了一种减少复杂性的方式，避免传统多继承和 Mixin 类相关典型问题。
>
> Trait 和 Class 相似，但仅仅旨在用细粒度和一致的方式来组合功能。 无法通过 trait 自身来实例化。它为传统继承增加了水平特性的组合；也就是说，应用的几个 Class 之间不需要继承。

## 什么是 Trait ?

其实说通俗一点，就是能把重复的**方法**拆分到一个文件，通过 `use`  引入以达到代码复用的目的。

那么，我们应该怎么样去拆分我们的代码才是合适的呢？我的看法是这样的：

Trait，译作 **“特性”、“特征”、“特点”** 。那么问题就来了：什么才是特性？

一个销售公司有很多种产品：电视，电脑与鼠标垫，卡通手办等。其中鼠标垫与卡通手办是非卖品，只用于赠送。

那么这里的 “可卖性” 就是一个特性，非卖品是没有价格的。我们便可以抽象出 “可卖性”  这个 Trait 来：

```php?start_inline=1
trait Sellable
{
    protected $price = 0;

    public function getPrice()
    {
        return $this->price;
    }

    public function setPrice(int $price)
    {
        $this->price = $price;
    }
}
```

当然我们所有的产品都会有品牌与其它基本属性，所以我们通常会定义一个产品类：

```php?start_inline=1
class Pruduct
{
    protected $brand;
    //...

    public function __construct($brand)
    {
        $this->brand = $brand;
    }

    public function getBrand()
    {
        return $this->brand;
    }

    //...
}
```

我们的电视与电脑类：

```php?start_inline=1
class TV extends Pruduct
{
    use Sellable;
    //...

    public function play()
    {
        echo "一台 {$this->brand} 电视在播放中...";
    }

    //...
}

class Computer extends Pruduct
{
    use Sellable;

    protected $cores = 8;
    //...

    public function getNumberOfCores()
    {
        return $this->cores;
    }

    //...
}
```

而鼠标垫与手办等礼品是不可卖的：

```php?start_inline=1
class Gift extends Pruduct
{
    protected $name;

    function __construct($brand, $name)
    {
        parent::__construct($brand);
        $this->name = $name;
    }

    //...
}
```

上面的这个例子中，“可卖性” 便是部分商品的一个特性，也可以理解为商品的一个归类。你也许会说，我也可以再添加一个 Goods 类来完成上面的例子啊，Goods 继承 Product，再让所有可卖的商品继承于 Goods 类，把价格属性与方法写到 Goods 里，同样可以代码复用啊。的确，这没啥问题。但是你会发现：你有多个需要区别的特性时，由于 PHP 只有单继承的原因，你不得不组合很多个基类出来，将他们层叠，最终得到的树状结构是很复杂的。这也是 Trait 所带来的优势：随意组合，代码清晰。


其实还有很多例子，比如**可飞行的**，那么把飞行这个特性所具有的属性（如：高度，距离）与方法（如：起飞，降落）放到一个 trait 就是一个合理的拆分。


## Trait 有什么优势 ?

trait 有什么优势？来看一段代码：



```php?start_inline=1
class User extends Model
{
    use Authenticate, SoftDeletes, Arrayable, Cacheable;

    ...
}
```

这个用户模型类，我们引入了四个特性：注册与授权、软删除、数组式操作、可缓存。

我们看到代码的时候一眼便知道当前支持了哪些个特性。再看下面另外一种写法：

```php?start_inline=1
abstract AdvansedUser {
  // ... 实现了 Authenticate, SoftDeletes, Arrayable, Cacheable 的所有方法
}
class User extends AdvansedUser
{
    ...
}
```

你不得不再去阅读 `AdvansedUser` 的代码才能理解。你想说没有可读性是因为我基类的名称没起好？可是，这种各种特性组合的一个基类是根本无法起一个见名知义的名称的，不信你可以试一下。

就算你真的起了一个见名知义的名称：`AuthenticateCacheableAndArrayableSoftDeletesUser`，可是当需求变更，要求在 `FooUser`（同样继承了这个基类） 中去除缓存特性，而 `User` 类保留这个特性，怎么办？再创建一个基类么？



这就是我理解的 Trait：

**它不仅仅是可复用代码段的集合，它应该是一组描述了某个特性的的属性与方法的集合。它的优点在于随意组合，耦合性低，可读性高。**

平常写代码的时候也许怎么拆分才是大家的痛点，分享以下几个技巧：

- 从需求或功能描述拆分，而不是写了两段代码发现代码一样就提到一起；
- 拆分时某些属性也一起带走，比如上面第一个例子里的价格，它是“可卖性”必备的属性；
- 拆分时如果给 Trait 起名困难时，请认真思考你是否真的拆分对了，因为正确的拆分是很容易描述 “它是一个具有什么功能的特性” 的；




总之一定要记住：不要为了让两段相同的代码提到一起这样简单粗暴的方式来拆分。



以上是个人见解，欢迎各位讨论。​:smile:​