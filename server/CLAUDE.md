# CLAUDE.md - Server

This file provides guidance to Claude Code when working with the server-side code in this repository.

## Project Overview

ProofQuest Server is a Fastify-based API backend that powers the ProofQuest Web3 quest platform. It handles quest management, user authentication, reward distribution, and uses lowdb for local JSON-based data persistence - perfect for hackathon development.

## Development Commands

### Essential Commands
- `bun run index.ts` - Start the server in development mode
- `bun install` - Install dependencies
- `bun run dev` - Start development server with hot reload (if configured)
- `bun run build` - Build production bundle (if configured)
- `bun test` - Run tests (if configured)

### Package Management
- Uses **Bun** as the primary package manager and runtime
- `bun.lockb` for dependency lock file
- Compatible with Node.js ecosystem packages

## Architecture & Tech Stack

### Core Technologies
- **Bun** - JavaScript runtime and package manager
- **TypeScript** - Type-safe JavaScript development
- **Fastify** - High-performance web framework
- **lowdb** - Simple JSON file database for hackathon development

### Project Structure
```
server/
├── index.ts                   # Main application entry point
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── bun.lockb                 # Bun lock file
├── routes/                   # API route handlers (planned)
│   ├── quests.ts            # Quest management endpoints
│   ├── users.ts             # User profile endpoints
│   └── auth.ts              # Authentication endpoints
├── lib/                      # Utility libraries
│   ├── database.ts          # lowdb database service
│   ├── eventIndexer.ts      # Blockchain event indexing
│   ├── questStatusCalculator.ts # Quest status management
│   ├── validation.ts        # Request validation schemas
│   └── auth.ts              # Authentication utilities
├── middleware/               # Fastify middleware (planned)
│   ├── auth.ts              # Authentication middleware
│   └── cors.ts              # CORS configuration
└── types/                    # TypeScript type definitions (planned)
    ├── quest.ts             # Quest-related types
    └── user.ts              # User-related types
```

## API Endpoints (Planned)

### Quest Management
- `GET /api/quests` - List all quests with filtering and pagination
- `GET /api/quests/:id` - Get quest details
- `POST /api/quests` - Create new quest (authenticated)
- `PUT /api/quests/:id` - Update quest (owner only)
- `DELETE /api/quests/:id` - Delete quest (owner only)
- `POST /api/quests/:id/participate` - Join quest
- `POST /api/quests/:id/complete` - Submit quest completion

### User Management
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/leaderboard` - Get top earners leaderboard

### Authentication
- `POST /api/auth/wallet` - Wallet-based authentication
- `POST /api/auth/refresh` - Refresh authentication token
- `POST /api/auth/logout` - Logout user

## Database Integration

### lowdb JSON Database
The server uses lowdb for local JSON file-based data storage, perfect for hackathon development:

- **File Location**: `./data/database.json`
- **Schema**: Defined in `types/database.ts`
- **Service**: `lib/database.ts` provides full CRUD operations

### Database Schema
The JSON database contains the following collections:
- **quests**: Quest details, requirements, rewards, status
- **participations**: User quest participation tracking with rewards
- **indexerState**: Blockchain event indexing state

### Data Structure
```json
{
  "quests": [],
  "participations": [],
  "indexerState": {
    "lastProcessedBlock": 0,
    "lastUpdated": 0,
    "contractAddress": "",
    "contractDeployBlock": 0
  }
}
```

### Database Operations
- All operations are asynchronous and use file I/O
- Automatic data persistence with each write operation
- Built-in backup functionality
- Statistics calculation methods for analytics

## Development Configuration

### TypeScript Setup
- ES modules with `"type": "module"`
- Target: ESNext for modern JavaScript features
- Strict mode enabled for type safety
- Bundler module resolution for optimal imports

### Environment Variables
```env
# Server Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Web3 Configuration
MONAD_RPC_URL=https://testnet1.monad.xyz
PRIVATE_KEY=your_server_wallet_private_key

# Database Configuration (lowdb)
DATABASE_PATH=./data  # Optional: defaults to ./data
```

### Fastify Configuration
- CORS enabled for frontend integration
- JSON schema validation for requests
- Error handling middleware
- Request logging in development
- Rate limiting for production

## Development Patterns

### Code Organization
- Route handlers in `/routes` directory
- Business logic in service classes
- Database operations in repository pattern
- Type definitions in `/types` directory
- Utility functions in `/lib` directory

### Error Handling
- Consistent error response format
- HTTP status codes following REST conventions
- Detailed error logging for debugging
- User-friendly error messages

### Validation
- JSON schema validation using Fastify's built-in features
- TypeScript types for compile-time safety
- Input sanitization for security

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- Database tests with test fixtures
- End-to-end tests with frontend integration

## Integration with Frontend

### API Communication
- RESTful API design
- JSON request/response format
- CORS configuration for localhost development
- Authentication via Bearer tokens

### Data Synchronization
- File-based persistence with lowdb
- Polling-based updates for real-time feel
- Error recovery and retry logic

### Development Workflow
- Server runs on `http://localhost:3001`
- Frontend proxy configuration in Vite
- Shared TypeScript types between frontend and backend

## Security Considerations

### Authentication & Authorization
- Wallet signature verification
- JWT token validation
- Role-based access control
- Request rate limiting

### Data Protection
- Input validation and sanitization
- File system security for JSON database
- XSS protection
- Secure headers configuration

### Web3 Security
- Smart contract interaction validation
- Transaction verification
- Private key protection
- Secure reward distribution

## Deployment

### Production Build
- Bun build optimization
- Environment variable configuration
- Database migration scripts
- Health check endpoints

### Infrastructure
- Local JSON file database (lowdb)
- Server deployment on cloud platform
- File system backup strategies
- Monitoring and logging setup

## Hackathon Development Notes

### Quick Setup
1. Clone repository
2. `cd server && bun install`
3. `bun run index.ts`
4. Database file automatically created at `./data/database.json`

### Data Persistence
- All data stored in JSON file
- Automatic backups available via API
- Easy to inspect and debug
- Perfect for rapid prototyping

### Migration from Supabase
- All Supabase dependencies removed
- Database operations converted to lowdb
- Environment variables simplified
- No external service dependencies

---

*ProofQuest Server | Fastify + lowdb + Bun | Web3 Quest Platform Backend*