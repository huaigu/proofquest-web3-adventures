# ProofQuest API 使用示例

## 🌟 完整工作流程示例

### 1. 创建用户资料

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "nickname": "Web3 Explorer",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Explorer",
    "bio": "Passionate about Web3 and earning rewards through quests!"
  }'
```

**响应:**
```json
{
  "success": true,
  "data": {
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "nickname": "Web3 Explorer",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Explorer",
    "bio": "Passionate about Web3 and earning rewards through quests!",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### 2. 创建 Quest

```bash
curl -X POST http://localhost:3001/api/quests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Join Our Discord Community",
    "description": "Join our Discord server and introduce yourself in the #introductions channel. Be part of our growing community!",
    "questType": "twitter-interaction",
    "interactionType": "follow",
    "targetAccount": "@ProofQuestHQ", 
    "rewardType": "ETH",
    "totalRewardPool": 0.5,
    "rewardPerParticipant": 0.01,
    "distributionMethod": "immediate",
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-01-22T23:59:59Z",
    "rewardClaimDeadline": "2024-01-29T23:59:59Z",
    "agreeToTerms": true,
    "creatorAddress": "0x1234567890abcdef1234567890abcdef12345678"
  }'
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Join Our Discord Community",
    "status": "active",
    "questType": "twitter-interaction",
    "rewardType": "ETH",
    "totalRewardPool": 0.5,
    "rewardPerParticipant": 0.01,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 3. 参与 Quest

```bash
curl -X POST http://localhost:3001/api/participations \
  -H "Content-Type: application/json" \
  -d '{
    "userAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "questId": "550e8400-e29b-41d4-a716-446655440000",
    "proofUrl": "https://twitter.com/Web3Explorer/status/1234567890"
  }'
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "participation-uuid",
    "userAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "questId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "proofUrl": "https://twitter.com/Web3Explorer/status/1234567890",
    "joinedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 4. 提交完成证明

```bash
curl -X PUT http://localhost:3001/api/participations/participation-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "proofData": {
      "action": "follow",
      "timestamp": "2024-01-15T10:35:00Z",
      "verified": true
    }
  }'
```

### 5. 查询用户参与记录

```bash
curl http://localhost:3001/api/participations/user/0x1234567890abcdef1234567890abcdef12345678
```

**响应:**
```json
{
  "success": true,
  "data": {
    "participations": [
      {
        "id": "participation-uuid",
        "userAddress": "0x1234567890abcdef1234567890abcdef12345678",
        "questId": "550e8400-e29b-41d4-a716-446655440000",
        "status": "completed",
        "proofUrl": "https://twitter.com/Web3Explorer/status/1234567890",
        "joinedAt": "2024-01-15T10:30:00Z",
        "completedAt": "2024-01-15T10:35:00Z"
      }
    ],
    "total": 1
  }
}
```

## 🔍 查询示例

### 获取所有用户

```bash
curl "http://localhost:3001/api/users?limit=10&offset=0"
```

### 搜索用户

```bash
curl "http://localhost:3001/api/users?search=Alice"
```

### 获取活跃 Quest

```bash
curl "http://localhost:3001/api/quests?status=active&limit=10"
```

### 获取特定 Quest 的参与者

```bash
curl "http://localhost:3001/api/participations/quest/550e8400-e29b-41d4-a716-446655440000"
```

## 🎯 前端集成示例

### React Hook 示例

```typescript
// useQuests.ts
import { useState, useEffect } from 'react'

interface Quest {
  id: string
  title: string
  description: string
  status: string
  rewardType: string
  totalRewardPool: number
}

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/api/quests')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuests(data.data.quests)
        }
        setLoading(false)
      })
  }, [])

  return { quests, loading }
}
```

### Quest 参与函数

```typescript
async function joinQuest(
  userAddress: string, 
  questId: string, 
  proofUrl: string
) {
  const response = await fetch('http://localhost:3001/api/participations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userAddress,
      questId,
      proofUrl
    })
  })

  const result = await response.json()
  
  if (result.success) {
    console.log('Successfully joined quest!', result.data)
    return result.data
  } else {
    throw new Error(result.message)
  }
}
```

## 📱 状态流转示例

### Quest 参与状态流程

```
1. pending    -> 用户刚加入 quest
2. completed  -> 用户提交了完成证明
3. verified   -> 管理员验证了证明
4. rewarded   -> 奖励已发放
```

```bash
# 1. 加入 quest (状态: pending)
curl -X POST http://localhost:3001/api/participations -d '{...}'

# 2. 提交证明 (状态: completed)
curl -X PUT http://localhost:3001/api/participations/uuid -d '{
  "status": "completed",
  "proofUrl": "https://twitter.com/user/status/123"
}'

# 3. 管理员验证 (状态: verified)
curl -X PUT http://localhost:3001/api/participations/uuid -d '{
  "status": "verified"
}'

# 4. 发放奖励 (状态: rewarded)
curl -X PUT http://localhost:3001/api/participations/uuid -d '{
  "status": "rewarded"
}'
```

## 🚨 错误处理示例

### 处理验证错误

```json
{
  "error": "Validation Error",
  "message": "Invalid user data provided",
  "statusCode": 400,
  "details": [
    {
      "field": "address",
      "message": "Invalid EVM address format",
      "code": "invalid_string"
    }
  ]
}
```

### 处理重复参与

```json
{
  "error": "Already Participating",
  "message": "User is already participating in this quest",
  "statusCode": 409
}
```

## 🔒 安全考虑

### EVM 地址验证
- 地址必须是有效的 0x + 40位十六进制格式
- 地址会被自动转换为小写

### Quest 时间验证
- 只能参与处于活跃状态的 quest
- Quest 必须在开始时间之后、结束时间之前

### 防重复参与
- 每个用户每个 quest 只能参与一次
- 数据库唯一约束保证数据完整性

---

这些示例展示了 ProofQuest API 的完整使用流程，可以直接在你的前端应用中使用！