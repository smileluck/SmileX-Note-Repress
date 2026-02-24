import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginGiscus } from 'rspress-plugin-giscus'; // 或 rspress-plugin-code-giscus

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'My Site',
  icon: '/rspress-icon.png',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/smileluck/SmileX-Note-Repress',
      },
    ],
  },
  plugins: [pluginGiscus({
    repo: 'smileluck/smilex-Note-Repress',
    repoId: 'R_kgDORXWUpA',
    category: 'General',
    categoryId: 'DIC_kwDORXWUpM4C3GT9',
    lang: 'zh-CN',
  })],
});
