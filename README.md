# overtrue.me

安正超的个人主页。Astro 静态站点，Three.js 粒子光场，Shiki 代码高亮，原生 CSS；不依赖后端或运行时 API。

## 本地运行

需要 Node.js 22.23.4+，推荐 Node.js 24 LTS（`.nvmrc` 已指定）。

```sh
nvm install
npm ci
npm run dev
```

默认预览地址是 http://localhost:4321。

## 验证与发布

```sh
npm run check
npm run build
npm test
npm run preview
```

将 `dist/` 发布到支持静态文件的服务器。保留目录的 `index.html` 解析以及自定义 `404.html`；不要把所有未知地址重写成首页。旧 Jekyll URL 使用生成的 HTML 跳转页兼容。`build.sh` 只安装依赖、验证和构建，不修改 Git 状态，也不执行发布。

线上使用 GitHub Pages：源码保存在 `overtrue/blog`，构建后的 `dist/` 发布到 `overtrue/overtrue.github.io` 的 `master` 根目录。`public/CNAME` 保留域名 `overtrue.me`，`.nojekyll` 确保 `_astro/` 资源直接提供。部署时保留发布仓库中已有的历史图片，避免旧链接失效。

## 内容

- `src/lib/projects.ts`：项目介绍和链接。
- `src/pages/index.astro`：个人介绍、精选文章与联系入口。
- `src/lib/i18n.ts`：中英文界面文案。
- `src/lib/markdown.ts`：文章高亮、目录与阅读标记。
- `legacy/_app/_posts/`：29 篇旧文章的完整原文，新站构建时读取；新增 Markdown 也使用 `YYYY-MM-DD-slug.md` 命名。
- `legacy/`：重建前整套 Jekyll 站点备份，不参与旧版构建。
- `docs/sources.md`：公开资料来源。
- `docs/design.md`：视觉和动效说明。

首页的四个场景由同一粒子光场连续形变串联，鼠标经过时局部散开、移开后聚回。支持拖动、方向键、Home / 双击复位和暂停。系统减少动态效果时默认静止；切换浏览器标签时停止渲染。WebGL 不可用时显示静态粒子曲面。文章页不加载 Three.js，搜索在浏览器本地完成。

首屏字母会随滚动收拢为小型立方体，跟随页面，到底部再展开成半截背景文字。减少动态效果或禁用脚本时显示静态版本。

Logo 素材位于 `public/brand/`，网站使用透明彩色版 `mark-color.svg`。包含方形、透明彩色、纯黑、纯白 SVG 与 1024px PNG。

阅读页支持代码高亮、复制、目录和阅读进度；代码与表格可单独滚动。高亮在构建时生成，不增加浏览器高亮库。

页眉可切换浅色 / 深色 / 跟随系统，以及中文 / English。选择保存在本机，跨页面保留。博客标题、正文和代码保持原文。
