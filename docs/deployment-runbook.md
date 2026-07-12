# DS箱包AI创作平台独立部署 Runbook

本项目是箱包站，必须与服装站平行隔离。服装站正在正常使用，部署箱包站时不要修改服装站目录、进程、端口、Nginx server block、数据目录、上传目录、账号、积分或 API key。

## 隔离铁律

- 箱包站项目目录建议：`/srv/depthshop-bags/app`
- 箱包站 PM2 进程名：`store-picture-bag`
- 箱包站本地端口：`7777`
- 箱包站数据目录：`/srv/depthshop-bags/data`
- 箱包站上传目录：`/srv/depthshop-bags/uploads`
- 箱包站公网地址：`http://47.120.21.152:7777`
- 不使用服装站的 `STORE_DATA_DIR`、`STORE_UPLOAD_DIR`、PM2 进程名、端口或 Nginx 配置。

## 本地开发

```bash
npm install
npm run dev
```

本地统一访问 `http://localhost:7777`，避免占用服装站或其他项目常用的 `3000` 端口。

本地默认数据目录是 `.data-bags`。如需临时测试目录：

```bash
BAGS_STORE_DATA_DIR=/tmp/depthshop-bags-test-data \
BAGS_STORE_UPLOAD_DIR=/tmp/depthshop-bags-test-upload \
npm test
```

## 生产环境变量

在服务器上复制 `.env.bags.production.example` 为生产环境变量文件，只填箱包站自己的值。关键变量：

```bash
PORT=7777
APP_PUBLIC_BASE_URL=http://47.120.21.152:7777
NEXT_PUBLIC_APP_URL=http://47.120.21.152:7777
BAGS_STORE_DATA_DIR=/srv/depthshop-bags/data
BAGS_STORE_UPLOAD_DIR=/srv/depthshop-bags/uploads
ADMIN_PHONE_NUMBERS=
YUNWU_API_KEY=
ARK_VIDEO_API_KEY=
VIDEO_UPSCALE_API_KEY=
GENERATION_JOB_CONCURRENCY=1
```

正式上线建议生图、生视频、视频高清输出、风格解析和提示词代写全部使用箱包站独立 API key。短期本地测试可以临时复用供应商 key，但不能作为生产方案。

## 服务器目录准备

```bash
mkdir -p /srv/depthshop-bags/app
mkdir -p /srv/depthshop-bags/data
mkdir -p /srv/depthshop-bags/uploads
```

确保运行 Node/PM2 的用户对 `data` 和 `uploads` 有读写权限。

## Git 更新流程

箱包站使用独立仓库 `https://github.com/kehua2008/store_picture_bag.git`，服务器目录 `/srv/depthshop-bags/app` 已跟踪 `origin/main`。这套仓库、分支、服务器目录和 PM2 进程均不与服装站共用。

日常发布顺序：先在本地完成检查并推送到 `main`，再在箱包服务器运行：

```bash
cd /srv/depthshop-bags/app
npm run deploy:server
```

`deploy:server` 会依次执行 `git pull --ff-only origin main`、`npm ci`、`npm run build`、重启 `store-picture-bag` 并保存 PM2 配置。`--ff-only` 会在服务器存在未处理改动时停止发布，不会强制覆盖生产文件。

生产数据位于 `/srv/depthshop-bags/data`，环境变量位于 `.env.local`，两者均不进入 Git，也不会被上述发布命令覆盖。不要使用 `git reset --hard` 或面向该目录的 `rsync --delete` 作为常规发布方式。

## 首次部署

仅在全新服务器目录需要执行：

```bash
git clone https://github.com/kehua2008/store_picture_bag.git /srv/depthshop-bags/app
cd /srv/depthshop-bags/app
npm ci
npm run build
pm2 start npm --name store-picture-bag -- run start:bags
pm2 save
```

不要执行 `pm2 restart store-picture-maker`，那是服装站。

## Nginx 反代

新增箱包站自己的 server block，反代到 `127.0.0.1:7777`。不要修改服装站已有 server block。若服务器按端口直接访问，启动脚本已绑定 `0.0.0.0:7777`。

```nginx
server {
    listen 80;
    server_name bags.example.com;

    client_max_body_size 200m;

    location / {
        proxy_pass http://127.0.0.1:7777;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

启用 HTTPS 和正式域名后，再把 `APP_PUBLIC_BASE_URL` 和 `NEXT_PUBLIC_APP_URL` 改成对应的 `https://...` 地址。

## 健康检查

```bash
curl -I http://47.120.21.152:7777/
curl -sS http://47.120.21.152:7777/api/auth/me
PM2_APP_NAME=store-picture-bag npm run health:bags
pm2 status store-picture-bag
pm2 logs store-picture-bag --lines 100 --nostream
```

预期：

- 首页返回 `200`
- `/api/auth/me` 未登录时返回空用户和空账户
- PM2 中 `store-picture-bag` 为 `online`
- 健康检查显示的数据目录是 `/srv/depthshop-bags/data`，不是服装站目录

## 功能验收

- 服装站能继续访问，账号、积分、生成记录不变化。
- 箱包站注册/登录新账号，账号和服装站不互通。
- 箱包站充值审核只写入箱包站数据目录。
- 箱包站上传箱包素材并生图，积分冻结/扣除和生成记录都写入箱包站数据目录。
- 箱包站上传箱包素材或参考视频并生视频，供应商可以访问 `APP_PUBLIC_BASE_URL` 暴露的素材地址。
- 停止 `store-picture-bag` 不影响服装站；停止服装站不影响箱包站。

## 维护脚本

```bash
npm run health:bags
npm run cleanup:bags
npm run cleanup:bags -- --delete
```

`cleanup:bags` 默认只清理 `BAGS_STORE_DATA_DIR` 下过期生成文件。执行 `--delete` 前先看 dry-run 输出。
