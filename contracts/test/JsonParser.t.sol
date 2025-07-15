// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/utils/JsonParser.sol";

contract JsonParserTest is Test {
    using JsonParser for string;

    // Real zkTLS data examples
    string constant PROOF_FAV_AND_RETWEET = '{"favorited":"true","retweeted":"true"}';
    string constant PROOF_QUOTE_TWEET = '{"user_id_str":"898091366260948992","id_str":"1940381550228721818","quoted_status_id_str":"1940372466486137302"}';
    
    // Additional test cases
    string constant SIMPLE_JSON = '{"name":"Alice","age":"25"}';
    string constant BOOLEAN_JSON = '{"active":true,"verified":false}';
    string constant MIXED_JSON = '{"name":"Bob","active":"true","count":"100","verified":"false"}';
    string constant EMPTY_JSON = "{}";
    string constant INVALID_JSON = '{"name":"Alice"';

    function testGetString_RealZkTLSData() public {
        // Test ProofFavAndRetweet data
        assertEq(PROOF_FAV_AND_RETWEET.getString("favorited"), "true");
        assertEq(PROOF_FAV_AND_RETWEET.getString("retweeted"), "true");
        
        // Test ProofQuoteTweet data
        assertEq(PROOF_QUOTE_TWEET.getString("user_id_str"), "898091366260948992");
        assertEq(PROOF_QUOTE_TWEET.getString("id_str"), "1940381550228721818");
        assertEq(PROOF_QUOTE_TWEET.getString("quoted_status_id_str"), "1940372466486137302");
    }

    function testGetString_BasicCases() public {
        assertEq(SIMPLE_JSON.getString("name"), "Alice");
        assertEq(SIMPLE_JSON.getString("age"), "25");
        assertEq(SIMPLE_JSON.getString("nonexistent"), "");
    }

    function testGetString_EdgeCases() public {
        assertEq(EMPTY_JSON.getString("key"), "");
        // INVALID_JSON is '{"name":"Alice"' - our parser is lenient and can extract "Alice"
        assertEq(INVALID_JSON.getString("name"), "Alice");
        assertEq(JsonParser.getString("", "key"), "");
        assertEq(SIMPLE_JSON.getString(""), "");
    }

    function testGetBool_RealZkTLSData() public {
        // Test ProofFavAndRetweet data - these are string representations
        assertTrue(PROOF_FAV_AND_RETWEET.getBool("favorited"));
        assertTrue(PROOF_FAV_AND_RETWEET.getBool("retweeted"));
    }

    function testGetBool_StringBooleans() public {
        assertTrue(MIXED_JSON.getBool("active")); // "true"
        assertFalse(MIXED_JSON.getBool("verified")); // "false"
    }

    function testGetBool_LiteralBooleans() public {
        assertTrue(BOOLEAN_JSON.getBool("active")); // true
        assertFalse(BOOLEAN_JSON.getBool("verified")); // false
    }

    function testGetBool_EdgeCases() public {
        assertFalse(PROOF_QUOTE_TWEET.getBool("user_id_str")); // Not a boolean
        assertFalse(EMPTY_JSON.getBool("key"));
        assertFalse(SIMPLE_JSON.getBool("nonexistent"));
        assertFalse(JsonParser.getBool("", "key"));
        assertFalse(SIMPLE_JSON.getBool(""));
    }

    function testHasKey_RealZkTLSData() public {
        // Test ProofFavAndRetweet data
        assertTrue(PROOF_FAV_AND_RETWEET.hasKey("favorited"));
        assertTrue(PROOF_FAV_AND_RETWEET.hasKey("retweeted"));
        assertFalse(PROOF_FAV_AND_RETWEET.hasKey("nonexistent"));
        
        // Test ProofQuoteTweet data
        assertTrue(PROOF_QUOTE_TWEET.hasKey("user_id_str"));
        assertTrue(PROOF_QUOTE_TWEET.hasKey("id_str"));
        assertTrue(PROOF_QUOTE_TWEET.hasKey("quoted_status_id_str"));
        assertFalse(PROOF_QUOTE_TWEET.hasKey("favorited"));
    }

    function testHasKey_BasicCases() public {
        assertTrue(SIMPLE_JSON.hasKey("name"));
        assertTrue(SIMPLE_JSON.hasKey("age"));
        assertFalse(SIMPLE_JSON.hasKey("email"));
    }

    function testHasKey_EdgeCases() public {
        assertFalse(EMPTY_JSON.hasKey("key"));
        assertFalse(JsonParser.hasKey("", "key"));
        assertFalse(SIMPLE_JSON.hasKey(""));
    }

    function testExtractAllPairs_RealZkTLSData() public {
        // Test ProofFavAndRetweet data
        (string[] memory keys1, string[] memory values1) = PROOF_FAV_AND_RETWEET.extractAllPairs();
        assertEq(keys1.length, 2);
        assertEq(values1.length, 2);
        
        // Note: Order might vary, so we check both possibilities
        bool foundFavorited = false;
        bool foundRetweeted = false;
        
        for (uint i = 0; i < keys1.length; i++) {
            if (keccak256(bytes(keys1[i])) == keccak256(bytes("favorited"))) {
                assertEq(values1[i], "true");
                foundFavorited = true;
            } else if (keccak256(bytes(keys1[i])) == keccak256(bytes("retweeted"))) {
                assertEq(values1[i], "true");
                foundRetweeted = true;
            }
        }
        
        assertTrue(foundFavorited);
        assertTrue(foundRetweeted);
    }

    function testExtractAllPairs_QuoteTweetData() public {
        // Test ProofQuoteTweet data
        (string[] memory keys2, string[] memory values2) = PROOF_QUOTE_TWEET.extractAllPairs();
        assertEq(keys2.length, 3);
        assertEq(values2.length, 3);
        
        bool foundUserId = false;
        bool foundId = false;
        bool foundQuotedId = false;
        
        for (uint i = 0; i < keys2.length; i++) {
            bytes32 keyHash = keccak256(bytes(keys2[i]));
            if (keyHash == keccak256(bytes("user_id_str"))) {
                assertEq(values2[i], "898091366260948992");
                foundUserId = true;
            } else if (keyHash == keccak256(bytes("id_str"))) {
                assertEq(values2[i], "1940381550228721818");
                foundId = true;
            } else if (keyHash == keccak256(bytes("quoted_status_id_str"))) {
                assertEq(values2[i], "1940372466486137302");
                foundQuotedId = true;
            }
        }
        
        assertTrue(foundUserId);
        assertTrue(foundId);
        assertTrue(foundQuotedId);
    }

    function testExtractAllPairs_EdgeCases() public {
        (string[] memory keys, string[] memory values) = EMPTY_JSON.extractAllPairs();
        assertEq(keys.length, 0);
        assertEq(values.length, 0);
    }

    // Test robustness with malformed JSON
    function testMalformedJson() public {
        string memory malformed1 = '{"key":"value"'; // Missing closing quote and brace - should still work
        string memory malformed2 = '{"key":value"}'; // Missing opening quote for value
        string memory malformed3 = '{key":"value"}'; // Missing opening quote for key
        
        // malformed1 should actually work - we can extract the value even without closing chars
        assertEq(malformed1.getString("key"), "value");
        
        // These should fail because the JSON structure is broken
        assertEq(malformed2.getString("key"), "");
        assertEq(malformed3.getString("key"), "");
        
        // Test boolean parsing - "value" is not "true" so should be false
        assertFalse(malformed1.getBool("key")); // "value" converts to false
        assertFalse(malformed2.getBool("key"));
        assertFalse(malformed3.getBool("key"));
    }

    // Test with whitespace
    function testJsonWithWhitespace() public {
        string memory jsonWithSpaces = '{ "name" : "Alice" , "age" : "25" }';
        assertEq(jsonWithSpaces.getString("name"), "Alice");
        assertEq(jsonWithSpaces.getString("age"), "25");
        assertTrue(jsonWithSpaces.hasKey("name"));
        assertTrue(jsonWithSpaces.hasKey("age"));
    }

    // Test complex cases that might appear in real zkTLS data
    function testComplexRealWorldCase() public {
        string memory complexJson = '{"status":"success","user_id_str":"123456789","verified":"true","tweet_count":"42","is_active":"false"}';
        
        assertEq(complexJson.getString("status"), "success");
        assertEq(complexJson.getString("user_id_str"), "123456789");
        assertEq(complexJson.getString("tweet_count"), "42");
        
        assertTrue(complexJson.getBool("verified"));
        assertFalse(complexJson.getBool("is_active"));
        
        assertTrue(complexJson.hasKey("status"));
        assertTrue(complexJson.hasKey("user_id_str"));
        assertTrue(complexJson.hasKey("verified"));
        assertTrue(complexJson.hasKey("tweet_count"));
        assertTrue(complexJson.hasKey("is_active"));
        assertFalse(complexJson.hasKey("nonexistent"));
    }

    // Gas optimization test
    function testGasUsage() public {
        uint256 gasBefore = gasleft();
        PROOF_QUOTE_TWEET.getString("user_id_str");
        uint256 gasUsed = gasBefore - gasleft();
        
        // Gas usage should be reasonable (this is mainly for manual inspection)
        emit log_named_uint("Gas used for getString", gasUsed);
        
        gasBefore = gasleft();
        PROOF_FAV_AND_RETWEET.getBool("favorited");
        gasUsed = gasBefore - gasleft();
        
        emit log_named_uint("Gas used for getBool", gasUsed);
        
        gasBefore = gasleft();
        PROOF_QUOTE_TWEET.hasKey("id_str");
        gasUsed = gasBefore - gasleft();
        
        emit log_named_uint("Gas used for hasKey", gasUsed);
    }
}