# CLAUDE.md - Server

This file provides guidance to Claude Code when working with the server-side code in this repository.

## Project Overview

ProofQuest Server is a Fastify-based API backend that powers the ProofQuest Web3 quest platform. It handles quest management, user authentication, reward distribution, and integrates with Supabase for data persistence and real-time features.

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
- **Supabase** - Backend-as-a-Service for database, auth, and real-time features

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
├── lib/                      # Utility libraries (planned)
│   ├── supabase.ts          # Supabase client configuration
│   ├── validation.ts        # Request validation schemas
│   └── utils.ts             # Helper functions
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

## Supabase Integration

### Database Schema
- **Users Table**: User profiles, wallet addresses, statistics
- **Quests Table**: Quest details, requirements, rewards
- **Participations Table**: User quest participation tracking
- **Completions Table**: Quest completion records and proofs
- **Rewards Table**: Reward distribution history

### Real-time Features
- Quest participation updates
- Leaderboard changes
- New quest notifications
- Completion status updates

### Authentication
- Supabase Auth integration with wallet-based login
- JWT token management
- Row Level Security (RLS) policies

## Development Configuration

### TypeScript Setup
- ES modules with `"type": "module"`
- Target: ESNext for modern JavaScript features
- Strict mode enabled for type safety
- Bundler module resolution for optimal imports

### Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3001
NODE_ENV=development

# Web3 Configuration
MONAD_RPC_URL=https://testnet1.monad.xyz
PRIVATE_KEY=your_server_wallet_private_key
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
- Real-time updates via Supabase WebSocket
- Optimistic updates for better UX
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
- SQL injection prevention via Supabase
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
- Supabase hosted database
- Server deployment on cloud platform
- CDN for static assets
- Monitoring and logging setup

---

*ProofQuest Server | Fastify + Supabase + Bun | Web3 Quest Platform Backend*