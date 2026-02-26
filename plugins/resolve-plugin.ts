/**
 * 一个简单的 Rspack 插件，用于拦截 MDX 文件中的图片请求
 * 如果请求以 "assets/" 开头，自动将其转换为相对路径解析
 */
export class ResolveAssetsPlugin {
    apply(compiler: any) {
        compiler.hooks.normalModuleFactory.tap("ResolveAssetsPlugin", (nmf: any) => {
            nmf.hooks.beforeResolve.tap("ResolveAssetsPlugin", (resolveData: any) => {
                // 检查请求是否以 "assets/" 开头，且不是标准相对路径、绝对路径或外部链接
                if (
                    resolveData.request.startsWith("assets/") &&
                    !resolveData.request.startsWith("./") &&
                    !resolveData.request.startsWith("/") &&
                    !resolveData.request.includes("://")
                ) {
                    // 检查发起请求的源文件是否是 Markdown 或 MDX 文件
                    if (
                        resolveData.contextInfo.issuer &&
                        /\.(md|mdx)$/.test(resolveData.contextInfo.issuer)
                    ) {
                        console.log(
                            `[ResolvePlugin] Intercepted: ${resolveData.request} from ${resolveData.contextInfo.issuer}`
                        );
                        // 将请求路径修改为显式的相对路径
                        resolveData.request = `./${resolveData.request}`;
                    }
                }
            });
        });
    }
}

