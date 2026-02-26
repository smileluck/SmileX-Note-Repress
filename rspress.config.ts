import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { pluginGiscus } from 'rspress-plugin-giscus'; // 或 rspress-plugin-code-giscus
// import resourcePlugin from 'rspress-plugin-resource';
import { resourcePlugin } from './plugins/resource.js';
import { ResolveAssetsPlugin } from './plugins/resolve-plugin.js';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'My Site',
  icon: '/rspress-icon.png',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  route: {
    cleanUrls: true,
    exclude: ['*/_*/**/*',"**/_*","*/_assets/**/*"],
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
  })
  ],
  // builderConfig: {
  //   source: {
  //     assetsInclude: /\.pdf$/,
  //   },
  //   tools: {
  //     rspack: (config, { addRules }) => {
  //       // 确保 plugins 数组存在
  //       config.plugins = config.plugins || [];
  //       config.plugins.push(new ResolveAssetsPlugin());

  //       addRules([
  //         {
  //           test: /\.pdf$/,
  //           // 将资源转换为单独的文件，并且导出产物地址
  //           type: 'asset/resource',
  //         }])
  //     }
  //   }
  // },
});
