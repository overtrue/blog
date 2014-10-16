---
layout: post
title: GitHub windows客户端报https错误解决办法
excerpt: GitHub windows客户端报Protocol https not supported or disabled in libcurl问题解决方法
url: github-windows-https-error
---

今天上午在家里的台式机上更新GitHub客户端后发现无法clone了，后来打开git shell 去clone，发现报错如下：
```
XXXXXX,Protocol https not supported or disabled in libcurl
```

网上找了半天终于找到一个SourceTree同样问题的解决方法，应该是win7  64位自带的"libcurl.dll"，对于https的某些限制导致的。搜索GitHub安装目录的libcurl.dll：
```
C:\Users\你的用户名\AppData\Local\GitHub\PortableGit_7eaa994416ae7b397b2628033ac45f8ff6ac2010\bin
```

然后拷贝到`C:\Windows\SysWOW64`下面就解决问题了。
