---
layout: post
excerpt: Mac下配置zsh与oh-my-zsh笔记
---

之前在看jeffway的laravel教程的时候发现他演示用的终端特别漂亮，有一个云朵一样的标志，然后就一直找不到是怎么弄的，好在今天在GitHub上看到了[zsh](https://github.com/zsh-users/zsh)(不过打开页面的时候我已经发现我star过了... :see_no_evil: )

## 将bash切换为zsh
```shell
chsh -s /bin/zsh
```

其实还可以用which来定位（特别是ubuntu的童鞋）

```shell
chsh -s `which zsh`
```

直接用zsh会很蛋疼，因为zsh功能很强大但是太复杂，所以需要oh-my-zsh来将它简单化。如果要切换回bash：

```shell
chsh -s /bin/bash
```

### 下载oh-my-zsh
1. 直接用git从github上面下载包：

```shell
git clone git://github.com/robbyrussell/oh-my-zsh.git ~/.oh-my-zsh
```

2. 备份已有的zshrc(一般不需要)

```shell
cp ~/.zshrc ~/.zshrc.orig
```
3. 替换zshrc

```shell
cp ~/.oh-my-zsh/templates/zshrc.zsh-template ~/.zshrc
```

![zsh]({{site.url}}/attachments/images/zsh.png)


转自：[MAC下配置ZSH](http://blog.163.com/qy_gong/blog/static/1718738792013102992830558/)
