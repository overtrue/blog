export type Language = 'zh' | 'en';

const messages = {
  skip: ['跳到内容', 'Skip to content'],
  home: ['overtrue 首页', 'overtrue home'],
  navigation: ['主导航', 'Main navigation'],
  navIntro: ['我', 'Me'],
  navWork: ['开源', 'Work'],
  navWriting: ['文字', 'Notes'],
  navAbout: ['联系', 'Contact'],
  homeTitle: [
    'overtrue · 安正超 — 开源，让想法走得更远',
    'overtrue · Chris An — Building in the open',
  ],
  writingTitle: ['文字 · overtrue', 'Notes · overtrue'],
  errorTitle: ['走远了 · overtrue', 'Page not found · overtrue'],
  theme: ['切换主题', 'Choose a theme'],
  themeSystem: ['跟随系统', 'System'],
  themeLight: ['浅色', 'Light'],
  themeDark: ['深色', 'Dark'],
  introLine: ['写代码。做开源。保持好奇。', 'Write code. Build in the open. Stay curious.'],
  viewWork: ['查看开源作品', 'Explore open-source projects'],
  workHeading: ['我的一些开源作品', 'A few things I build in the open'],
  projects: ['开源作品', 'Open-source projects'],
  moreWork: ['还有更多', 'There’s more'],
  creator: ['创建者', 'Creator'],
  contributor: ['贡献者', 'Contributor'],
  easywechatKind: ['微信开发工具包', 'WeChat SDK'],
  easywechatDescription: [
    '把微信开发中的繁琐细节，收进一个顺手的 SDK。让开发者把时间花在真正的业务上。',
    'A friendly SDK for the fiddly parts of WeChat development, so developers can spend their time on what they’re building.',
  ],
  rustfsKind: ['高性能对象存储', 'High-performance object storage'],
  rustfsDescription: [
    '从开发工具走向基础设施。参与构建兼容 S3 的高性能对象存储，让数据拥有更开放的选择。',
    'From developer tools to infrastructure. Helping build fast, S3-compatible object storage with more open choices for your data.',
  ],
  easysmsKind: ['多渠道短信组件', 'One API for SMS'],
  easysmsDescription: [
    '不同服务商，同一个发送接口。统一短信发送、自动切换策略，把重复的对接留给工具。',
    'One interface for multiple SMS providers, with automatic failover. Less integration work, more messages delivered.',
  ],
  pinyinKind: ['中文转拼音解决方案', 'Chinese to Pinyin'],
  pinyinDescription: [
    '不止是把汉字转成字母。基于词库处理多音字，让搜索、排序和中文输入更自然。',
    'More than turning characters into letters. Dictionary-based pronunciation makes Chinese search, sorting, and input feel more natural.',
  ],
  projectLink: ['在 GitHub 查看 {name}', 'View {name} on GitHub'],
  writingAside: ['一些想通的事，还有没想通的。', 'Things I’ve figured out. And things I haven’t.'],
  allPostsCount: ['全部 {count} 篇文字', 'All {count} posts'],
  identityRole: ['开源开发者 / AI dispatcher', 'Open-source developer / AI dispatcher'],
  portrait: ['安正超 overtrue 的彩色头像', 'Portrait of Chris An, overtrue'],
  biographyOne: [
    '你也许在 Composer 里见过我的名字。我喜欢写代码，更喜欢有人用上它。',
    'You may have seen my name in Composer. I like writing code. I like it even more when someone puts it to use.',
  ],
  biographyTwo: [
    '从 EasyWeChat 到 RustFS，一直在做点自己觉得有意思的东西。',
    'From EasyWeChat to RustFS, I keep building things that interest me.',
  ],
  field: ['随滚动变形的蓝色粒子光场', 'A blue particle field that changes shape as you scroll'],
  playMotion: ['播放动效', 'Play animation'],
  pauseMotion: ['暂停动效', 'Pause animation'],
  archiveKicker: ['文字 / 开发手记', 'Notes / From the workbench'],
  archiveIntro: [
    '关于代码、开源，以及一路走来的记录。',
    'On code, open source, and things learned along the way.',
  ],
  searchLabel: ['找一篇文章', 'Find a post'],
  searchPlaceholder: ['试试 Laravel、PHP、开源…', 'Try Laravel, PHP, Composer…'],
  postCount: ['共 {count} 篇', '{count} posts'],
  emptySearch: ['没有找到这篇文章，换个关键词试试。', 'No posts found. Try another keyword.'],
  allPosts: ['全部文字', 'All posts'],
  readingTime: ['{minutes} 分钟阅读', '{minutes} min read'],
  toc: ['本文目录', 'On this page'],
  tocLabel: ['文章目录', 'Table of contents'],
  backTop: ['回到顶部', 'Back to top'],
  oldPost: [
    '写于 {year} 年，内容保留原貌。文中版本和链接可能已有变化。',
    'Written in {year} and kept as originally published. Versions and links may have changed.',
  ],
  readNext: ['接着读', 'Read next'],
  code: ['代码', 'Code'],
  codeLines: ['{count} 行', '{count} lines'],
  copyCode: ['复制代码', 'Copy code'],
  copy: ['复制', 'Copy'],
  copied: ['已复制', 'Copied'],
  copyFailed: ['请手动选择复制', 'Select text to copy'],
  table: ['数据表格', 'Data table'],
  headingLink: ['链接到：{name}', 'Link to: {name}'],
  invitation: ['有个有意思的想法？', 'Have something in mind?'],
  errorHeading: ['好像走得有点远。', 'A little off the path.'],
  errorMessage: [
    '这页不在这里，试试回到首页或文章归档。',
    'This page isn’t here. Head home or look through the notes.',
  ],
  backHome: ['回到首页', 'Back home'],
  findOldPost: ['找一篇旧文章', 'Find an old post'],
} as const;

export type MessageKey = keyof typeof messages;

export function translate(
  key: MessageKey,
  language: Language,
  params: Record<string, string | number> = {},
) {
  let value: string = messages[key][language === 'en' ? 1 : 0];
  if (language === 'en' && Number(params.count) === 1) {
    if (key === 'postCount') value = '{count} post';
    if (key === 'codeLines') value = '{count} line';
  }
  return value.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
}

export function currentLanguage(): Language {
  return document.documentElement.lang === 'en' ? 'en' : 'zh';
}
