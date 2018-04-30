---
layout: post
title: sudo -Hu 执行时找不到命令的问题解决
excerpt: 在 centos 系统下 `sudo -Hu` 执行时找不到命令的问题解决办法
---

虽然在 `/etc/profile` 中加了全局 `PATH`，但是在以 `sudo -Hu [username] [command]` 执行的时候报命令不存在，原因是 `/etc/sudoers` 中还有一个 `secure_path` 没修改：

```shell
visudo
```

查找 `secure_path`，加入你要添加的目录，比如 `/usr/local/bin`:

```shell
Defaults    secure_path = /sbin:/bin:/usr/sbin:/usr/bin
```

改为：

```shell
Defaults    secure_path = /sbin:/bin:/usr/sbin:/usr/bin:/usr/local/bin
```

即可。