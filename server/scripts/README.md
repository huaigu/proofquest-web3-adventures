# ProofQuest Database Setup Scripts

这个目录包含了初始化和测试ProofQuest数据库的脚本。

## 📁 文件说明

### 🗄️ 数据库设置
- **`setup-database.sql`** - 完整的SQL脚本，创建所有表、索引和mock数据
- **`init-database.ts`** - TypeScript脚本，自动执行数据库初始化

### 🧪 测试脚本
- **`quick-test.ts`** - 快速测试数据库连接和基本操作
- **`test-api.ts`** - 完整的API端点测试

## 🚀 使用步骤

### 1. 设置环境变量

确保 `.env` 文件包含正确的Supabase配置：

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 2. 初始化数据库

#### 方法A: 使用SQL脚本 (推荐)

1. 打开Supabase项目的SQL编辑器
2. 复制 `setup-database.sql` 的内容
3. 执行整个脚本

#### 方法B: 使用TypeScript脚本

```bash
# 运行初始化脚本
bun run db:init

# 或者直接运行
bun scripts/init-database.ts
```

### 3. 验证设置

```bash
# 快速测试数据库连接
bun run db:quick-test

# 或者直接运行
bun scripts/quick-test.ts
```

### 4. 测试API端点

```bash
# 启动服务器并测试所有API端点
bun run test:api

# 或者直接运行
bun scripts/test-api.ts
```

## 📊 Mock数据说明

### 用户数据
- **Alice Chen** (`0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685`) - Web3开发者
- **Bob Smith** (`0x8ba1f109551bd432803012645hac136c5532c21c`) - 加密货币交易者
- **Charlie Wilson** (`0x1234567890123456789012345678901234567890`) - NFT艺术家

### Quest数据
1. **Follow @ProofQuest on Twitter** - 关注任务
2. **Like and Retweet Our Launch Post** - 点赞转发任务
3. **Quote Tweet with #Web3Quest** - 引用推文任务

### 参与数据
- Bob参与了关注任务（已完成）
- Charlie参与了关注任务（待处理）
- Alice参与了点赞转发任务（已验证）

## 🔍 验证查询

执行这些SQL查询来验证数据：

```sql
-- 检查表记录数
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Quests' as table_name, COUNT(*) as count FROM quests  
UNION ALL
SELECT 'Participations' as table_name, COUNT(*) as count FROM quest_participations;

-- 查看Quest和创建者信息
SELECT 
    q.title,
    q.quest_type,
    q.status,
    u.nickname as creator_nickname,
    q.total_reward_pool,
    COUNT(p.id) as participant_count
FROM quests q
LEFT JOIN users u ON q.creator_id = u.address
LEFT JOIN quest_participations p ON q.id = p.quest_id
GROUP BY q.id, q.title, q.quest_type, q.status, u.nickname, q.total_reward_pool
ORDER BY q.created_at;
```

## ⚠️ 故障排除

### 连接错误
- 确保 `SUPABASE_URL` 是API端点而不是dashboard链接
- 验证 `SUPABASE_ANON_KEY` 是否正确

### 表不存在错误
- 运行 `setup-database.sql` 脚本
- 检查Supabase项目是否已激活

### 权限错误
- 确保RLS策略允许操作
- 检查API密钥权限

### 数据插入失败
- 检查外键约束
- 验证数据格式（特别是EVM地址格式）

## 🛠️ 自定义Mock数据

如需自定义mock数据，编辑以下部分：

1. **`setup-database.sql`** - 修改INSERT语句
2. **`init-database.ts`** - 修改mockUsers、mockQuests等数组
3. **`quick-test.ts`** - 修改测试数据

## 📝 API测试端点

`test-api.ts` 脚本测试以下端点：

- **Health**: `GET /health`
- **Users**: `GET/POST/PUT/DELETE /api/users`
- **Quests**: `GET/POST /api/quests`
- **Participations**: `GET/POST/PUT /api/participations`

## 🎯 下一步

1. 运行数据库设置脚本
2. 启动服务器: `bun run dev`
3. 在浏览器中访问: `http://localhost:3001/health`
4. 使用API客户端测试端点
5. 连接前端应用

---

如有问题，请检查Supabase项目日志和服务器控制台输出。