# ProofQuest - Web3 Quest Platform

ProofQuest is a comprehensive Web3 quest platform that allows users to complete Web2 tasks and earn Web3 rewards with zero-knowledge proof verification. The platform consists of three main components: a React frontend, a Fastify backend server, and Ethereum smart contracts.

## 🏗️ System Architecture

```
ProofQuest Platform
├── Frontend (React SPA)           # User interface and Web3 integration
├── Backend (Fastify + Bun)        # API server and business logic
└── Smart Contracts (Solidity)     # On-chain quest management and rewards
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm** (for frontend)
- **Bun** runtime (for backend) - [Install Bun](https://bun.sh/)
- **Foundry** (for smart contracts) - [Install Foundry](https://book.getfoundry.sh/)

### Development Setup

1. **Clone the repository:**
```bash
git clone <YOUR_GIT_URL>
cd proofquest-web3-adventures
```

2. **Start the frontend (Terminal 1):**
```bash
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

3. **Start the backend (Terminal 2):**
```bash
cd server
bun install
bun run index.ts
# Backend runs on http://localhost:3001
```

4. **Smart contracts (Terminal 3):**
```bash
cd contracts
forge build
forge test
```

## 📁 Project Structure

### Frontend (`/src`)
Modern React SPA with TypeScript and Web3 integration.

```
src/
├── components/
│   ├── Navigation.tsx              # Main navigation with wallet connection
│   └── ui/                         # shadcn/ui component library
├── pages/
│   ├── Index.tsx                   # Dashboard with stats and trending quests
│   ├── QuestList.tsx              # Quest browsing and filtering
│   ├── QuestDetail.tsx            # Individual quest view and participation
│   ├── Profile.tsx                # User profile and statistics
│   ├── CreateQuest.tsx            # Quest creation form
│   └── Guide.tsx                  # Platform guide and documentation
├── hooks/
│   ├── useQuests.ts               # Quest data management
│   ├── useProfile.ts              # User profile management
│   ├── useDashboard.ts            # Dashboard statistics
│   └── useAuth.ts                 # Wallet authentication
├── lib/
│   ├── wagmi.ts                   # Web3 configuration (Monad testnet)
│   ├── api.ts                     # Backend API communication
│   ├── questContract.ts           # Smart contract interactions
│   └── utils.ts                   # Utility functions
└── types/                         # TypeScript type definitions
```

### Backend (`/server`)
High-performance API server built with Fastify and Bun runtime.

```
server/
├── index.ts                       # Main application entry point
├── routes/
│   ├── quests.ts                  # Quest management endpoints
│   ├── users.ts                   # User profile endpoints
│   ├── participations.ts          # Quest participation tracking
│   ├── auth.ts                    # Wallet-based authentication
│   └── dashboard.ts               # Analytics and statistics
├── lib/
│   ├── database.ts                # Supabase database service
│   ├── auth.ts                    # JWT and wallet signature validation
│   ├── eventIndexer.ts            # Blockchain event indexing
│   ├── questStatusCalculator.ts   # Quest status and reward logic
│   └── validation.ts              # Request validation schemas
├── middleware/
│   ├── cors.ts                    # CORS configuration
│   └── authMiddleware.ts          # Authentication middleware
└── types/                         # Shared TypeScript types
```

### Smart Contracts (`/contracts`)
Ethereum smart contracts built with Foundry and Solidity.

```
contracts/
├── src/
│   ├── QuestSystem.sol            # Main quest management contract
│   ├── mocks/
│   │   ├── MockPrimusZKTLS.sol    # Mock ZKTLS for testing
│   │   └── SimpleQuestSystem.sol  # Simplified quest contract
│   └── utils/
│       ├── JsonParser.sol         # JSON parsing utilities
│       └── StringUtils.sol        # String manipulation utilities
├── script/
│   ├── DeployQuestSystem.s.sol    # Deployment scripts
│   └── SepoliaTestScript.s.sol    # Testing scripts
├── test/                          # Comprehensive test suite
└── lib/                           # External dependencies (Forge, OpenZeppelin)
```

## 🛠️ Technology Stack

### Frontend Technologies
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **TanStack React Query** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library built on Radix UI
- **RainbowKit + Wagmi** - Web3 wallet connection and interactions

### Backend Technologies  
- **Bun** - Fast JavaScript runtime and package manager
- **Fastify** - High-performance web framework
- **TypeScript** - Type-safe server development
- **Supabase** - Backend-as-a-Service for database and authentication
- **JWT** - Secure authentication tokens
- **Zod** - Runtime type validation

### Smart Contract Technologies
- **Solidity** - Smart contract programming language
- **Foundry** - Development framework (Forge, Cast, Anvil)
- **OpenZeppelin** - Security-focused contract libraries
- **ZKTLS Integration** - Zero-knowledge proof verification

### Blockchain Integration
- **Monad Testnet** - Primary deployment target (Chain ID: 41454)
- **Ethereum Compatible** - Works with any EVM-compatible chain
- **Web3 Libraries** - Viem and Wagmi for blockchain interactions

## 🌟 Key Features

### Quest System
- **Multiple Quest Types**: Social media interactions, content creation, community engagement
- **Flexible Rewards**: ETH, USDC, custom tokens, NFT badges
- **Progress Tracking**: Real-time quest progress with visual indicators
- **Zero-Knowledge Proofs**: Privacy-preserving task verification via ZKTLS

### User Experience
- **Dashboard Interface**: Bento-style grid layout with statistics and trending quests
- **Wallet Integration**: Seamless Web3 wallet connection via RainbowKit
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Multi-language**: i18n support for English and Chinese

### Platform Features
- **Quest Creation**: User-friendly quest creation with form validation
- **Leaderboards**: Top earners and active participants tracking
- **Profile Management**: User profiles with statistics and achievement history
- **Real-time Updates**: Live quest status and reward distribution

## 🔧 Development Commands

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build production bundle
npm run build:dev    # Build development bundle
npm run lint         # Run ESLint for code quality
npm run preview      # Preview production build
```

### Backend Commands
```bash
cd server
bun run index.ts     # Start development server
bun install          # Install dependencies
bun test             # Run tests (if configured)
```

### Smart Contract Commands
```bash
cd contracts
forge build          # Compile contracts
forge test           # Run test suite
forge fmt            # Format code
forge script <script> --rpc-url <url> --private-key <key> --broadcast
```

## 🌐 Web3 Configuration

### Supported Networks
- **Monad Testnet** (Primary)
  - Chain ID: 41454
  - RPC: https://testnet1.monad.xyz
  - Explorer: https://explorer-testnet.monad.xyz
  - Native Token: MON

### Wallet Integration
- **RainbowKit**: Beautiful wallet connection UI
- **WalletConnect**: Cross-platform wallet support
- **MetaMask**: Browser extension integration
- **Multiple Wallets**: Support for various Web3 wallets

## 🗄️ Database Schema

### Core Tables
- **quests**: Quest information, requirements, rewards, and metadata
- **users**: User profiles linked to EVM addresses
- **quest_participations**: User quest participation and progress tracking

### Data Flow
1. Users connect wallets and create profiles
2. Quest creators publish quests with reward pools
3. Participants join quests and submit proofs
4. ZKTLS verification confirms task completion
5. Smart contracts distribute rewards automatically

## 🚀 Deployment

### Frontend Deployment
- **Vercel**: Primary deployment platform
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`

### Backend Deployment  
- **Cloud Platforms**: Any Node.js compatible platform
- **Environment Variables**: Supabase credentials, JWT secrets
- **Database**: Supabase PostgreSQL

### Smart Contract Deployment
- **Testnets**: Sepolia, Monad Testnet
- **Mainnet**: Ethereum, Polygon, other EVM chains
- **Verification**: Automatic via Foundry scripts

## 📖 Documentation

- **Frontend Guide**: See `CLAUDE.md` for detailed frontend documentation
- **Backend Guide**: See `server/CLAUDE.md` for API documentation  
- **Contract Guide**: See `contracts/README.md` for smart contract details
- **Quest Testing**: See `QUEST_TEST_GUIDE.md` for testing procedures

## 🔐 Security

- **Smart Contract Security**: OpenZeppelin libraries, comprehensive testing
- **Authentication**: JWT tokens with wallet signature verification
- **Input Validation**: Zod schemas for type-safe API validation
- **CORS Protection**: Proper cross-origin request handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Lovable.dev platform.

**Project URL**: https://lovable.dev/projects/87bd9f19-c5a2-4502-ac54-6d10087bba24
