# NestJS + Next.js 全栈应用

一个基于 NestJS 和 Next.js 的全栈应用模板，集成 JWT 认证、Redis 缓存、MySQL 数据库、国际化支持。

## 技术栈

### 后端
- **NestJS** - 企业级 Node.js 框架
- **TypeORM** - ORM 数据库框架
- **MySQL** - 数据库
- **Redis** - 缓存
- **JWT** - 身份认证
- **Swagger** - API 文档
- **Winston** - 日志管理

### 前端
- **Next.js 14** - React 全栈框架 (App Router)
- **Tailwind CSS** - CSS 框架
- **next-intl** - 国际化

## 项目结构

```
├── app/                    # Next.js 应用目录
│   ├── [locale]/          # 国际化路由
│   │   ├── layout.tsx     # 布局
│   │   ├── page.tsx       # 首页
│   │   └── not-found.tsx  # 404 页面
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── config/                 # 环境配置文件
│   ├── app.config.development.yaml
│   ├── app.config.production.yaml
│   └── app.config.sit.yaml
├── lib/                    # 前端工具库
│   ├── api/               # API 请求
│   ├── hooks/             # React Hooks
│   └── store/             # Zustand 状态管理
├── messages/              # 国际化翻译文件
├── src/                   # NestJS 源码
│   ├── main.ts            # 入口文件
│   ├── app.module.ts      # 根模块
│   ├── common/            # 公共模块
│   │   ├── config/        # 配置
│   │   ├── decorators/    # 装饰器
│   │   ├── filters/       # 异常过滤器
│   │   ├── guards/        # 守卫
│   │   ├── interceptors/  # 拦截器
│   │   ├── middleware/    # 中间件
│   │   ├── helpers/       # 工具函数
│   │   └── logger/        # 日志模块
│   └── modules/           # 业务模块
│       ├── auth/          # 认证模块
│       ├── users/         # 用户模块
│       ├── next/          # Next.js 集成
│       ├── redis/         # Redis 模块
│       └── health/        # 健康检查
└── test/                  # 测试文件
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

### 配置

1. 创建配置文件：

```bash
cp config/app.config.development.yaml config/app.config.local.yaml
```

2. 修改配置文件中的数据库、Redis、JWT 等配置：

```yaml
# config/app.config.development.yaml
db:
  host: localhost
  port: 3306
  username: root
  password: your_password
  database: nest_next_app

redis:
  host: localhost
  port: 6379

jwt:
  secret: your-jwt-secret-key
  refreshSecret: your-refresh-secret-key
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

### 构建

```bash
# 开发环境构建
npm run build:dev

# SIT 环境构建
npm run build:sit

# 生产环境构建
npm run build:prod
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run start:dev` | 开发模式运行 |
| `npm run build` | 构建项目 |
| `npm run lint` | 代码检查 |
| `npm run format` | 代码格式化 |
| `npm run test` | 运行测试 |

## API 文档

启动项目后访问：http://localhost:3000/docs

## API 路由

### 认证模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/register` | 用户注册 |
| POST | `/auth/login` | 用户登录 |
| POST | `/auth/refresh` | 刷新 Token |
| POST | `/auth/logout` | 退出登录 |

### 用户模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/users` | 获取用户列表 |
| GET | `/users/profile` | 获取当前用户 |
| GET | `/users/:id` | 获取用户详情 |
| POST | `/users` | 创建用户 |
| DELETE | `/users/:id` | 删除用户 |

### 健康检查
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |

## 路由架构

```
请求 → NestJS 服务器
         ↓
    匹配 API 路由? (/auth/*, /users/*)
         ↓              ↓
        是             否
         ↓              ↓
    Nest 处理     Next.js 渲染页面
                       ↓
              /en/*, /zh/* (国际化路由)
```

## 环境配置

项目使用 YAML 配置文件管理不同环境：

| 文件 | 环境 |
|------|------|
| `app.config.development.yaml` | 开发环境 |
| `app.config.sit.yaml` | 测试环境 |
| `app.config.production.yaml` | 生产环境 |

通过 `NODE_ENV` 环境变量切换：

```bash
NODE_ENV=development npm run start:dev
NODE_ENV=sit npm run start:sit
NODE_ENV=production npm run start:prod
```

## 国际化

支持中文和英文，路由前缀：
- `/zh/*` - 中文
- `/en/*` - 英文

翻译文件位于 `messages/` 目录。

## 代码规范

- **ESLint + Prettier** - 代码格式化
- **Husky + lint-staged** - 提交前检查
- **Commitlint** - 提交信息规范

## License

MIT
