# 谢家印AI官网部署说明

当前官网已经部署在阿里云 ECS：

```text
http://47.245.89.27/
```

## 当前服务器状态

- 公网 IP：`47.245.89.27`
- 项目目录：`/opt/xiejiayin-ai-replier`
- 对外入口：Nginx `80`
- Node 服务：`127.0.0.1:8080`
- systemd 服务：`xiejiayin-ai-replier`
- 健康检查：`http://47.245.89.27/healthz`

架构：

```text
用户浏览器
  ↓
域名 / IP
  ↓
Nginx :80
  ↓
Node server.js :8080
  ↓
官网页面 + /api/reply
```

## 域名解析

在阿里云域名或云解析 DNS 控制台添加 A 记录：

| 配置项 | 值 |
|---|---|
| 记录类型 | `A` |
| 主机记录 | `@` 或 `www` |
| 记录值 | `47.245.89.27` |
| TTL | 默认即可 |

如果想让根域名和 `www` 都能访问，需要添加两条：

```text
@    A    47.245.89.27
www  A    47.245.89.27
```

解析生效后，可以在本地测试：

```bash
dig +short your-domain.com
dig +short www.your-domain.com
```

返回 `47.245.89.27` 就说明 DNS 已经生效。

## 配置 Nginx 域名

域名解析生效后，登录服务器：

```bash
ssh -i ~/.ssh/ttt_monitor_ed25519 root@47.245.89.27
```

编辑 Nginx 配置：

```bash
nano /etc/nginx/sites-available/xiejiayin-ai-replier
```

把：

```nginx
server_name _;
```

改成：

```nginx
server_name your-domain.com www.your-domain.com;
```

检查并重载：

```bash
nginx -t
systemctl reload nginx
```

## 配置 HTTPS

域名已经解析到服务器后，执行：

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot 会自动改 Nginx 配置并启用 HTTPS。

检查自动续期：

```bash
systemctl list-timers | grep certbot
certbot renew --dry-run
```

## 配置 DeepSeek

网站支持 DeepSeek 和 OpenAI。推荐先用 DeepSeek：

```bash
nano /etc/xiejiayin-ai-replier.env
```

写入：

```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 DeepSeek API Key
DEEPSEEK_MODEL=deepseek-v4-flash
```

重启服务：

```bash
systemctl restart xiejiayin-ai-replier
```

没有 API Key 时，网站会自动使用本地 Skill 模板兜底。

## 日常命令

查看服务：

```bash
systemctl status xiejiayin-ai-replier
systemctl status nginx
```

查看日志：

```bash
journalctl -u xiejiayin-ai-replier -n 80 --no-pager
journalctl -u nginx -n 80 --no-pager
```

重启服务：

```bash
systemctl restart xiejiayin-ai-replier
systemctl reload nginx
```

测试接口：

```bash
curl http://127.0.0.1:8080/healthz
curl http://127.0.0.1/healthz
curl -X POST http://127.0.0.1/api/reply \
  -H 'Content-Type: application/json' \
  --data '{"message":"为什么 Bitget 钱包这么难用","scene":"complaint","tone":"xie","emoji":true,"short":true}'
```

## 更新部署

从本地同步到服务器：

```bash
rsync -av --delete \
  -e 'ssh -i ~/.ssh/ttt_monitor_ed25519' \
  ./ root@47.245.89.27:/opt/xiejiayin-ai-replier/
```

然后重启：

```bash
ssh -i ~/.ssh/ttt_monitor_ed25519 root@47.245.89.27 \
  'systemctl restart xiejiayin-ai-replier'
```
