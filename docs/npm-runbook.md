# NPM 启动与停止

这份文档只说明本项目在本地怎么启动、停止和检查。

## 启动

在项目根目录执行：

```bash
npm install
npm run dev -- --hostname 127.0.0.1
```

说明：

- 第一次运行前先 `npm install`
- `npm run dev` 会启动 Next.js 本地开发服务
- 默认访问地址是 `http://127.0.0.1:3000`
- 如果 3000 被占用，Next 会自动切到别的端口；终端里会显示新的地址

## 停止

如果是在当前终端里启动的：

```text
Ctrl + C
```

如果是后台进程，还在占着端口：

```bash
kill <pid>
```

先用下面命令找到进程：

```bash
lsof -i :3000
```

## 常用检查

```bash
npm test
npm run typecheck
npm run build
```

## 说明

- `npm test` 跑单元测试
- `npm run typecheck` 跑 TypeScript 类型检查
- `npm run build` 检查生产构建是否通过
- 这个项目当前主要用 `npm run dev` 做提示词磨合和页面测试
