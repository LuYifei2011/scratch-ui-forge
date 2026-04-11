<div align="center">
  <h1>⚡ Scratch UI Forge</h1>
  <p>一款可视化 Scratch UI 组件编辑器，用于设计、预览并导出可在 Scratch 3 中直接使用的 UI 角色。</p>
  <a href="https://scratch-ui-forge.pages.dev" target="_blank"><strong>👉 在线编辑器</strong></a>
</div>

## 功能特性

- **可视化组件编辑** — 在实时预览画布中编辑按钮、复选框、开关、滑块等常用 UI 组件
- **多主题支持** — 内置 Fluent 和 Minecraft(待完善) 两套主题，每套主题拥有独立的颜色配置和参数体系
- **造型帧预览** — 底部帧条显示组件的所有造型（普通、悬停、按下、禁用、动画帧等），可逐帧查看
- **互动脚本生成** — 导出 `.sprite3` 时自动附带完整的 Scratch 积木脚本，导入 Scratch 后即可直接交互
- **多种导出格式**
  - 单个 `.svg` 文件（首帧造型）
  - 造型 `.zip` 压缩包（含所有帧）
  - `.sprite3` 角色文件（含造型 + 积木脚本）
  - 批量导出整个项目为 `.zip` 或多个 `.sprite3`
- **多项目管理** — 创建、切换、导入/导出、删除项目，数据持久化至浏览器 IndexedDB
- **自动保存** — 编辑内容实时防抖保存，无需手动操作
- **深色 / 浅色模式** — 支持一键切换，编辑器与预览画布均响应主题
- **紧凑模式** — 可切换为更小的参数面板布局，节省屏幕空间

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite |
| UI 组件库 | Chakra UI v3 |
| 状态管理 | Zustand |
| SVG 渲染 | SVG.js (`@svgdotjs/svg.js`) |
| 数据持久化 | IndexedDB (`idb`) |
| 路由 | React Router v7 |
| 导出工具 | JSZip + file-saver |
| 字体 | scratch-render-fonts |

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

浏览器访问 `http://localhost:5173` 即可打开编辑器。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 使用说明

1. **创建项目** — 首次打开时进入欢迎页，点击「创建新项目」并填写项目名称
2. **添加组件** — 点击左侧边栏顶部的 `+` 按钮，选择组件类型（如按钮、滑块等）并命名
3. **编辑参数** — 在右侧参数面板中调整颜色、文字、尺寸、边框、图标等属性，中央预览画布实时更新
4. **切换造型** — 底部帧条展示所有造型帧，点击任意帧可在主画布中预览
5. **导出** — 点击顶部工具栏的导出按钮，选择所需格式下载

## 项目结构

```
src/
├── components/         # React UI 组件
│   ├── editor/         # 参数面板、图标选择器、项目设置
│   ├── layout/         # AppBar、导出菜单、编辑器布局
│   ├── preview/        # 预览画布、帧条
│   └── sidebar/        # 文件树、新建组件弹窗
├── core/               # 核心渲染逻辑
│   ├── SvgRenderer.ts  # SVG 渲染引擎
│   ├── ThemeRegistry.ts# 主题注册与管理
│   ├── types.ts        # 全局类型定义
│   ├── scratch-blocks/ # Scratch 积木 JSON 构建工具
│   └── utils/          # 颜色、图标、形状、文字、缓动工具
├── definitions/        # 主题与组件定义
│   ├── components/     # Button、Checkbox、Toggle、Slider 渲染逻辑
│   ├── themes/         # Fluent、Minecraft 主题配置
│   └── icons/          # 内置图标注册
├── routes/             # 页面路由（欢迎页、组件编辑器、场景编辑器）
├── services/           # 导出服务、IndexedDB 持久化
└── store/              # Zustand 状态（项目状态、编辑器状态）
```

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
