import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginGiscus } from 'rspress-plugin-giscus'; // 或 rspress-plugin-code-giscus
// import resourcePlugin from 'rspress-plugin-resource';
import { resourcePlugin } from './plugins/resource.js';


export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'My Site',
  icon: '/rspress-icon.png',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  route: {
    exclude: ['*/assets/**/*'],
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
  }),
  resourcePlugin({
    justify: 'center',
    prefix: ['assets'],
  })],
  // builderConfig: {
  //   resolve: {
  //     alias: (alias) => {
  //       alias['assets'] = "./assets";
  //       console.log(alias);
  //       return alias;
  //     },
  //   },
  // },
});
