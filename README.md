# 望冉 Web UI

前端项目，配套后端仓库：[wangran](https://github.com/CrispyXYZ/wangran)。

本项目基于 React + TypeScript + Vite，提供用户、商户、管理端相关页面与接口联调能力。

**本项目为学习项目，代码质量低下，ui粗制，功能仍未完善，请见谅**

## 技术栈

- 框架：`React 19` + `TypeScript 5`
- 构建：`Vite 7`
- 路由：`react-router-dom 7`
- 数据请求：`axios`
- 服务端状态管理：`@tanstack/react-query`
- UI/样式：`Tailwind CSS 4` + `shadcn/ui` + `lucide-react`
- 表单与校验：`react-hook-form` + `zod`
- 代码质量：`ESLint 9` + `Prettier 3`

## 环境要求

- Node.js（请使用与当前 Vite 版本兼容的 Node 版本）
- npm 或 pnpm（仓库内包含 `pnpm-lock.yaml`）

## 快速开始

1. 安装依赖

```bash
npm install
```

或

```bash
pnpm install
```

2. 配置环境变量

```bash
cp .env.example .env
```

按实际后端地址修改 `.env`。

3. 启动开发环境

```bash
npm run dev
```

或

```bash
pnpm dev
```

默认会以 `0.0.0.0` 监听，便于局域网访问。

## 环境变量说明

参考文件：`.env.example`

| 变量名 | 说明 | 示例 |
| --- | --- | --- |
| `VITE_BACKEND_API` | 后端 API 地址（Vite 开发代理目标） | `http://127.0.0.1:8080` |

说明：前端请求以 `/api` 开头，开发时由 Vite 代理转发到 `VITE_BACKEND_API`。

## 常用脚本

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

- `dev`：启动开发服务器
- `build`：TypeScript 构建检查 + Vite 打包
- `preview`：预览打包结果
- `lint`：运行 ESLint
- `format`：使用 Prettier 格式化 `src` 下常见前端文件

## 目录结构

```text
src/
  api/          # 接口封装（axios 实例、业务 API）
  components/   # 组件（含 ui 基础组件）
  hooks/        # 复用 hooks（如鉴权上下文）
  layouts/      # 页面布局
  pages/        # 路由页面
  router/       # 路由配置
  types/        # 类型定义
  lib/          # 工具函数
```

## 构建与部署

构建命令：

```bash
npm run build
```

产物说明：

- `dist/`：可部署的静态资源
- `build/wangran-webui.zip`：打包后的 zip 文件（由 `vite-plugin-zip-pack` 生成）

部署方式：将 `dist/` 部署到任意静态资源服务器（Nginx、对象存储静态站点、CDN 等）。

## 联调说明

- 前端请求基地址为 `/api`
- 开发环境通过 `vite.config.ts` 中代理转发至 `VITE_BACKEND_API`
- 若出现接口 401，项目会清理本地登录态，需要重新登录

## 常见问题（FAQ）

### 1) 修改 `.env` 后不生效

请重启开发服务器：

```bash
npm run dev
```

### 2) 接口请求失败/跨域

优先检查：

- `VITE_BACKEND_API` 是否包含正确协议、IP、端口
- 后端服务是否已启动
- 开发请求是否使用了 `/api` 前缀

### 3) 构建成功但页面空白

请检查部署服务器是否正确回退到 `index.html`（前端路由场景）。

## 贡献规范

欢迎提交 Issue 和 PR。
