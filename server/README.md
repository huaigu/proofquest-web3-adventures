# ProofQuest Server

A Fastify-based API server for the ProofQuest Web3 quest platform, built with Bun runtime and Supabase integration.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) runtime installed
- Supabase project set up

### Installation

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. Apply database migrations:
   - Copy the SQL from `migrations/001_create_quests_table.sql`
   - Execute it in your Supabase SQL editor or dashboard

### Running the Server

**Development mode (with hot reload):**
```bash
bun run dev
```

**Production mode:**
```bash
bun run start
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Quest Management
- `GET /api/quests` - List all quests
  - Query parameters: `status`, `questType`, `limit`, `offset`
- `POST /api/quests` - Create a new quest (with optional `creatorAddress`)
- `GET /api/quests/:id` - Get quest by ID

### User Management
- `GET /api/users` - List users (with pagination and search)
  - Query parameters: `limit`, `offset`, `search`
- `POST /api/users` - Create or update user profile
- `GET /api/users/:address` - Get user profile by EVM address
- `PUT /api/users/:address` - Update user profile
- `DELETE /api/users/:address` - Delete user profile

### Quest Participation
- `POST /api/participations` - Join a quest
- `GET /api/participations/user/:address` - Get user's participations
  - Query parameters: `status`, `limit`, `offset`
- `GET /api/participations/quest/:questId` - Get quest participants
  - Query parameters: `status`, `limit`, `offset`
- `PUT /api/participations/:id` - Update participation (submit proof, change status)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `PORT` | Server port (default: 3001) | No |
| `HOST` | Server host (default: 0.0.0.0) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Database Schema

The server expects the following database tables:

### `quests` table
- Basic quest information (title, description, type)
- Task-specific configuration (Twitter interactions, quote tweets)
- Reward configuration (type, amounts, distribution)  
- Time configuration (start, end, claim deadlines)
- Creator linkage (creator_id references users.address)
- Metadata (created/updated timestamps, status)

### `users` table
- EVM address as primary key (validated format)
- Profile information (nickname, avatar, bio)
- Metadata (created/updated timestamps, last login)

### `quest_participations` table
- Links users to quests they participate in
- Participation status tracking (pending, completed, verified, rewarded)
- Proof submission (proof_data JSONB, proof_url)
- Timestamp tracking for each status change

See migration files in `migrations/` directory:
- `001_create_quests_table.sql` - Quest schema
- `002_create_users_table.sql` - User and participation schema

## Integration with Frontend

The server is designed to work with the React frontend:

1. **Data Validation**: Uses identical Zod schemas as the frontend CreateQuest form
2. **Type Safety**: Shared TypeScript interfaces for API communication
3. **CORS**: Configured to allow frontend origins
4. **Error Handling**: Returns structured errors matching frontend expectations

Start both servers for full development:
```bash
# Terminal 1: Frontend (from root directory)
npm run dev

# Terminal 2: Backend
cd server && bun run dev
```
