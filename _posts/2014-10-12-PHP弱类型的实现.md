---
layout: post
title: PHP的弱类型实现
excerpt: PHP中的弱类型变量的实现原理。
---

PHP是弱类型，动态的语言脚本。在申明一个变量的时候，并不需要指明它保存的数据类型。例如：

```php
<?php  
$var = 1;  
$var = "variable";  
$var = 1.00;  
$var = array();  
$var = new Object();  
```

动态变量，在运行期间是可以改变的，并且在使用前无需声明变量类型。

**问题一、Zend引擎是如何用C实现这种弱类型的呢？**

实际上，在PHP中声明的变量，在ZE中都是用结构体zval来保存的。
首先我们打开Zend/zend.h来看zval的定义：

```c
typedef struct _zval_struct zval;  
  
struct _zval_struct {  
    /* Variable information */  
    zvalue_value value;     /* value */  
    zend_uint refcount__gc;  
    zend_uchar type;    /* active type */  
    zend_uchar is_ref__gc;  
};  
  
typedef union _zvalue_value {  
    long lval;  /* long value */  
    double dval;    /* double value */  
    struct {  
        char *val;  
        int len;  
    } str;  
    HashTable *ht;  /* hash table value */  
    zend_object_value obj;  
} zvalue_value;  
```
Zend/zend_types.h：

```c
typedef unsigned char zend_bool;  
typedef unsigned char zend_uchar;  
typedef unsigned int zend_uint;  
typedef unsigned long zend_ulong;  
typedef unsigned short zend_ushort;  
```
从上述代码中，可以看到`_zvalue_value`是真正保存数据的关键部分。通过共用体实现的弱类型变量声明

**问题二、Zend引擎是如何判别、存储PHP中的多种数据类型的呢？**

`_zval_struct.type`中存储着一个变量的真正类型，根据`type`来选择如何获取`zvalue_value`的值。

type值列表(Zend/zend.h)：  

```c
#define IS_NULL     0  
#define IS_LONG     1  
#define IS_DOUBLE   2  
#define IS_BOOL     3  
#define IS_ARRAY    4  
#define IS_OBJECT   5  
#define IS_STRING   6  
#define IS_RESOURCE 7  
#define IS_CONSTANT 8  
#define IS_CONSTANT_ARRAY   9  
```
来看一个简单的例子：

```php 
<?php  
$a = 1;  
//此时zval.type = IS_LONG,那么zval.value就去取lval.  
$a = array();  
//此时zval.type = IS_ARRAY,那么zval.value就去取ht.  
```
这其中最复杂的，并且在开发第三方扩展中经常需要用到的是"资源类型".
在PHP中，任何不属于PHP的内建的变量类型的变量，都会被看作资源来进行保存。
比如：数据库句柄、打开的文件句柄、打开的socket句柄。

资源类型，会用`lval`，此时它是一个整型指示器， 然后PHP会再根据这个指示器在PHP内建的一个资源列表中查询相对应的资源。

正是因为ZE这样的处理方式，使PHP就实现了弱类型，而对于ZE的来说，它所面对的永远都是同一种类型zval。

转自：http://allensuiverson.blog.163.com/blog/static/13364826920131013103226827/
