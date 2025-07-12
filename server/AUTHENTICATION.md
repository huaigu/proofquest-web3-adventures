# ProofQuest Authentication System

## 🔐 EVM-Based Authentication with Sign-In with Ethereum (SIWE)

ProofQuest uses a secure, wallet-based authentication system built on the Sign-In with Ethereum (SIWE) standard. This allows users to authenticate using their EVM wallets without traditional passwords.

## 🏗️ Architecture Overview

### Authentication Flow
1. **Nonce Request**: Client requests a unique nonce for signing
2. **Message Signing**: User signs a SIWE message with their wallet
3. **Signature Verification**: Server verifies the signature and issues a JWT
4. **Protected Access**: JWT token provides access to protected endpoints

### Security Features
- ✅ **EVM Signature Verification**: Uses ethers.js and SIWE for cryptographic verification
- ✅ **JWT Tokens**: 30-day expiration with secure signing
- ✅ **Nonce Protection**: Prevents replay attacks
- ✅ **Address Validation**: Ensures valid EVM address formats
- ✅ **Automatic User Creation**: Creates user accounts on first sign-in

## 📚 API Endpoints

### 1. Request Nonce
Generate a unique nonce for SIWE message signing.

```bash
POST /api/auth/nonce
Content-Type: application/json

{
  "address": "0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685",
  "domain": "localhost:3001",
  "chainId": 1
}
```

**Response:**
```json
{
  "nonce": "0x1234567890abcdef",
  "message": "localhost:3001 wants you to sign in with your Ethereum account:\n0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685\n\nSign in to ProofQuest with your Ethereum account.\n\nURI: https://localhost:3001\nVersion: 1\nChain ID: 1\nNonce: 0x1234567890abcdef\nIssued At: 2024-01-15T10:00:00.000Z\nExpiration Time: 2024-01-15T10:10:00.000Z",
  "domain": "localhost:3001",
  "expiresAt": "2024-01-15T10:10:00.000Z"
}
```

### 2. Sign In
Authenticate with a signed SIWE message.

```bash
POST /api/auth/signin
Content-Type: application/json

{
  "message": "localhost:3001 wants you to sign in...",
  "signature": "0x1234567890abcdef..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "address": "0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685",
    "nickname": null,
    "avatarUrl": null,
    "bio": null
  },
  "expiresAt": "2024-02-14T10:00:00.000Z"
}
```

### 3. Verify Token
Check if a JWT token is valid.

```bash
GET /api/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "user": {
    "address": "0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685",
    "nickname": "Alice Chen",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    "bio": "Web3 developer and DeFi enthusiast."
  },
  "isAuthenticated": true
}
```

### 4. Refresh Token
Extend JWT token expiration.

```bash
POST /api/auth/refresh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-02-14T10:00:00.000Z"
}
```

### 5. Sign Out
Log out (client-side token removal).

```bash
POST /api/auth/signout
```

**Response:**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

## 🛡️ Protected Endpoints

The following endpoints require authentication:

- `POST /api/quests` - Create a new quest
- `PUT /api/quests/:id` - Update quest (owner only)
- `DELETE /api/quests/:id` - Delete quest (owner only)
- `POST /api/participations` - Join a quest
- `PUT /api/participations/:id` - Update participation
- `PUT /api/users` - Update user profile

### Using Protected Endpoints

Include the JWT token in the Authorization header:

```bash
curl -X POST http://localhost:3001/api/quests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "title": "My Quest",
    "description": "A quest created by authenticated user",
    "questType": "twitter-interaction",
    "interactionType": "follow",
    "targetAccount": "@ProofQuest",
    "rewardType": "ETH",
    "totalRewardPool": 1.0,
    "rewardPerParticipant": 0.01,
    "distributionMethod": "immediate",
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-01-22T23:59:59Z",
    "rewardClaimDeadline": "2024-01-29T23:59:59Z",
    "agreeToTerms": true
  }'
```

## 🔧 Frontend Integration

### React Example with ethers.js

```typescript
import { ethers } from 'ethers'

interface AuthService {
  signIn: () => Promise<{ token: string; user: any }>
  signOut: () => void
  getToken: () => string | null
  isAuthenticated: () => boolean
}

class AuthService implements AuthService {
  private token: string | null = null

  async signIn(): Promise<{ token: string; user: any }> {
    // Get user's wallet
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()

    // 1. Request nonce
    const nonceResponse = await fetch('/api/auth/nonce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: address.toLowerCase(),
        domain: window.location.host,
        chainId: await provider.getNetwork().then(n => n.chainId)
      })
    })
    const { message } = await nonceResponse.json()

    // 2. Sign message
    const signature = await signer.signMessage(message)

    // 3. Authenticate
    const authResponse = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, signature })
    })
    const authData = await authResponse.json()

    if (authData.success) {
      this.token = authData.token
      localStorage.setItem('auth_token', authData.token)
      return { token: authData.token, user: authData.user }
    }

    throw new Error(authData.message || 'Authentication failed')
  }

  signOut(): void {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export const authService = new AuthService()
```

### API Client with Auto-Authentication

```typescript
class ApiClient {
  private baseURL = 'http://localhost:3001'

  async request(endpoint: string, options: RequestInit = {}) {
    const token = authService.getToken()
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config)
    
    if (response.status === 401) {
      authService.signOut()
      throw new Error('Authentication required')
    }

    return response.json()
  }

  // Example: Create quest (requires authentication)
  async createQuest(questData: any) {
    return this.request('/api/quests', {
      method: 'POST',
      body: JSON.stringify(questData)
    })
  }
}

export const apiClient = new ApiClient()
```

## ⚙️ Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Security Best Practices

1. **JWT Secret**: Use a strong, random secret in production
2. **HTTPS**: Always use HTTPS in production
3. **Token Storage**: Store tokens securely (HttpOnly cookies recommended)
4. **Token Expiration**: 30-day expiration with refresh capability
5. **Nonce Cleanup**: Automatic cleanup of expired nonces

## 🧪 Testing

### Run Authentication Tests

```bash
# Test the complete authentication flow
bun run test:auth

# Start development server
bun run dev

# Test individual components
curl -X POST http://localhost:3001/api/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"address":"0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685"}'
```

### Test Results

The authentication test script verifies:
- ✅ Nonce generation
- ✅ SIWE message signing
- ✅ Signature verification
- ✅ JWT token generation and validation
- ✅ Protected endpoint access
- ✅ Unauthorized request rejection

## 🐛 Troubleshooting

### Common Issues

**1. "Missing Token" Error**
- Ensure Authorization header is included: `Authorization: Bearer <token>`
- Check that token hasn't expired (30-day limit)

**2. "Invalid Signature" Error**
- Verify the message hasn't been modified
- Ensure nonce is fresh (10-minute expiration)
- Check wallet is signing the exact SIWE message

**3. "Nonce is invalid or expired" Error**
- Request a new nonce before each sign-in attempt
- Complete sign-in within 10 minutes of nonce generation

**4. "User Not Found" Error**
- User accounts are created automatically on first sign-in
- Ensure database tables are set up correctly

### Debug Logging

Enable debug logging in development:

```bash
NODE_ENV=development bun run dev
```

This will show detailed authentication logs for troubleshooting.

---

🔒 **Security Note**: This authentication system is designed for Web3 applications where users control their private keys. Never store or transmit private keys through the API.