import type { RspressPlugin } from '@rspress/core';
import {
    // PresetConfigMutator,
    unistVisit,
    type HASTRoot,
    // type MDASTRoot,
    type RehypePluginFactory,
    // type RemarkPluginFactory,
} from 'rspress-plugin-devkit';

export interface RspressPluginResourceOptions {
    containerClassNames?: string[];
    justify?: 'center' | 'left' | 'right';
    // prefix?: string[];
    // convertPrefix?: string;
}

export function resourcePlugin(
    options: RspressPluginResourceOptions = {},): RspressPlugin {
    return {
        // 插件名称
        name: 'rspress-plugin-resource',
        // 扩展 Markdown/MDX 编译能力
        markdown: {
            remarkPlugins: [
                // 添加自定义的 remark 插件
                // [remarkPathReplace(), options]
            ],
            rehypePlugins: [
                // 添加自定义的 rehype 插件
                [rehypeAlignImage(), options]
            ],
            globalComponents: [
                // 为 MDX 注册全局组件
            ],
        },
    };
}

// function remarkPathReplace(): RemarkPluginFactory<RspressPluginResourceOptions> {
//     return (options) => {
// const { prefix = ["assets"], convertPrefix = "./assets", } = options;
// return (tree: MDASTRoot) => {
//     unistVisit(tree, "mdxjsEsm", (node) => {
//         const code = node.value;
//         node.value = code.replace(
//             /from\s+['"]assets\/([^'"]+)['"]/g,
//             (match, p1) => {
//                 return `from '${replacePrefix(
//                     `assets/${p1}`,
//                     prefix,
//                     convertPrefix
//                 )}'`;
//             }
//         );
//     });

// for (const node of tree.children) {
//     if (node.type === 'paragraph') {
//         for (const child of node.children) {
//             const childAny = child as any;
//             const childUrl = childAny.url;
//             if (isImageElement(child)) {
//                 childAny.url = replacePrefix(childUrl, prefix, convertPrefix);
//             }
//         }
//     } else if (node.type === 'mdxjsEsm') {
//         const code = node.value;

//         node.value = code.replace(
//             /from\s+['"]assets\/([^'"]+)['"]/g,
//             (match, p1) => {
//                 return `from '${replacePrefix(
//                     `assets/${p1}`,
//                     prefix,
//                     convertPrefix
//                 )}'`;
//             }
//         );
//         // node.value = code.replace(/require\('([^']+)\)/g, (match, p1) => {
//         //     return `require('${replacePrefix(p1, prefix, convertPrefix)}')`;
//         // });
//     }
// }
//         }
//     };
// }

function replacePrefix(url: string, prefix: string[], convertPrefix: string) {
    for (const p of prefix) {
        if (url.startsWith(p)) {
            return url.replace(p, convertPrefix);
        }
    }
    return url;
}

function rehypeAlignImage(): RehypePluginFactory<RspressPluginResourceOptions> {
    return (options) => {
        const { containerClassNames = [], justify = 'center', } = options;

        return (tree: HASTRoot) => {
            unistVisit(tree, 'element', (node) => {
                if (
                    node.tagName === 'p' &&
                    node.children.length === 1 &&
                    isImageElement(node.children[0])
                ) {
                    node.tagName = 'div';

                    node.properties ??= {};
                    node.properties.className = [
                        'my-4',
                        'flex',
                        'flex-row',
                        getJustifyClass(justify),
                        ...containerClassNames,
                    ];
                }
            });
        };
    };
}

function isImageElement(node: any): boolean {
    return node.type === 'mdxJsxFlowElement' && node.name === 'img';
}

function getJustifyClass(justify: 'center' | 'left' | 'right'): string {
    switch (justify) {
        case 'center':
            return 'justify-center';
        case 'left':
            return 'justify-start';
        case 'right':
            return 'justify-end';
        default:
            return 'justify-center';
    }
}
