# 🧪 ProofQuest 测试脚本使用说明

## ✅ 脚本已创建成功！

我已经为你创建了完整的数据库初始化和测试脚本。以下是使用方法：

## 📋 可用脚本

```bash
# 1. 基本数据库测试（推荐首选）
bun run db:test

# 2. 完整数据库初始化
bun run db:init

# 3. 快速连接测试  
bun run db:quick-test

# 4. API端点测试
bun run test:api

# 5. 启动开发服务器
bun run dev
```

## 🚀 快速开始流程

### 第1步: 测试当前状态
```bash
bun run db:test
```

### 第2步: 设置数据库
如果看到 "Tables not found" 错误：

1. 打开 [Supabase SQL Editor](https://supabase.com/dashboard)
2. 复制 `scripts/setup-database.sql` 的全部内容
3. 粘贴到 SQL Editor 并执行

### 第3步: 验证设置
```bash
bun run db:test
```

应该看到:
```
✅ Connection successful!
✅ User created: Test User
✅ Quest created: Test Quest
📊 Database Statistics:
   users: 4 records
   quests: 4 records
   quest_participations: 3 records
```

### 第4步: 启动服务器
```bash
bun run dev
```

### 第5步: 测试API
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/users
```

## 📁 创建的文件

### 🗄️ 数据库脚本
- `scripts/setup-database.sql` - 完整SQL设置脚本
- `scripts/init-database.ts` - TypeScript自动化脚本
- `test-setup.ts` - 简化测试脚本

### 🧪 测试脚本
- `scripts/quick-test.ts` - 快速数据库测试
- `scripts/test-api.ts` - 完整API测试

### 📖 文档
- `SETUP.md` - 设置指南
- `EXAMPLE.md` - API使用示例
- `scripts/README.md` - 详细脚本说明

## 🎯 Mock数据内容

### 👥 用户 (3个 + 1个测试用户)
- **Alice Chen** - Web3开发者
- **Bob Smith** - 加密货币交易者
- **Charlie Wilson** - NFT艺术家
- **Test User** - 脚本生成的测试用户

### 🎯 Quest (3个 + 1个测试Quest)
- **Follow @ProofQuest** - Twitter关注任务
- **Like and Retweet** - 点赞转发任务  
- **Quote Tweet** - 引用推文任务
- **Test Quest** - 验证用Quest

### 🤝 参与记录 (3个)
- Bob → 关注任务 (已完成)
- Charlie → 关注任务 (待处理)
- Alice → 转发任务 (已验证)

## 🔧 故障排除

### 连接失败
```bash
# 检查环境变量
cat .env

# 应该包含:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 表不存在
- 运行 `scripts/setup-database.sql` 脚本
- 确认SQL执行无错误

### 脚本执行失败
```bash
# 直接运行脚本
bun test-setup.ts
bun scripts/quick-test.ts
```

## 🎉 下一步

1. ✅ 运行 `bun run db:test` 
2. ✅ 如需要，执行SQL设置脚本
3. ✅ 启动服务器 `bun run dev`
4. ✅ 连接前端应用
5. ✅ 开始开发！

---

所有脚本都已准备就绪，按照上述步骤即可完成数据库设置！