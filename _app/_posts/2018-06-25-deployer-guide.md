---
layout: post
title: 又一篇 Deployer 的使用攻略
---

![file](https://lccdn.phphub.org/uploads/images/201806/14/76/FAOVLKIcez.png?imageView2/2/w/1240/h/0)

其实网上有相当多的关于 Deployer 的使用教程，在这个社区也有不少同学写过，不过发现很难找到一个完整能跑通的文章，所以希望今天写这篇是一个小白就能完整走通的教程吧，当然了，这是回忆加参考外文写出来的，难免也有失误，欢迎小白同学在下面反馈使用过程中遇到的问题为谢！

## 基础知识

在开始之前，有必要了解一下 Deployer 是一个什么样的东西。
Deployer 是一个基于 SSH 协议的无侵入 web 项目部署工具，因为它不需要你在目标服务器上装什么服务之类的东西即可使用，它只需要在你的开发机，或者你的笔记本，就是发起部署动作的一方安装即可。

它的原理就是通过 SSH 到你的机器去创建目录，移动文件，执行指定的动作来完成项目的部署。

我画了一张图来说明它的操作原理：

![file](https://lccdn.phphub.org/uploads/images/201806/14/76/eQTmTiE2WF.png?imageView2/2/w/1240/h/0)
绘图工具：https://www.draw.io/

简单介绍一下，Deployer 安装在本地，它通过 SSH 协议登录到服务器 web server 上执行一系列我们预定的操作，其中包含从代码库 Git Server 拉取我们的项目代码部署到 web 服务器指定的目录完成部署。

一共分为以下几个部分：

- 在本地使用 composer 安装 deployer
- 在 Linux 服务器添加账户与配置权限
- 项目 git 仓库允许服务器访问（clone 代码）
- 部署我们的 web 项目

我们分开一个个讲，在后面的每一步请注意区分当前逻辑所在的环境：**本地 / 目标服务器**。

## Deployer 的安装与配置

> 此部分在本地操作  

Deployer 是一个 composer 包，你可以选择以 phar 包的形式，或者以 composer 全局安装来使用它，这里只讲后者，毕竟这是推荐大家使用的方式，升级也会方便很多：

```shell
$  composer global require deployer/deployer -vvv
```

安装完成你应该可以使用以下命令来查看它的版本信息：

```shell
$ dep --version
# Deployer master
```

如果提示 `dep` 命令不存在的话，可能需要将 composer 的 bin 目录加到你的 PATH 环境变量里面，通常是家目录下的 `.composer/vendor/bin/`，你可以通过下面的命令来查看是否配置成功：

```shell
$ echo $PATH
/usr/local/sbin /usr/local/bin /Users/overtrue/.composer/vendor/bin 
```

Mac 环境下根据你使用 shell 的不同来配置环境变量，默认的 bash 的话直接编辑家目录下的 `.bash_profile` 文件即可：

```shell
$ vim ~/.bash_profile
# 将 composer bin 目录加到其中即可
# export PATH=/usr/local/bin:/Users/overtrue/.composer/vendor/bin:$PATH
# 然后保存退出
```

然后切一个新的终端窗口，应该就有 dep 命令了。

Deployer 的安装就到这里，接下来我们去目标服务器去折腾一下。

## 服务器端的配置

> 此部分在目标服务器上操作  

虽然说是无侵入的部署工具，但是还是需要我们来做一些微小的配置的，因为出于安全考虑，我们一般不会开发 root 用户的 SSH 登录，而是使用其它用户，比如 Ubuntu 默认的 ubuntu 用户。
我们 Deployer 是用来部署 web 应用的，所以我们也专门创建一个用户来做这件事情比较好：

```shell
$ sudo adduser deployer
# 密码什么的，按提示操作即可
```

我们的 web 项目通常需要一些上传，或者缓存写入这样的操作，所以 deployer 还需要有权限对目录进行修改，比如 Laravel 的 storage 目录需要可写权限，这里以 nginx 默认的用户组 www-data 举例，如果你修改过用户或者组名请对应修改下面的命令里的 www 用户组：

```shell
$ sudo usermod -aG www-data deployer
```

我们通常需要将`deployer` 用户权限分别设置为创建文件 644 与目录 755，这样一来，deployer 用户可以读写，但是组与其它用户只能读：

```shell
$ su deployer # 切换到 deployer 用户
$ echo "umask 022" >> ~/.bashrc
$ exit # 退出
```

我们需要将 `depoloyer` 用户加到 sudoers 中：

```shell
$ vim /etc/sudoers
# 在最后加入
deployer ALL=(ALL) NOPASSWD: ALL
# 保存并退出
```

接下来要对我们的 web 根目录授权，假设我们的 web 服务的根目录在 `/var/www/`  下，那么需要将这个目录的用户设置为 `deployer` ，组设置为 www 用户 `www-data`:

```shell
$ sudo chown deployer:www-data /var/www/html # 最后这里不要加斜线哦
```

为了让 `deployer` 用户在 `/var/www/html` 下创建的文件与目录集成根目录的权限设定（用户：deployer,组：www-data），我们还需要一步操作：

```shell
$ sudo chmod g+s /var/www/html
```

OK，Deployer 的用户操作就结束了，接着你需要检查以下配置：

1. 确认 php 的可执行文件在全局 PATH 中，或者你手动添加到 deployer 用户目录的 .bash_profile PATH 中也可，使用命令确认（登录用户 `deployer` 后执行）：`php -v`，如果报错的话，一般建议是将 php 的 bin 文件软链接到 `/usr/local/bin/`（推荐） 或者  `/usr/bin/` 下。
2. 同样检查你的 Deployer 任务清单所需要用到的其它命令，比如 `npm`,`nginx`,`composer` 都在 `deployer` 用户下可以使用，否则在部署的时候会出错。

## 项目 git 仓库允许服务器访问

> 此部分在目标服务器上操作  

我们 deployer 的运行机制是从 git 或者其它你指定的代码库 clone 代码到目标服务器，所以如果你的代码不是公开的仓库，我们通常需要添加 SSH 公钥才可以从代码库 clone 代码，所以接着来创建公钥：

先切换当前登录用户到 deployer：
```shell
$ su - deployer
```

然后创建 SSH 密钥：

```shell
$ ssh-keygen -t rsa -b 4096 -C "deployer" 
# 这里的 -C 是指定备注
# 一路回车下去即可
```

然后我们将生成的公钥拷贝出来：

```shell
$ cat ~/.ssh/id_rsa.pub # 显示公钥
```

请完整的复制 cat 出来的结果，然后去你的代码库添加 SSH 公钥。

OK, 现在你的服务器就可以从代码库 clone 代码了，你可以在服务器上 git clone 一下你的代码库测试，如果不成功，请检查你的公钥是否正确完全的复制与粘贴正确，不正确的话再次重复复制粘贴即可。

## 服务器免密码登录 deployer 

> 此部分在本地（或者开发机）操作  

在本地（或者开发机）执行部署任务时我们不想每次输入密码，所以我们需要将 deployer 用户设置 SSH 免密码登录：

在本机生成 deployer 专用密钥，然后拷贝公钥：
```shell
$ ssh-keygen -t rsa -b 4096 -f  ~/.ssh/deployerkey
```

然后将公钥保存到目标服务器（注意，这一步还是在本机操作）：

```shell
$ ssh-copy-id -i  ~/.ssh/deployerkey.pub deployer@123.45.67.89 # 请填写服务器 IP
# 应该会让你输入 deployer 在服务器上的登录密码，输入后回车即可
```

然后你应该就可以直接以 `deployer` 用户免密码登录到服务器了，测试方式：

```shell
$ ssh deployer@123.45.67.89 -i ~/.ssh/deployerkey
# 应该就能直接进到服务器上了，然后 exit 退出
```

OK，这一步搞定了 `deployer` 免密码登录，接下来我们聊项目的部署。

## Deployer 的使用

> 这些都在本地操作哦  

假设我们的项目在本地 `/www/demo-project` 下，那么我们切换到该目录：

```shell
$ cd /www/demo-project
```

然后执行 Deployer 的初始化命令：

```shell
$ dep init
```

它会让你选择项目类型，比如 Laravel，symfony 等，如果你都不是，选择 common 类型即可。

这一步操作将会在当前目录生成一个 `deploy.php` 文件，这个文件就是部署清单，也就是告诉 Deployer 怎样去部署你的项目，关于这部分我们不需要过多的介绍，大家去参考  Deployer 官网的详细说明操作即可。

需要关心的几个配置是：

```php
// 指定你的代码所在的服务器 SSH 地址，请不要使用 https 方式哦。
set('repository', 'git@mygitserver.com:overtrue/demo-project.git');

// 这里填写目标服务器的 IP 或者域名
host('your_server_ip') 
    ->user('deployer') // 这里填写 deployer 
	  // 并指定公钥的位置
    ->identityFile('~/.ssh/deployerkey')
    // 指定项目部署到服务器上的哪个目录
    ->set('deploy_path', '/var/www/demo-app'); 
```

正确填写完配置清单以后，我们就可以部署我们的项目了，确认你的代码已经提交到代码仓库，因为执行部署的时候并不是将当前代码部署到服务器，而是从代码库拉最新的版本。

然后在当前目录执行：

```shell
$ dep deploy -vvv
```

就可以看到整个部署过程了，一般正常会是像下面这样子：

```shell
$ dep deploy -vvv
Deployer's output
✈︎ Deploying master on your_server_ip
✔ Executing task deploy:prepare
✔ Executing task deploy:lock
✔ Executing task deploy:release
➤ Executing task deploy:update_code
✔ Ok
✔ Executing task deploy:shared
✔ Executing task deploy:vendors
✔ Executing task deploy:writable
✔ Executing task artisan:storage:link
✔ Executing task artisan:view:clear
✔ Executing task artisan:cache:clear
✔ Executing task artisan:config:cache
✔ Executing task artisan:optimize
✔ Executing task deploy:symlink
✔ Executing task deploy:unlock
✔ Executing task cleanup
Successfully deployed!
```

如果失败的话就需要检查一下哪一步出错了，通常根据报错信息即可定位。

## 关于 Deployer 部署结构

Deployer 部署完成后，在服务器上的结构会是这样子：

```shell
drwxr-sr-x 5 deployer www-data 4096 Jun 14 09:53 ./
drwxr-sr-x 6 deployer www-data 4096 Jun 11 14:25 ../
drwxr-sr-x 2 deployer www-data 4096 Jun 14 09:53 .dep/
lrwxrwxrwx 1 deployer www-data   10 Jun 14 09:52 current -> releases/7/
drwxr-sr-x 4 deployer www-data 4096 Jun 14 09:53 releases/
drwxr-sr-x 3 deployer www-data 4096 Jun 10 14:16 shared/
```

其中，.dep 为 Deployer 的一些版本信息，不用去研究，我们需要关心的是下面这几个：

- `current`  - 它是指向一个具体的版本的软链接，你的 nginx 配置中 root 应该指向它，比如 laravel 项目的话 `root` 就指向：`/var/www/demo-app/current/public` 
- `releases` - 部署的历史版本文件夹，里面可能有很多个最近部署的版本，可以根据你的配置来设置保留多少个版本，建议 5 个。保留版本可以让我们在上线出问题时使用 `dep rollback` 快速回滚项目到上一个版本。
-  `shared`  - 共享文件夹，它的作用就是存储我们项目中版本间共享的文件，比如 Laravel 项目的 `.env` 文件，`storage` 目录，或者你项目的上传文件夹，它会以软链接的形式链接到当前版本中。

OK，那基本上这样子就完成了整体 Deployer 需要考虑的地方以及使用细节了，相信大部分同学的问题都出在权限问题上。所以上面在创建用户时，一定要仔细操作。

## 结论

Deployer 确实非常好用，一条命令完成部署，回滚等操作，但是它目前还不是很完美，大家有问题可以去 GitHub 官方仓库提 issue 或者搜索相关问题解决方案。

个人用它已经两年了，非常喜欢这样简单的部署方式，但是新手刚用的时候难免在服务器权限这块碰壁不少，我总结了以下几个建议：

- 尽量使用系统提供的包管理工具来安装软件，比如 nginx, php 等，毕竟它是人家通过 N 年的实践总结出来的合理使用方式，包括配置文件的写法等都是科学的方式，另外一点就是当我们遇到问题的时候搜索到的结果也比较通用，当然你已经是系统高手了，那就不要看这条了。
- 不要让你的项目结构设计的太复杂，简单统一为原则，这样你不必多次重复去折腾这些东西。
- 最好关掉服务器 SSH 的密码登录，相关操作请自行 Google。
- 多看文档，很多你遇到的问题其实都是你没仔细看使用文档造成的结果。
