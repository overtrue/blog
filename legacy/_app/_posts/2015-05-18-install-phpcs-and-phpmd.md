---
layout: post
title: PHPCS、PHPMD 的安装与配置
excerpt: PHP代码规范检查工具PHPCS、PHP代码质量检测工具PHPMD的安装与配置
---

## PHPCS

### 安装

有以下方式安装 PHPCS:

##### 使用 `composer`:

```
composer global require "squizlabs/php_codesniffer=*"
```

> 注意，你可能需要将 `~/.composer/vendor/bin/` 添加到 PATH 环境变量中，否则会报命令找不到。

##### 使用 PEAR:

```
pear install PHP_CodeSniffer
```

##### 下载安装：

```sh
curl -OL https://squizlabs.github.io/PHP_CodeSniffer/phpcs.phar
php phpcs.phar -h
curl -OL https://squizlabs.github.io/PHP_CodeSniffer/phpcbf.phar
php phpcbf.phar -h
```

  然后移动到命令目录：

```sh
mv phpcs.phar /usr/bin/phpcs
mv phpcbf.phar /usr/bin/phpcbf
// 也许上面需要 sudo
chmod +x /usr/bin/phpcs
chmod +x /usr/bin/phpcbf
```

  这里的 `phpcbf` 是代码修复工具。

### 使用

##### 查看帮助：

```
phpcs --help
```

##### 添加标准：

```
phpcs --config-set installed_paths PATH_TO_SEARCH_STANDARDS
```

注意：假设标准为 `Weibo`, 目录为:

```
/Users/overtrue/code_standards/Weibo
```

  其中`Weibo` 里才是 `ruleset.xml`，那么对应上面的 `PATH_TO_SEARCH_STANDARDS` 应该为：

```
phpcs --config-set installed_paths /Users/overtrue/code_standards
```

##### 查看已经安装的标准：

```
phpcs -i
```

##### 查看配置：

```
phpcs --config-show
```

##### 检查代码规范：

```
phpcs ./codes/Example.php
// or
phpcs ./codes/
```

  指定标准：

```
phpcs ./codes/Example.php --standard=PSR2
```

  报告格式：

```
phpcs --report=summary /path/to/code
```

  可用的格式有（默认为: `full`）：

```
full, xml, checkstyle, csv
json, emacs, source, summary, diff
svnblame, gitblame, hgblame or notifysend
```

##### 修复代码

 第一种：使用 diff 形式打补丁：

```sh
phpcs --report-diff=/path/to/changes.diff /path/to/code
patch -p0 -ui /path/to/changes.diff
# patching file /path/to/code/file.php
```

 第二种：使用 PHP Code Beautifier 和 Fixer：

```
phpcbf /path/to/code
```

  以上命令会自动修复原文件，如果不想直接覆盖原文件，可以使用 `--suffix` 指定修复后的代码后缀：

```
phpcs /path/to/code --suffix=.fixed
```

更多 PHPCS 的使用请参考：https://github.com/squizlabs/PHP_CodeSniffer/wiki


## PHPMD

### 安装

同样有以下安装方式：

##### 下载 `phar` 文件安装：

```sh
wget -c http://static.phpmd.org/php/latest/phpmd.phar
mv phpmd.phar /usr/bin/phpmd
chmod +x /usr/bin/phpmd
```

##### 使用 `Composer` 安装：

```
composer global require phpmd/phpmd
```

### 使用

- 检查代码质量：

```
# phpmd 代码路径 报告格式
phpmd /path/to/source text
```

  或者指定要检查的规则：

```
# phpmd 代码路径 报告格式 规则列表
phpmd /path/to/source text codesize,unusedcode,naming
```

  或者使用xml指定检查规则：

```
# phpmd 代码路径 报告格式 规则xml文件
phpmd /path/to/source text /phpmd_ruleset.xml
```

- 报告格式有：
    - xml, 以 XML 格式输出；
    - text, 简单的文本格式；
    - html, 输出到单个的html；

这里有一个phpmd规则可参考：https://github.com/overtrue/phpmd-rulesets

更多关于 PHPMD 的使用请参考：http://phpmd.org/documentation/index.html