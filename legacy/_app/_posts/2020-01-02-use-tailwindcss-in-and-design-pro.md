---
layout: post
title: 如何在 And Design Pro 或 UmiJS 中使用 tailwindcss
excerpt: 一次新的尝试
---

最近打算给已有的项目做个管理后台，找了一圈以后开箱即用又好看的，实属 [Ant Design Pro](https://pro.ant.design/index-cn) 了，就像它的 Slogan 一样：“开箱即用的中台前端/设计解决方案”。不过对于 React 还不算入门的我，一路摸着石头过河，作为 Tailwindcss 死忠粉，尝试了在 Ant Design Pro 中集成它，这里分享给同样喜欢这俩的朋友。

Ant Design Pro 是基于 [UmiJS](https://umijs.org/zh/) 构建的，所以，如果你在使用 UmiJS，方法是完全一样的。

## 安装 tailwindcss 和常用 postcss 插件

```sh
$ yarn add tailwindcss postcss-import postcss-nested autoprefixer
```

## 在 `src` 下创建 `tailwind.css`

*src/tailwind.css*
```css
@import 'tailwindcss/base';

@import 'tailwindcss/components';

@import 'tailwindcss/utilities';

```

## 修改配置 

在 config/config.js 中增加配置项 `extraPostCSSPlugins`：

```
//...
  extraPostCSSPlugins: [
    require('postcss-import'),
    require('tailwindcss'),
    require('postcss-nested'), // or require('postcss-nesting')
    require('autoprefixer'),
  ],
//...
```


## 全局引入 tailwindcss

你可以在你觉得合适的地方全局引入上面创建的 `tailwind.css`，比如在 `src/global.less` 中引入：

```less
@import '~antd/es/style/themes/default.less';
@import 'tailwind.css'; 

//...
```

然后你就可以在我们的页面使用了：

```jsx
<div className="mt-4">
    <div className="mb-3">
    ...
```

好了，搞定！



