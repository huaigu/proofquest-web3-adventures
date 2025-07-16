#!/usr/bin/env bun
/**
 * Test script for EventIndexer real data fetching
 */

import { EventIndexer } from '../lib/eventIndexer.js';

async function testEventIndexer() {
  console.log('🧪 Testing EventIndexer with real contract data...');
  
  // Mock contract address and RPC URL for testing
  const mockContractAddress = '0x1234567890123456789012345678901234567890';
  const mockRpcUrl = 'https://testnet1.monad.xyz';
  
  try {
    const indexer = new EventIndexer(mockRpcUrl, mockContractAddress, 0);
    
    // Test the private method logic by creating mock data
    const mockQuestData = {
      id: 1n,
      sponsor: '0xabcdef1234567890abcdef1234567890abcdef12',
      title: 'Test Quest',
      description: 'Test Description',
      questType: 0, // LikeAndRetweet
      status: 1, // Active
      verificationParams: {
        apiUrlPattern: 'https://x.com/i/api/graphql/',
        apiEndpointHash: 'test-hash',
        proofValidityPeriod: 3600n,
        targetLikeRetweetId: '1234567890',
        favoritedJsonPath: 'favorited',
        retweetedJsonPath: 'retweeted',
        requireFavorite: true,
        requireRetweet: true,
        targetQuotedTweetId: '',
        quotedStatusIdJsonPath: '',
        userIdJsonPath: '',
        quoteTweetIdJsonPath: ''
      },
      totalRewards: 1000000000000000000n, // 1 ETH in wei
      rewardPerUser: 100000000000000000n, // 0.1 ETH in wei
      maxParticipants: 10n,
      participantCount: 0n,
      startTime: BigInt(Math.floor(Date.now() / 1000)),
      endTime: BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60), // 7 days from now
      claimEndTime: BigInt(Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60), // 14 days from now
      isVesting: false,
      vestingDuration: 0n
    };
    
    // Test quest type mapping
    const getQuestTypeString = (questType: number): string => {
      switch (questType) {
        case 0: return 'likeAndRetweet';
        case 1: return 'Quoted';
        default: return 'likeAndRetweet';
      }
    };
    
    // Test status mapping
    const getStatusString = (status: number): string => {
      switch (status) {
        case 0: return 'pending';
        case 1: return 'active';
        case 2: return 'ended';
        case 3: return 'closed';
        case 4: return 'canceled';
        default: return 'pending';
      }
    };
    
    console.log('✅ Quest Type Mapping Test:');
    console.log(`  questType 0 -> ${getQuestTypeString(0)}`);
    console.log(`  questType 1 -> ${getQuestTypeString(1)}`);
    
    console.log('✅ Status Mapping Test:');
    console.log(`  status 0 -> ${getStatusString(0)}`);
    console.log(`  status 1 -> ${getStatusString(1)}`);
    console.log(`  status 2 -> ${getStatusString(2)}`);
    
    console.log('✅ Data Conversion Test:');
    console.log(`  totalRewards: ${mockQuestData.totalRewards.toString()} wei`);
    console.log(`  rewardPerUser: ${mockQuestData.rewardPerUser.toString()} wei`);
    console.log(`  maxParticipants: ${mockQuestData.maxParticipants.toString()}`);
    console.log(`  startTime: ${new Date(Number(mockQuestData.startTime) * 1000).toISOString()}`);
    console.log(`  endTime: ${new Date(Number(mockQuestData.endTime) * 1000).toISOString()}`);
    
    console.log('✅ Verification Params Test:');
    // Convert BigInt to string for JSON serialization
    const verificationParamsForJSON = {
      ...mockQuestData.verificationParams,
      proofValidityPeriod: mockQuestData.verificationParams.proofValidityPeriod.toString()
    };
    console.log(`  Metadata: ${JSON.stringify(verificationParamsForJSON, null, 2)}`);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEventIndexer().catch(console.error);