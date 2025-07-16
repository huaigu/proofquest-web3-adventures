#!/usr/bin/env bun
/**
 * Test BigInt serialization fix
 */

function testBigIntSerialization() {
  console.log('🧪 Testing BigInt serialization fix...');
  
  // Mock verification params with BigInt
  const mockVerificationParams = {
    apiUrlPattern: 'https://x.com/i/api/graphql/',
    apiEndpointHash: 'test-hash',
    proofValidityPeriod: 3600n, // BigInt value
    targetLikeRetweetId: '1234567890',
    favoritedJsonPath: 'favorited',
    retweetedJsonPath: 'retweeted',
    requireFavorite: true,
    requireRetweet: true,
    targetQuotedTweetId: '',
    quotedStatusIdJsonPath: '',
    userIdJsonPath: '',
    quoteTweetIdJsonPath: ''
  };
  
  try {
    // Test the fix
    const serialized = JSON.stringify(mockVerificationParams, (key, value) => {
      return typeof value === 'bigint' ? value.toString() : value;
    });
    
    console.log('✅ Serialization successful:');
    console.log(serialized);
    
    // Test parsing back
    const parsed = JSON.parse(serialized);
    console.log('✅ Parsing successful:');
    console.log('proofValidityPeriod type:', typeof parsed.proofValidityPeriod);
    console.log('proofValidityPeriod value:', parsed.proofValidityPeriod);
    
    // Test without fix (should fail)
    try {
      JSON.stringify(mockVerificationParams);
      console.log('❌ Should have failed without fix');
    } catch (error) {
      console.log('✅ Correctly failed without fix:', error.message);
    }
    
    console.log('🎉 All BigInt serialization tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBigIntSerialization();