This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1.  Copy "pre-commit" to .git

```bash
cd /sealos # Make sure you are in the sealos root directory
cp frontend/desktop/scripts/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit
```

You will see formatting code when commit ".ts .tsx .scss" files.

2. run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 目录说明

### 项目依赖的库

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev", // 本地开发
    "build": "next build", // 构建
    "start": "next start",
    "lint": "next lint"
  },
  "browserslist": ["defaults", "not ie 11", "not op_mini all"],
  "dependencies": {
    // 后续全部使用 FluentUI
    "@fluentui/react-components": "^9.3.1",
    "@kubernetes/client-node": "^0.17.0",
    "@tanstack/react-query": "^4.2.3", // 请求处理 hooks https://tanstack.com/query/v4
    "axios": "^0.27.2", // 请求库，可以做拦截等，比较方便
    "clsx": "^1.2.1", // 组合样式
    "immer": "^9.0.15", // immutable 对象更新比较方便，结合 zustand 使用
    "next": "12.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "zustand": "^4.1.1" // 状态管理库，简单好用，typescript 支持 https://github.com/pmndrs/zustand
  },
  "devDependencies": {
    "@svgr/webpack": "^6.3.1",
    "@types/node": "18.7.9",
    "@types/react": "18.0.17",
    "@types/react-dom": "18.0.6",
    "autoprefixer": "^10.4.7",
    "eslint": "8.22.0",
    "eslint-config-next": "12.2.5",
    "postcss": "^8.4.14",
    "sass": "^1.54.5",
    "tailwindcss": "^3.1.2", // tailwindcss 样式管理库，https://tailwindcss.com/docs
    "typescript": "4.7.4"
  }
}
```

### 代码阅读说明

1. src/pages/\_app.tsx 了解 fluentui 和 react-query 两个库一些内容
2. src/pages/index.ts
3. src/layout/index.tsx
4. src/components/desktop_content.tsx

### 规范

1. 目录名： snake_case
2. 组件名： PascalCase （ index.tsx 除外 ）

### 其它

1. 获取登录凭证: 由于 login 页面不是在 desktop 项目里，所以需要从线上 sealos 获取登录凭证到本地开发: https://cloud.sealos.io/ 。复制 storage 里的 session 到 localhost 环境实现 mock 登录。

2. fluent v9 支持 ssr: https://react.fluentui.dev/?path=/docs/concepts-developer-server-side-rendering--page

3. TanStack Query 用法：https://cangsdarm.github.io/react-query-web-i18n/react

4. 使用 vscode 进行单步调试

   创建`.vscode/launch.json`文件,内容如下:

   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Next.js: debug",
         "type": "node-terminal",
         "request": "launch",
         "command": "pnpm run dev",
         "serverReadyAction": {
           "pattern": "started server on .+, url: (https?://.+)",
           "uriFormat": "%s",
           "action": "openExternally"
         }
       }
     ]
   }
   ```

   然后即可点击 vscode 的调试按钮进行调试,同时增加断点
