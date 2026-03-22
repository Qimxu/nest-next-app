# NestJS + Next.js 全栈应用模板

[![CI](https://github.com/Qimxu/nest-next-app/actions/workflows/ci.yml/badge.svg)](https://github.com/Qimxu/nest-next-app/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Qimxu/nest-next-app/branch/main/graph/badge.svg)](https://codecov.io/gh/Qimxu/nest-next-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

一个基于 NestJS 和 Next.js 的全栈 SSR 模板，集成 JWT 认证、Redis 缓存、MySQL 数据库、国际化支持。

> 架构设计详见 [ARCHITECTURE.md](./ARCHITECTURE.md)

## 技术栈

### 后端

- **NestJS** - 企业级 Node.js 框架
- **TypeORM** - ORM 数据库框架
- **MySQL** - 数据库
- **Redis** - Token 黑名单 / Refresh Token 存储
- **JWT** - 双 Token 身份认证（Access + Refresh）
- **Swagger** - API 文档
- **Winston** - 结构化日志

### 前端

- **Next.js 14** - React 全栈框架 (App Router)
- **Tailwind CSS** - CSS 框架
- **next-intl** - 国际化 (zh / en)

## 项目结构

```
nest-next-app/
├── app/                          # Next.js App Router
│   └── [locale]/
│       ├── layout.tsx            # SSR 入口：并行获取 i18n + 完整用户
│       ├── page.tsx
│       ├── login/page.tsx
│       ├── register/page.tsx
│       ├── forgot-password/page.tsx
│       └── reset-password/page.tsx
├── config/                       # YAML 多环境配置
│   ├── app.config.development.yaml
│   ├── app.config.sit.yaml
│   ├── app.config.production.yaml
│   └── app.config.local.yaml.example
├── lib/                          # 前端工具库
│   ├── auth/
│   │   ├── server.ts             # SSR 用：decodeJwt + getServerFullUser
│   │   └── context.tsx           # 客户端 AuthProvider + useAuth
│   ├── components/
│   │   └── Navbar.tsx            # 顶部导航（语言切换 + 登录状态）
│   ├── i18n/
│   │   └── LanguageSwitcher.tsx  # 语言切换组件
│   └── request/index.ts          # HttpClient + TokenManager
├── messages/                     # i18n 翻译文件
│   ├── zh.json
│   └── en.json
├── scripts/
│   └── seed.ts                   # 初始化管理员账号
├── services/
│   ├── auth.ts                   # authApi
│   └── users.ts                  # usersApi + User 类型
├── src/                          # NestJS 后端
│   ├── main.ts
│   ├── app.module.ts
│   ├── core/                     # 基础设施层
│   │   ├── config/               # 配置加载 / Joi 验证
│   │   ├── decorators/           # @Public() @Roles() @Throttle()
│   │   ├── filters/              # HttpExceptionFilter
│   │   ├── guards/               # RolesGuard
│   │   ├── interceptors/         # TransformInterceptor / LogInterceptor / ThrottleInterceptor
│   │   ├── logger/               # Winston 日志模块
│   │   ├── pipes/                # SanitizePipe（XSS 防护）
│   │   └── utils/
│   ├── migrations/               # TypeORM 迁移文件
│   ├── middlewares/              # SecurityMiddleware（HTTP 安全头）
│   └── modules/                  # 业务模块
│       ├── auth/                 # JWT 认证 / 忘记密码
│       ├── users/                # 用户 CRUD
│       ├── redis/                # Redis 模块
│       ├── health/               # 健康检查
│       └── next/                 # Next.js 集成（catch-all 路由）
├── static/                       # 静态文件目录
├── test/                         # E2E 测试
│   └── auth.e2e-spec.ts
├── data-source.ts                # TypeORM CLI DataSource
├── Dockerfile
├── docker-compose.yml            # 开发依赖（MySQL + Redis）
└── docker-compose.prod.yml       # 生产部署（app + MySQL + Redis）
```

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0
- Redis >= 6.0

### 安装依赖

```bash
npm install
```

### 使用 Docker 启动依赖（推荐）

```bash
docker compose up -d
```

### 配置

1. 创建本地配置文件：

```bash
cp config/app.config.local.yaml.example config/app.config.local.yaml
```

2. 修改配置中的数据库、Redis、JWT 配置：

```yaml
db:
  host: localhost
  password: your_password

jwt:
  secret: your-jwt-secret-key-at-least-32-chars
  refreshSecret: your-refresh-secret-key-at-least-32-chars
```

### 初始化数据库

```bash
# 执行迁移，创建 users 表
npm run migration:run

# 创建初始管理员账号
npm run seed
# 默认账号: admin@example.com / Admin@123456
```

### 运行

```bash
# 开发环境
npm run start:dev

# SIT 环境
npm run start:sit

# 生产环境
npm run start:prod
```

## 常用命令

| 命令                       | 说明                                |
| -------------------------- | ----------------------------------- |
| `npm run start:dev`        | 开发模式                            |
| `npm run start`            | 生产构建                            |
| `npm run lint`             | 代码检查并修复                      |
| `npm run test`             | 运行单元测试                        |
| `npm run test:cov`         | 运行测试并生成覆盖率报告            |
| `npm run test:e2e`         | 运行 E2E 测试（需要 MySQL + Redis） |
| `npm run migration:run`    | 执行数据库迁移                      |
| `npm run migration:revert` | 回滚最后一次迁移                    |
| `npm run seed`             | 初始化管理员账号                    |

## API 文档

启动后访问：`http://localhost:3000/docs`

## API 路由

### 认证模块（`/auth`）

| 方法 | 路径                       | 权限 | 限流      | 说明                                 |
| ---- | -------------------------- | ---- | --------- | ------------------------------------ |
| POST | `/auth/register`           | 公开 | 5次/分钟  | 用户注册                             |
| POST | `/auth/login`              | 公开 | 10次/分钟 | 用户登录                             |
| POST | `/auth/refresh`            | 公开 | —         | 刷新 Token（同时轮换 Refresh Token） |
| POST | `/auth/logout`             | 登录 | —         | 退出登录                             |
| POST | `/auth/forgot-password`    | 公开 | 3次/分钟  | 发起密码重置                         |
| POST | `/auth/verify-reset-token` | 公开 | —         | 验证重置令牌                         |
| POST | `/auth/reset-password`     | 公开 | —         | 重置密码                             |

### 用户模块（`/users`）

| 方法   | 路径             | 权限  | 说明             |
| ------ | ---------------- | ----- | ---------------- |
| GET    | `/users`         | Admin | 用户列表（分页） |
| GET    | `/users/profile` | 登录  | 当前用户信息     |
| GET    | `/users/:id`     | 登录  | 用户详情         |
| POST   | `/users`         | Admin | 创建用户         |
| PATCH  | `/users/:id`     | Admin | 更新用户         |
| DELETE | `/users/:id`     | Admin | 删除用户         |

### 其他

| 方法 | 路径      | 说明     |
| ---- | --------- | -------- |
| GET  | `/health` | 健康检查 |

## 生产部署

### 使用 Docker Compose

```bash
# 1. 复制并填写环境变量
cp .env.example .env
# 编辑 .env，填入真实的 DB_PASSWORD、JWT_SECRET 等

# 2. 一键启动
docker compose -f docker-compose.prod.yml up -d

# 3. 执行迁移 + seed（首次部署）
docker compose -f docker-compose.prod.yml exec app npm run migration:run
docker compose -f docker-compose.prod.yml exec app npm run seed
```

## 环境配置

| 文件                          | 环境     | 优先级 |
| ----------------------------- | -------- | ------ |
| `.env`                        | 所有     | 最低   |
| `app.config.local.yaml`       | 本地覆盖 | 最高   |
| `app.config.development.yaml` | 开发     | —      |
| `app.config.sit.yaml`         | 测试     | —      |
| `app.config.production.yaml`  | 生产     | —      |

通过 `NODE_ENV` 选择配置文件：

```bash
NODE_ENV=production npm run start:prod
```

## 国际化

支持中文和英文，路由前缀：`/zh/*`、`/en/*`

翻译文件位于 `messages/` 目录。

## 代码规范

- **ESLint + Prettier** — 代码格式化
- **Husky + lint-staged** — 提交前自动检查
- **Commitlint** — Conventional Commits 规范

## 贡献

见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## Security

见 [SECURITY.md](./SECURITY.md)。

## License

[MIT](./LICENSE) © 2026 [Qimxu](https://github.com/Qimxu)
