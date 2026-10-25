---
layout: post
title: centos 编译安装最新版 Git
excerpt: 在 centos 系统下编译安装 Git 的最新版本笔记
---

## 安装依赖包

```shell
yum -y install zlib-devel curl-devel openssl-devel perl cpio expat-devel gettext-devel openssl zlib autoconf tk perl-ExtUtils-MakeMaker
```

## 获取最新版 Git 源码包

从 https://github.com/git/git/releases 下载最新版的 zip 包或者 tar.gz 并解压：

以 tar.gz 格式为例（在网页的 tar.gz 上右键复制下载链接即可）：

```shell
wget https://github.com/git/git/archive/v2.4.0.tar.gz
tar zxvf v2.4.0.tar.gz
```

会得到一个 `git-2.4.0` 的目录（版本号与下载的一致），然后进入这个目录：

```shell
cd git-2.4.0
```

## 编译安装

```shell
autoconf
./configure
make
make install
```

> 以上4步请一步步来，以免出现错误不好找原因。

然后修改 `/etc/ld.so.conf` 文件，在最后加入一行：

```shell
/usr/local/lib
```

保存并关闭。

这就安装好了，看看版本：

```shell
git --version
# git version 2.4.0
```

## 错误处理

如果安装后报以下错误：

```shell
bash: /usr/bin/git: 没有那个文件或目录
```

那么请编辑 `/etc/profile` 在最后加入一行：

```shell
export PATH=$PATH:/usr/local/bin
```

然后重新开窗口就好了，或者执行命令 `source /etc/profile` 后就好了。