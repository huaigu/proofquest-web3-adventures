# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProofQuest is a Web3 quest platform that allows users to complete Web2 tasks and earn Web3 rewards with zero-knowledge proof verification. The application is built as a modern React SPA with TypeScript, featuring a dashboard-style interface for managing quests, viewing statistics, and tracking user progress.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run build:dev` - Build development bundle
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

### Package Management
- `npm i` - Install dependencies
- Uses both `package-lock.json` and `bun.lockb` (dual package manager support)

## Architecture & Tech Stack

### Core Technologies
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **React Router DOM** for client-side routing
- **TanStack React Query** for server state management
- **Tailwind CSS** for styling with custom CSS variables for theming

### UI Framework
- **shadcn/ui** component library built on Radix UI primitives
- **Lucide React** for icons
- Custom gradient themes with CSS variables for consistent color system
- Dark mode enabled by default in `App.tsx`

### Project Structure
```
src/
├── components/
│   ├── Navigation.tsx          # Main navigation component
│   └── ui/                     # shadcn/ui components
├── pages/                      # Route components
│   ├── Index.tsx              # Landing page with dashboard
│   ├── QuestList.tsx          # Quest browsing
│   ├── QuestDetail.tsx        # Individual quest view
│   ├── Profile.tsx            # User profile
│   ├── CreateQuest.tsx        # Quest creation
│   └── NotFound.tsx           # 404 page
├── hooks/                     # Custom React hooks
├── lib/
│   └── utils.ts              # Utility functions (cn, etc.)
└── main.tsx                  # Application entry point
```

### Routing Structure
- `/` - Landing page with dashboard and trending quests
- `/quests` - Quest listing and browsing
- `/quest/:id` - Individual quest details
- `/profile` - User profile and statistics
- `/create` - Quest creation form
- Catch-all `*` route for 404 handling

### Styling System
- Uses Tailwind CSS with custom CSS variables in `index.css`
- Gradient color system with variables like `--vibrant-blue`, `--vibrant-purple`, etc.
- Components use gradient backgrounds and glass-morphism effects
- Responsive design with mobile-first approach

## Key Features & Components

### Dashboard (Index.tsx)
- Bento-style grid layout with statistics cards
- Trending quests section with progress indicators
- Top earners leaderboard
- Feature cards highlighting platform capabilities (Auto Rewards, Transparency, Privacy, Multi-Task)

### Navigation
- Persistent navigation bar across all routes
- Integrates with React Router for SPA navigation

### Quest System
- Quest listing, detail views, and creation forms
- Progress tracking with visual indicators
- Reward display (ETH, USDC, NFT badges)
- User participation metrics

## Development Notes

### Component Patterns
- Uses shadcn/ui components for consistent design
- Gradient backgrounds and card-based layouts throughout
- Avatar components with gradient fallbacks
- Badge components for status indicators

### State Management
- TanStack React Query for server state
- React Router for navigation state
- No global state management library (Redux, Zustand) currently in use

### Code Style
- TypeScript throughout with strict typing
- Functional components with hooks
- Tailwind CSS for all styling
- ESLint configuration for code quality

### Testing
- No test framework currently configured
- When adding tests, check for existing patterns first

## Platform Integration

This is a Lovable.dev project that can be edited through their platform or locally. Changes made through either method will sync to the repository.