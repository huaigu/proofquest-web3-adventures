import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';
import { sepolia } from 'viem/chains';

// Define Monad testnet chain
export const monadTestnet = defineChain({
  id: 10143, // Monad testnet chain ID
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://explorer-testnet.monad.xyz',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'ProofQuest',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [sepolia, monadTestnet], // Add Sepolia for testing
  ssr: false, // If your dApp uses server side rendering (SSR)
});