# ProofQuest 数据库设置指南

## 🚀 快速开始

### 1. 测试数据库连接

```bash
bun run db:test
```

如果看到 "Tables not found" 错误，继续下一步。

### 2. 设置数据库表

1. 打开你的 [Supabase 项目](https://supabase.com/dashboard)
2. 进入 **SQL Editor**
3. 复制 `scripts/setup-database.sql` 文件的全部内容
4. 粘贴到 SQL Editor 中并点击 **Run**

### 3. 验证设置

```bash
bun run db:test
```

应该看到类似输出：
```
✅ Connection successful!
✅ User created: Test User
✅ Quest created: Test Quest - Database Verification
📊 Database Statistics:
   users: 4 records
   quests: 4 records  
   quest_participations: 3 records
```

### 4. 启动服务器

```bash
bun run dev
```

### 5. 测试 API

```bash
# 健康检查
curl http://localhost:3001/health

# 获取用户列表
curl http://localhost:3001/api/users

# 获取 Quest 列表
curl http://localhost:3001/api/quests
```

## 📋 Mock 数据说明

数据库初始化后包含：

### 👥 用户 (4个)
- **Alice Chen** - Web3 开发者
- **Bob Smith** - 加密货币交易者  
- **Charlie Wilson** - NFT 艺术家
- **Test User** - 测试用户

### 🎯 Quest (4个)
- Follow @ProofQuest on Twitter
- Like and Retweet Our Launch Post
- Quote Tweet with #Web3Quest
- Test Quest - Database Verification

### 🤝 参与记录 (3个)
- Bob 参与了关注任务（已完成）
- Charlie 参与了关注任务（待处理）
- Alice 参与了转发任务（已验证）

## 🔧 可用脚本

```bash
# 基本测试（推荐）
bun run db:test

# 完整初始化（高级）
bun run db:init

# 快速连接测试
bun run db:quick-test  

# API 端点测试
bun run test:api

# 启动开发服务器
bun run dev
```

## ⚠️ 故障排除

### 连接失败
- 检查 `.env` 文件中的 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
- 确认 Supabase 项目处于活跃状态

### 表不存在
- 运行 `scripts/setup-database.sql` 脚本
- 检查 SQL 执行是否有错误

### 权限错误
- 确认使用的是正确的 API 密钥
- 检查 Row Level Security 设置

## 🎯 下一步

1. ✅ 运行 `bun run db:test` 验证设置
2. ✅ 启动服务器 `bun run dev`
3. ✅ 连接前端应用
4. ✅ 开始开发！

---

需要帮助？检查 `scripts/README.md` 了解更多详细信息。