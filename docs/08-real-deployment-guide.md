# 08 - Helms 0.1 真实部署说明

> 本文说明如何把 Helms 0.1 从本地视觉验收推进到真实部署。Helms 0.1 仍然不改 Clawith 后端、数据库模型或 Agent Runtime；真实部署的本质是：使用 Helms overlay/patch 构建品牌化前端，并把前端静态站点反向代理到 Clawith 后端服务。

---

## 1. 部署目标

Helms 0.1 真实部署应包含：

1. Helms 品牌化前端静态站点；
2. Clawith 后端 API 服务；
3. 同域 `/api` 反向代理；
4. WebSocket `/ws` 反向代理；
5. PostgreSQL 数据库；
6. Redis；
7. 文件存储，使用本地持久化目录或 S3 兼容对象存储；
8. HTTPS、备份、日志和密钥管理。

不包含：

1. 新后端服务；
2. 新数据库表；
3. 自研模型网关；
4. 对 Clawith runtime 的深度改造；
5. 使用视觉验收 mock API 作为生产后端。

---

## 2. 推荐架构

```text
User Browser
  |
  | HTTPS
  v
Nginx / Caddy / Ingress
  |
  |-- /                -> Helms frontend static files
  |-- /assets/         -> Helms frontend hashed assets
  |-- /api/            -> Clawith backend :8000
  |-- /ws/             -> Clawith backend :8000
  |-- /p/              -> Clawith backend :8000
  |-- /minio/ optional -> MinIO or S3-compatible gateway

Clawith backend
  |
  |-- PostgreSQL
  |-- Redis
  |-- Local storage volume or S3-compatible object storage
  |-- Optional sandbox / Docker runtime
```

前端代码里的 API 基础路径是相对路径 `/api`，因此生产部署推荐同域代理，不推荐把浏览器直接指向跨域 API。

---

## 3. 构建 Helms 前端

在 Helms 仓库根目录执行：

```bash
git submodule update --init --recursive
bash scripts/build-helms.sh
bash scripts/smoke-test-helms.sh
```

构建完成后，前端静态产物位于：

```text
.work/clawith-helms/frontend/dist
```

部署静态站点时，把这个目录发布到 Nginx、Caddy、对象存储静态站点、CDN 或 Kubernetes 静态资源镜像中。

注意：

- 不要直接部署 `vendor/clawith/frontend/dist`，Helms 品牌和中文入口是在 `.work/clawith-helms` 中应用 overlay/patch 后生成的。
- `.work/` 是生成目录，不提交 Git；生产流水线应每次从 `vendor/clawith` + `helms-overlay` + `patches` 重新构建。

---

## 4. 后端服务

Helms 0.1 后端沿用 Clawith 后端。可以从以下目录构建后端镜像：

```text
.work/clawith-helms/backend
```

或在确认没有后端 patch 的情况下，从同一 submodule 版本的：

```text
vendor/clawith/backend
```

后端容器默认监听：

```text
0.0.0.0:8000
```

健康检查：

```bash
curl -f http://127.0.0.1:8000/api/health
```

后端 entrypoint 会根据 `PROCESS_ROLE` 处理数据库迁移。Clawith `v1.11.x`
还会在包含 `bootstrap` 的进程中初始化 LangGraph Checkpoint schema：

| 模式 | 说明 |
|---|---|
| `PROCESS_ROLE=all` | 单实例模式，包含 API、迁移和后台任务 |
| `PROCESS_ROLE=api` | 只运行 API，不执行迁移 |
| `PROCESS_ROLE=bootstrap,worker,connector` | 多实例后台角色，包含迁移和后台任务 |

小规模部署可以先使用 `PROCESS_ROLE=all`。多实例部署时，建议只让一个后台实例包含 `bootstrap`，避免多个实例同时迁移。

Durable Runtime 必须保持启用。群聊任务规划和共享上下文压缩使用平台级模型，生产启用这些能力前应在平台设置中配置对应模型，并将 UUID 写入：

```text
AGENT_RUNTIME_COMMAND_CONCURRENCY=10
MULTI_AGENT_PLANNING_MODEL_ID=<platform-model-uuid>
MULTI_AGENT_COMPACT_MODEL_ID=<platform-model-uuid>
```

从 Clawith `v1.10.x` 升级前，必须同时备份 PostgreSQL 与 Agent 文件/对象存储，并先在数据库副本上验证 Alembic 与 Checkpoint 初始化。

---

## 5. `/api` 反向代理

生产前端必须配置 SPA fallback 和 API/WebSocket 代理。Nginx 示例：

```nginx
server {
    listen 443 ssl http2;
    server_name helms.example.com;

    root /var/www/helms;
    index index.html;

    client_max_body_size 500m;

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass http://helms-backend:8000;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        client_max_body_size 500m;
    }

    location /ws/ {
        proxy_pass http://helms-backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    location /p/ {
        proxy_pass http://helms-backend:8000;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

如果使用 MinIO 并希望通过同一域名访问对象资源，可额外代理：

```nginx
location /minio/ {
    rewrite ^/minio/(.*)$ /$1 break;
    proxy_pass http://minio:9000;
    proxy_set_header Host minio:9000;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
    client_max_body_size 0;
}
```

---

## 6. 环境变量

### 6.1 必填

| 变量 | 示例 | 说明 |
|---|---|---|
| `SECRET_KEY` | 生成的高强度随机值 | 加密工具配置、Cookie 等敏感数据 |
| `JWT_SECRET_KEY` | 生成的高强度随机值 | JWT 签名密钥 |
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@postgres:5432/helms` | PostgreSQL 连接串 |
| `REDIS_URL` | `redis://redis:6379/0` | Redis 连接串 |
| `PUBLIC_BASE_URL` | `https://helms.example.com` | 邮件链接、OAuth 回调、Webhook 等公开地址 |
| `CORS_ORIGINS` | `["https://helms.example.com"]` | 允许的前端来源 |

不要使用默认值：

```text
change-me-in-production
change-me-jwt-secret
```

### 6.2 本地文件存储模式

适合单机、小规模试用或内网演示：

| 变量 | 示例 | 说明 |
|---|---|---|
| `STORAGE_BACKEND` | `local` | 使用本地文件系统 |
| `AGENT_DATA_DIR` | `/data/agents` | Agent 工作区目录 |
| `STORAGE_LOCAL_ROOT` | `/data/agents` | 文件存储根目录 |

必须把 `/data/agents` 挂载为持久化卷，并纳入备份。

### 6.3 S3/MinIO 对象存储模式

适合多实例和生产部署：

| 变量 | 示例 | 说明 |
|---|---|---|
| `STORAGE_BACKEND` | `s3` | 使用 S3 兼容对象存储 |
| `STORAGE_LOCAL_FALLBACK_ENABLED` | `true` | 迁移期允许读取本地旧文件 |
| `S3_BUCKET` | `helms` | Bucket 名称 |
| `S3_REGION` | `us-east-1` 或 `auto` | 区域 |
| `S3_ENDPOINT_URL` | `http://minio:9000` | S3 endpoint |
| `S3_ACCESS_KEY_ID` | 使用密钥管理注入 | Access key |
| `S3_SECRET_ACCESS_KEY` | 使用密钥管理注入 | Secret key |
| `S3_PREFIX` | `agents` | 对象前缀 |

MinIO 自托管时还需要：

| 变量 | 示例 | 说明 |
|---|---|---|
| `MINIO_ROOT_USER` | `helms` | MinIO 管理用户 |
| `MINIO_ROOT_PASSWORD` | 高强度随机值 | MinIO 管理密码 |

### 6.4 可选集成

| 变量 | 用途 |
|---|---|
| `FEISHU_APP_ID` / `FEISHU_APP_SECRET` / `FEISHU_REDIRECT_URI` | 飞书 SSO 或集成 |
| `JINA_API_KEY` | Jina Reader/Search 工具额度 |
| `EXA_API_KEY` | Exa 搜索工具 |
| `SANDBOX_TYPE` / `SANDBOX_API_KEY` / `SANDBOX_API_URL` | 远程 sandbox |
| `HTTP_PROXY` | 后端访问外网代理 |
| `PASSWORD_RESET_TOKEN_EXPIRE_MINUTES` | 密码重置链接有效期 |

SMTP 系统邮件目前可通过平台设置页面配置；启用前需确认邮箱、端口、SSL/TLS 和发件人策略。

---

## 7. 数据库和对象存储依赖清单

### 7.1 PostgreSQL

建议版本：

```text
PostgreSQL 15+
```

要求：

- 使用独立数据库和独立账号；
- 开启自动备份；
- 备份至少包含每日全量和必要的 WAL/PITR 策略；
- 禁止生产使用默认账号密码；
- 数据库连接串使用 `postgresql+asyncpg://`。

### 7.2 Redis

建议版本：

```text
Redis 7+
```

用途：

- 事件；
- 后台任务协调；
- 运行时状态和缓存。

要求：

- 生产部署启用持久化或明确接受缓存丢失；
- 私有网络访问；
- 设置访问控制或托管服务安全组。

### 7.3 文件存储

Helms/Clawith 会保存 Agent 工作区文件、上传文件、工具生成文件等。

可选方案：

| 方案 | 适用场景 | 必备措施 |
|---|---|---|
| 本地卷 `/data/agents` | 单机部署、试用环境 | 持久化卷、定期备份、容量监控 |
| MinIO | 私有化、多实例 | 独立卷、bucket 初始化、访问密钥轮换 |
| 云厂商 S3/GCS 兼容存储 | 生产和多地域 | IAM 最小权限、生命周期策略、跨区备份 |

### 7.4 Docker / Sandbox

上游 compose 会挂载：

```text
/var/run/docker.sock
```

并对后端容器启用较高权限，用于 Agent workspace、sandbox 或工具运行能力。生产环境需要单独评估：

- Docker socket 是否允许暴露给后端；
- 是否改用远程 sandbox；
- 是否需要网络隔离；
- 是否需要限制容器权限和资源配额。

---

## 8. 部署流程

### 8.1 构建阶段

```bash
git clone --recurse-submodules <helms-repo-url>
cd helms-platform

bash scripts/build-helms.sh
bash scripts/smoke-test-helms.sh
```

产物：

```text
.work/clawith-helms/frontend/dist
```

### 8.2 发布前端

将 `dist/` 发布到静态站点目录，例如：

```text
/var/www/helms
```

或打入前端 Nginx 镜像。

### 8.3 发布后端

构建后端镜像：

```bash
docker build -t helms-backend:0.1 .work/clawith-helms/backend
```

运行时挂载：

```text
/data/agents
/var/run/docker.sock  # 如需本地 Docker sandbox/Agent 容器能力
```

注入 `.env` 或平台密钥：

```text
SECRET_KEY
JWT_SECRET_KEY
DATABASE_URL
REDIS_URL
PUBLIC_BASE_URL
CORS_ORIGINS
STORAGE_BACKEND
```

### 8.4 配置反代

将 Nginx/Caddy/Ingress 的 `/api/` 和 `/ws/` 指向后端 `:8000`，将 `/` 指向 Helms 静态站点。

### 8.5 首次启动验证

```bash
curl -f https://helms.example.com/api/health
```

浏览器验证：

1. 打开 `https://helms.example.com/login`；
2. 页面标题应为 `Helms AI数字员工工作台`；
3. 注册或创建首个管理员；
4. 创建企业；
5. 配置模型供应商；
6. 创建第一个数字员工；
7. 打开 `/plaza`、`/dashboard`、`/agents/<id>/chat`；
8. 上传一个小文件，确认文件能保存和下载；
9. 发送一条对话，确认 WebSocket/API 正常。

---

## 9. Docker Compose 参考

Helms 提供了一个可执行部署包生成脚本：

```bash
bash scripts/create-helms-deploy-package.sh
```

生成目录：

```text
.work/helms-deploy-package
```

### 9.1 本地快速启动

启动前先确认 Docker daemon 可用，且 `3008` 没有被旧 Clawith/Helms 服务占用：

```bash
docker info
lsof -nP -iTCP:3008 -sTCP:LISTEN
```

如果 `3008` 已被占用，优先停止旧服务；也可以在 `.env` 中改用其他端口：

```text
FRONTEND_PORT=3018
```

生成并启动部署包：

```bash
bash scripts/create-helms-deploy-package.sh
cd .work/helms-deploy-package
cp .env.example .env
# Edit .env before production use.
docker compose up --build -d
```

启动成功后访问：

```text
http://127.0.0.1:3008/login
```

本地测试时若从浏览器访问 `127.0.0.1` 被本机代理或浏览器策略影响，可尝试：

```text
http://localhost:3008/login
```

### 9.2 镜像和依赖下载排障

如果 Docker Hub 拉取镜像失败，可在 `.env` 中把以下镜像改为你可访问的内网仓库或镜像加速地址：

```text
HELMS_PYTHON_BASE_IMAGE=python:3.12-slim
HELMS_NGINX_BASE_IMAGE=nginx:alpine
HELMS_POSTGRES_IMAGE=postgres:15-alpine
HELMS_REDIS_IMAGE=redis:7-alpine
HELMS_MINIO_IMAGE=minio/minio:RELEASE.2025-04-22T22-12-26Z
```

如果只是本机冒烟测试，且本机已有兼容镜像，也可以临时指向本地 tag，例如：

```text
HELMS_PYTHON_BASE_IMAGE=python:3.11-slim
HELMS_NGINX_BASE_IMAGE=nginx:latest
```

生产环境仍建议使用固定版本镜像，并通过可控的内网仓库或镜像源分发。若后端构建时访问 PyPI 超时，可在 `.env` 中配置 pip 镜像：

```text
CLAWITH_PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple
CLAWITH_PIP_TRUSTED_HOST=mirrors.aliyun.com
```

如果 apt 镜像偶发 `502 Bad Gateway`，通常重跑即可复用已完成的 Docker build cache：

```bash
docker compose up --build -d
```

### 9.3 MinIO 模式

如果要启用内置 MinIO：

```bash
sed -i.bak 's/^STORAGE_BACKEND=.*/STORAGE_BACKEND=s3/' .env
docker compose --profile s3 up --build -d
```

### 9.4 验收和关闭

查看容器状态：

```bash
docker compose ps
```

健康检查：

```bash
curl -f http://127.0.0.1:3008/api/health
curl -fsSI http://127.0.0.1:3008/login
curl -fsS http://127.0.0.1:3008/login | grep 'Helms AI数字员工工作台'
curl -fsS http://127.0.0.1:3008/login | grep '/helms/favicon.svg?v=20260622'
curl -fsS http://127.0.0.1:3008/helms/logo.svg | head
```

期望结果：

- `backend`、`postgres`、`redis` 为 healthy；
- `frontend` 映射 `0.0.0.0:3008->3000/tcp`；
- `/api/health` 返回 `status=ok`；版本字段以当前 Clawith 构建为准；
- `/login` 返回 200；
- 页面标题包含 `Helms AI数字员工工作台`；
- favicon 引用包含 `/helms/favicon.svg?v=20260622`；
- `/helms/logo.svg` 可访问。

查看日志：

```bash
docker compose logs --tail=120 backend
docker compose logs --tail=80 frontend
```

停止服务但保留数据卷：

```bash
docker compose down
```

删除本地测试数据卷时再使用：

```bash
docker compose down -v
```

该包包含 Helms 预构建前端、Clawith 后端源码、Nginx 静态站点镜像、PostgreSQL、Redis、可选 MinIO 和 `.env.example`。生成包位于 `.work/`，不进入 Git。

也可以参考上游：

```text
vendor/clawith/deploy/docker-compose.yml
vendor/clawith/deploy/docker-compose-multi.yml
```

使用时需要注意：

1. 前端必须替换为 Helms 构建产物，而不是直接使用 Clawith frontend；
2. `SECRET_KEY`、`JWT_SECRET_KEY`、PostgreSQL、MinIO 密码必须替换；
3. `PUBLIC_BASE_URL` 应设置为真实 HTTPS 域名；
4. `CORS_ORIGINS` 不应使用 `["*"]`；
5. 多实例部署推荐使用 S3/MinIO，不推荐共享本地目录；
6. Docker socket 和 privileged 权限需要安全评估。

---

## 10. 上线检查清单

| 项目 | 检查 |
|---|---|
| 构建 | `bash scripts/build-helms.sh` 成功 |
| 冒烟 | `bash scripts/smoke-test-helms.sh` 成功 |
| 品牌 | 登录页、title、favicon、logo 显示 Helms |
| 后端 | `/api/health` 返回成功 |
| 数据库 | migration 成功，连接池稳定 |
| Redis | 后端可连接，任务/事件正常 |
| 存储 | 上传、下载、预览文件正常 |
| WebSocket | `/ws/` 代理正常 |
| HTTPS | 证书有效，强制 HTTPS |
| 密钥 | 无默认密钥，无明文提交 |
| 备份 | PostgreSQL 和对象存储备份策略已配置 |
| 日志 | 后端、Nginx、数据库、对象存储日志可查询 |
| Attribution | Clawith LICENSE/attribution 未删除 |

---

## 11. Helms 0.1 边界说明

真实部署不改变 Helms 0.1 的产品边界：

- Helms 负责品牌、中文、构建和交付说明；
- Clawith 负责后端能力、Agent Runtime、工具、工作区、A2A/Crew/Aware 等；
- 视觉验收 mock API 只用于本地演示，不参与生产；
- 如果要把部署流程固化成一键生产 compose 或 Helm chart，应作为后续 0.2/0.3 任务处理。
