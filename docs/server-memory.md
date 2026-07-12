# DS箱包站服务器运维记忆

本文件只记录箱包站运维策略。服装站正在独立运行，不要在箱包站维护过程中重启、迁移或修改服装站进程和数据。

## 箱包站生产建议

- Project path: `/srv/depthshop-bags/app`
- PM2 app name: `store-picture-bag`
- Local Next.js port: `3102`
- Public URL: `http://47.120.21.152:7777`
- Data dir: `/srv/depthshop-bags/data`
- Upload dir: `/srv/depthshop-bags/uploads`
- Required public URL env: `APP_PUBLIC_BASE_URL=http://47.120.21.152:7777`

## 低内存策略

如果箱包站与服装站同机部署，稳定性优先于并发：

- `GENERATION_JOB_CONCURRENCY=1`
- 生图、生视频、超分使用箱包站独立 API key，避免额度和限流牵连服装站。
- 生成图片和视频只保存文件 URL，不把大 base64 长期保存在任务 JSON 中。
- 历史生成文件默认按 24 小时维护策略清理。
- 维护脚本只读取 `BAGS_STORE_DATA_DIR`，不要传入服装站数据目录。

## 维护命令

```bash
npm run verify:isolation
PM2_APP_NAME=store-picture-bag npm run health:bags
npm run cleanup:bags
npm run cleanup:bags -- --hours=24
```

`cleanup:bags` 默认 dry-run。只有确认候选文件属于箱包站数据目录后，才可以追加 `--delete`。

## 故障排查边界

- 排查箱包站只看 `store-picture-bag` 进程和箱包站 Nginx server block。
- 不执行 `pm2 restart store-picture-maker`。
- 不读取或编辑服装站 `.data`、上传目录、充值流水或用户文件。
- 如果箱包站生视频提示素材公网不可访问，优先检查箱包站 `APP_PUBLIC_BASE_URL` 和 Nginx 域名，而不是服装站配置。
