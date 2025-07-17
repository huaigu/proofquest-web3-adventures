// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/examples/JsonParserExample.sol";

contract JsonParserExampleTest is Test {
    JsonParserExample public example;

    // Real zkTLS data from the test files
    string constant PROOF_FAV_AND_RETWEET = '{"favorited":"true","retweeted":"true"}';
    string constant PROOF_QUOTE_TWEET = '{"user_id_str":"898091366260948992","id_str":"1940381550228721818","quoted_status_id_str":"1940372466486137302"}';
    
    // Additional test data
    string constant MIXED_ENGAGEMENT = '{"favorited":"true","retweeted":"false","verified":"true"}';
    string constant NO_ENGAGEMENT = '{"favorited":"false","retweeted":"false","user_id_str":"123456"}';

    function setUp() public {
        example = new JsonParserExample();
    }

    function testVerifyFavoriteAndRetweet_RealData() public {
        // Test with real zkTLS data
        (bool favorited, bool retweeted) = example.verifyFavoriteAndRetweet(PROOF_FAV_AND_RETWEET);
        
        assertTrue(favorited);
        assertTrue(retweeted);
    }

    function testVerifyFavoriteAndRetweet_MixedData() public {
        (bool favorited, bool retweeted) = example.verifyFavoriteAndRetweet(MIXED_ENGAGEMENT);
        
        assertTrue(favorited);
        assertFalse(retweeted);
    }

    function testVerifyQuoteTweet_RealData() public {
        // Test with real zkTLS data
        (string memory userId, string memory tweetId, string memory quotedTweetId) = 
            example.verifyQuoteTweet(PROOF_QUOTE_TWEET);
        
        assertEq(userId, "898091366260948992");
        assertEq(tweetId, "1940381550228721818");
        assertEq(quotedTweetId, "1940372466486137302");
    }

    // testValidateJsonStructure - Removed as validateJsonStructure is not implemented

    function testGetEngagementMetrics() public {
        // Test full engagement (both favorited and retweeted)
        (bool isEngaged1, uint256 score1) = example.getEngagementMetrics(PROOF_FAV_AND_RETWEET);
        assertTrue(isEngaged1);
        assertEq(score1, 2);
        
        // Test partial engagement (only favorited)
        (bool isEngaged2, uint256 score2) = example.getEngagementMetrics(MIXED_ENGAGEMENT);
        assertTrue(isEngaged2);
        assertEq(score2, 1);
        
        // Test no engagement
        (bool isEngaged3, uint256 score3) = example.getEngagementMetrics(NO_ENGAGEMENT);
        assertFalse(isEngaged3);
        assertEq(score3, 0);
    }

    // testParseTwitterIds - Removed as parseTwitterIds is not implemented

    // testAnalyzeJsonContent - Removed as analyzeJsonContent is not implemented

    // testExtractAllData - Removed as extractAllData is not implemented

    function testEventsEmission() public {
        // Test favorite/retweet event
        vm.expectEmit(true, false, false, true);
        emit FavoriteAndRetweetVerified(address(this), true, true);
        example.verifyFavoriteAndRetweet(PROOF_FAV_AND_RETWEET);
        
        // Test quote tweet event
        vm.expectEmit(true, false, false, true);
        emit QuoteTweetVerified(
            address(this), 
            "898091366260948992", 
            "1940381550228721818", 
            "1940372466486137302"
        );
        example.verifyQuoteTweet(PROOF_QUOTE_TWEET);
    }
    
    // Define events for testing
    event FavoriteAndRetweetVerified(address user, bool favorited, bool retweeted);
    event QuoteTweetVerified(address user, string userId, string tweetId, string quotedTweetId);

    function testGasUsage() public {
        // Measure gas usage for different operations
        uint256 gasBefore;
        uint256 gasUsed;
        
        // getString operation
        gasBefore = gasleft();
        example.verifyQuoteTweet(PROOF_QUOTE_TWEET);
        gasUsed = gasBefore - gasleft();
        emit log_named_uint("Gas used for verifyQuoteTweet", gasUsed);
        
        // getBool operation
        gasBefore = gasleft();
        example.verifyFavoriteAndRetweet(PROOF_FAV_AND_RETWEET);
        gasUsed = gasBefore - gasleft();
        emit log_named_uint("Gas used for verifyFavoriteAndRetweet", gasUsed);
        
        // Complex analysis - removed as analyzeJsonContent is not implemented
    }

    // Test edge cases with malformed or unusual data
    function testEdgeCases() public {
        string memory emptyJson = "{}";
        string memory invalidJson = '{"broken":';
        
        // Should handle empty JSON gracefully
        (bool favorited, bool retweeted) = example.verifyFavoriteAndRetweet(emptyJson);
        assertFalse(favorited);
        assertFalse(retweeted);
        
        // Should handle invalid JSON gracefully  
        (string memory userId, string memory tweetId, string memory quotedTweetId) = 
            example.verifyQuoteTweet(invalidJson);
        assertEq(userId, "");
        assertEq(tweetId, "");
        assertEq(quotedTweetId, "");
    }
}