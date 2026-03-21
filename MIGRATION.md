# Database Migration Guide

本项目使用 TypeORM 进行数据库迁移管理。

## 配置

1. 复制 `.env.example` 为 `.env` 并配置数据库连接信息

```bash
cp .env.example .env
```

## 常用命令

### 运行所有待处理的迁移

```bash
npm run migration:run
```

### 生成新迁移（根据实体变化自动生成 SQL）

```bash
npm run migration:generate src/migrations/MigrationName
```

### 创建空迁移文件

```bash
npm run migration:create src/migrations/MigrationName
```

### 回滚最后一次迁移

```bash
npm run migration:revert
```

## 生产环境部署流程

1. 确保 `config/app.config.production.yaml` 中 `db.synchronize: false`
2. 部署前在 CI/CD 中运行迁移：

```bash
npm run migration:run
npm run start:prod
```

## 现有迁移

| 文件                             | 说明                                                    |
| -------------------------------- | ------------------------------------------------------- |
| `1700000000000-CreateUsersTable` | 创建用户表（id、name、email、password、role、isActive） |

> **注意**：密码重置令牌存储在 Redis 中（`password_reset:<token>`，TTL 1小时），无需数据库迁移。
