import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { RspressPlugin } from '@rspress/core'

/**
 * index 配置选项
 */
export interface IndexOptions {
  /**
   * 控制 index.md 文件在生成的 _meta.json 中的标签显示
   * - 设置为 false 时，标签显示为 "index"
   * - 设置为字符串时，标签显示为该字符串
   * - 未配置时，默认显示为 "首页"
   */
  name?: string | false

  /**
   * 控制 index.md 文件是否排在最前面
   * 当设置为 true 时，index 文件会优先显示
   */
  first?: boolean

  /**
   * 是否覆盖用户在 _meta.json 中手动配置的 label
   * - 设置为 true 时，会用 name 配置的值覆盖用户自定义的 label
   * - 设置为 false 时，保留用户自定义的 label
   * - 未配置时，默认为 true
   */
  rewrite?: boolean
}

export interface AutoMetaPluginOptions {
  applyInProd?: boolean
  applyInDev?: boolean
  /**
   * index 文件配置
   * - 配置为 boolean 时，true 等同于 { first: true, name: '首页' }
   * - 配置为对象时，可同时设置 name、first 和 rewrite 属性
   */
  index?: IndexOptions | boolean
  generateDirMeta?: boolean
  useFrontmatter?: boolean
  include?: RegExp[]
  exclude?: RegExp[]
  excludeDir?: (string | RegExp)[]
  filter?: (filePath: string) => boolean
  sort?: (a: string, b: string) => number
}

const defaultOptions: Required<Omit<AutoMetaPluginOptions, 'index'>> & { index: Required<IndexOptions> } = {
  applyInProd: true,
  applyInDev: true,
  index: {
    name: '首页',
    first: true,
    rewrite: true
  },
  generateDirMeta: true,
  useFrontmatter: true,
  include: [/\.md$/, /\.mdx$/],
  exclude: [],
  excludeDir: [],
  filter: () => true,
  sort: (a, b) => a.localeCompare(b)
}

export function AutoMetaPlugin(
  options: AutoMetaPluginOptions = {}
): RspressPlugin {
  const opts = { ...defaultOptions, ...options }

  // 处理 index 配置
  if (options.index !== undefined) {
    if (typeof options.index === 'boolean') {
      opts.index = {
        name: '首页',
        first: options.index,
        rewrite: true
      }
    } else {
      opts.index = {
        name: options.index.name !== undefined ? options.index.name : '首页',
        first: options.index.first !== undefined ? options.index.first : true,
        rewrite: options.index.rewrite !== undefined ? options.index.rewrite : true
      }
    }
  }

  return {
    name: 'auto-meta-plugin',

    async beforeBuild(config, isProd) {
      if (isProd && !opts.applyInProd) return
      if (!isProd && !opts.applyInDev) return

      const docsDir = path.resolve(config.root || 'docs')
      walk(docsDir, opts)
    }
  }
}

/* ======================= 核心逻辑 ======================= */

function generateMeta(dir: string, opts: Required<AutoMetaPluginOptions>) {
  if (!fs.existsSync(dir)) return

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  // 排除目录
  if (
    opts.excludeDir.some(rule =>
      typeof rule === 'string'
        ? path.basename(dir) === rule
        : rule.test(dir)
    )
  ) {
    return
  }

  const files = entries
    .filter(e => e.isFile())
    .map(e => e.name)
    .filter(name =>
      opts.include.some(r => r.test(name)) &&
      !opts.exclude.some(r => r.test(name)) &&
      opts.filter(path.join(dir, name))
    )

  const subDirs = entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .filter(name =>
      !opts.excludeDir.some(rule =>
        typeof rule === 'string'
          ? name === rule
          : rule.test(name)
      )
    )

  if (!files.length && !subDirs.length) return

  const metaPath = path.join(dir, '_meta.json')

  // 读取旧 meta 仅用于 merge 字段
  let existingMap = new Map<string, any>()
  if (fs.existsSync(metaPath)) {
    try {
      const old = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      for (const item of old) {
        if (item?.name) {
          existingMap.set(item.name, item)
        }
      }
    } catch { }
  }

  let result: any[] = []

  /* ---------- 文件排序 ---------- */

  let sortedFiles = [...files].sort(opts.sort)

  if (opts.index && (opts.index as IndexOptions).first) {
    sortedFiles = sortedFiles.sort((a, b) =>
      a.startsWith('index') ? -1 : b.startsWith('index') ? 1 : 0
    )
  }

  /* ---------- 生成文件项 ---------- */

  for (const file of sortedFiles) {
    const name = file.replace(/\.(md|mdx)$/, '')
    let label = name

    const isIndexFile = name.toLowerCase() === 'index'
    const hasOptsIndex = opts.index !== undefined && opts.index !== false


    if (opts.useFrontmatter && !isIndexFile) {
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
        const { data } = matter(raw)
        if (data.title) label = data.title
      } catch { }
    }

    const oldItem = existingMap.get(name)

    // 处理 index 文件的 label 配置
    if (isIndexFile && hasOptsIndex) {
      const optsIndex = opts.index as IndexOptions
      const shouldRewrite = optsIndex.rewrite !== false

      if (shouldRewrite || !oldItem?.label) {
        if (optsIndex.name === false) {
          label = 'index'
        } else if (typeof optsIndex.name === 'string') {
          label = optsIndex.name
        } else {
          label = '首页'
        }
      }
    }

    result.push({
      type: 'file',
      name,
      label: isIndexFile ? label : (oldItem?.label ?? label)
    })
  }

  /* ---------- 生成目录项 ---------- */

  if (opts.generateDirMeta) {
    let sortedDirs = [...subDirs].sort(opts.sort)

    if (opts.index && (opts.index as IndexOptions).first) {
      sortedDirs = sortedDirs.sort((a, b) =>
        a.startsWith('index') ? -1 : b.startsWith('index') ? 1 : 0
      )
    }

    for (const subdir of sortedDirs) {
      const oldItem = existingMap.get(subdir)

      result.push({
        type: 'dir',
        name: subdir,
        label: oldItem?.label ?? subdir,
        collapsible: oldItem?.collapsible ?? true,
        collapsed: oldItem?.collapsed ?? false
      })
    }
  }

  /* ---------- 避免无变化写入 ---------- */

  const newContent = JSON.stringify(result, null, 2)
  const oldContent = fs.existsSync(metaPath)
    ? fs.readFileSync(metaPath, 'utf-8')
    : ''

  if (newContent !== oldContent) {
    fs.writeFileSync(metaPath, newContent)
  }
}

/* ======================= 递归遍历 ======================= */

function walk(dir: string, opts: Required<AutoMetaPluginOptions>) {
  if (!fs.existsSync(dir)) return

  generateMeta(dir, opts)

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      walk(path.join(dir, entry.name), opts)
    }
  }
}