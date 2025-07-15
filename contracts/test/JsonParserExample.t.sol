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

    function testValidateJsonStructure() public {
        // Test favorite/retweet structure
        string[] memory favRetweetKeys = new string[](2);
        favRetweetKeys[0] = "favorited";
        favRetweetKeys[1] = "retweeted";
        
        assertTrue(example.validateJsonStructure(PROOF_FAV_AND_RETWEET, favRetweetKeys));
        assertFalse(example.validateJsonStructure(PROOF_QUOTE_TWEET, favRetweetKeys));
        
        // Test quote tweet structure
        string[] memory quoteTweetKeys = new string[](3);
        quoteTweetKeys[0] = "user_id_str";
        quoteTweetKeys[1] = "id_str";
        quoteTweetKeys[2] = "quoted_status_id_str";
        
        assertTrue(example.validateJsonStructure(PROOF_QUOTE_TWEET, quoteTweetKeys));
        assertFalse(example.validateJsonStructure(PROOF_FAV_AND_RETWEET, quoteTweetKeys));
    }

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

    function testParseTwitterIds() public {
        // Test with quote tweet data (has IDs)
        (bool hasValidIds1, bool userIdExists1, bool tweetIdExists1) = 
            example.parseTwitterIds(PROOF_QUOTE_TWEET);
        
        assertTrue(hasValidIds1);
        assertTrue(userIdExists1);
        assertTrue(tweetIdExists1);
        
        // Test with favorite/retweet data (no IDs)
        (bool hasValidIds2, bool userIdExists2, bool tweetIdExists2) = 
            example.parseTwitterIds(PROOF_FAV_AND_RETWEET);
        
        assertFalse(hasValidIds2);
        assertFalse(userIdExists2);
        assertFalse(tweetIdExists2);
        
        // Test with partial ID data
        (bool hasValidIds3, bool userIdExists3, bool tweetIdExists3) = 
            example.parseTwitterIds(NO_ENGAGEMENT);
        
        assertFalse(hasValidIds3); // Only has user_id_str, missing id_str
        assertTrue(userIdExists3);
        assertFalse(tweetIdExists3);
    }

    function testAnalyzeJsonContent() public {
        // Test quote tweet data (has string fields)
        (uint256 stringCount1, uint256 boolCount1, bool hasRequired1) = 
            example.analyzeJsonContent(PROOF_QUOTE_TWEET);
        
        assertEq(stringCount1, 3); // user_id_str, id_str, quoted_status_id_str
        assertEq(boolCount1, 0);   // no boolean fields
        assertFalse(hasRequired1); // needs both strings and booleans
        
        // Test favorite/retweet data (has boolean fields)
        (uint256 stringCount2, uint256 boolCount2, bool hasRequired2) = 
            example.analyzeJsonContent(PROOF_FAV_AND_RETWEET);
        
        assertEq(stringCount2, 0); // no string fields from our list
        assertEq(boolCount2, 2);   // favorited, retweeted
        assertFalse(hasRequired2); // needs both strings and booleans
        
        // Test mixed data
        (uint256 stringCount3, uint256 boolCount3, bool hasRequired3) = 
            example.analyzeJsonContent(MIXED_ENGAGEMENT);
        
        assertEq(stringCount3, 0); // no string fields from our list
        assertEq(boolCount3, 3);   // favorited, retweeted, verified
        assertFalse(hasRequired3); // needs both strings and booleans
    }

    function testExtractAllData() public {
        // Test with favorite/retweet data
        (string[] memory keys1, string[] memory values1) = 
            example.extractAllData(PROOF_FAV_AND_RETWEET);
        
        assertEq(keys1.length, 2);
        assertEq(values1.length, 2);
        
        // Test with quote tweet data
        (string[] memory keys2, string[] memory values2) = 
            example.extractAllData(PROOF_QUOTE_TWEET);
        
        assertEq(keys2.length, 3);
        assertEq(values2.length, 3);
        
        // Verify some key-value pairs are correctly extracted
        bool foundUserId = false;
        bool foundTweetId = false;
        
        for (uint256 i = 0; i < keys2.length; i++) {
            if (keccak256(bytes(keys2[i])) == keccak256(bytes("user_id_str"))) {
                assertEq(values2[i], "898091366260948992");
                foundUserId = true;
            }
            if (keccak256(bytes(keys2[i])) == keccak256(bytes("id_str"))) {
                assertEq(values2[i], "1940381550228721818");
                foundTweetId = true;
            }
        }
        
        assertTrue(foundUserId);
        assertTrue(foundTweetId);
    }

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
        
        // Complex analysis
        gasBefore = gasleft();
        example.analyzeJsonContent(PROOF_QUOTE_TWEET);
        gasUsed = gasBefore - gasleft();
        emit log_named_uint("Gas used for analyzeJsonContent", gasUsed);
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