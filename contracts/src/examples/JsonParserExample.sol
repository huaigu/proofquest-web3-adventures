// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../utils/JsonParser.sol";

/**
 * @title JsonParserExample
 * @dev Example contract demonstrating how to use JsonParser with real zkTLS data
 * This contract shows practical usage patterns for parsing Twitter/X API responses
 */
contract JsonParserExample {
    using JsonParser for string;

    // Events for demonstration
    event FavoriteAndRetweetVerified(address user, bool favorited, bool retweeted);
    event QuoteTweetVerified(address user, string userId, string tweetId, string quotedTweetId);
    event JsonDataParsed(string key, string value);

    /**
     * @dev Verify favorite and retweet status from zkTLS proof data
     * @param jsonData The JSON data from zkTLS proof (e.g., ProofFavAndRetweet)
     * @return favorited Whether the tweet was favorited
     * @return retweeted Whether the tweet was retweeted
     * 
     * Example input: '{"favorited":"true","retweeted":"true"}'
     */
    function verifyFavoriteAndRetweet(string memory jsonData) 
        external 
        returns (bool favorited, bool retweeted) 
    {
        // Parse boolean values from string representations
        favorited = jsonData.getBool("favorited");
        retweeted = jsonData.getBool("retweeted");
        
        // Emit event for tracking
        emit FavoriteAndRetweetVerified(msg.sender, favorited, retweeted);
        
        return (favorited, retweeted);
    }

    /**
     * @dev Verify quote tweet information from zkTLS proof data
     * @param jsonData The JSON data from zkTLS proof (e.g., ProofQuoteTweet)
     * @return userId The user ID string
     * @return tweetId The tweet ID string
     * @return quotedTweetId The quoted tweet ID string
     * 
     * Example input: '{"user_id_str":"898091366260948992","id_str":"1940381550228721818","quoted_status_id_str":"1940372466486137302"}'
     */
    function verifyQuoteTweet(string memory jsonData) 
        external 
        returns (string memory userId, string memory tweetId, string memory quotedTweetId) 
    {
        // Extract string values
        userId = jsonData.getString("user_id_str");
        tweetId = jsonData.getString("id_str");
        quotedTweetId = jsonData.getString("quoted_status_id_str");
        
        // Emit event for tracking
        emit QuoteTweetVerified(msg.sender, userId, tweetId, quotedTweetId);
        
        return (userId, tweetId, quotedTweetId);
    }

    /**
     * @dev Check if required fields exist in JSON data
     * @param jsonData The JSON data to validate
     * @param requiredKeys Array of keys that must be present
     * @return valid True if all required keys exist
     */
    function validateJsonStructure(string memory jsonData, string[] memory requiredKeys) 
        external 
        pure 
        returns (bool valid) 
    {
        for (uint256 i = 0; i < requiredKeys.length; i++) {
            if (!jsonData.hasKey(requiredKeys[i])) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Extract and validate Twitter engagement data
     * @param jsonData The JSON data containing engagement information
     * @return isEngaged True if user has favorited OR retweeted
     * @return engagementScore Simple score: 0 (none), 1 (one action), 2 (both actions)
     */
    function getEngagementMetrics(string memory jsonData) 
        external 
        pure 
        returns (bool isEngaged, uint256 engagementScore) 
    {
        bool favorited = jsonData.getBool("favorited");
        bool retweeted = jsonData.getBool("retweeted");
        
        isEngaged = favorited || retweeted;
        
        if (favorited && retweeted) {
            engagementScore = 2;
        } else if (favorited || retweeted) {
            engagementScore = 1;
        } else {
            engagementScore = 0;
        }
        
        return (isEngaged, engagementScore);
    }

    /**
     * @dev Parse numeric IDs from Twitter data (handles large numbers as strings)
     * @param jsonData The JSON data containing ID fields
     * @return hasValidIds True if all expected ID fields are present and non-empty
     * @return userIdExists True if user_id_str field exists
     * @return tweetIdExists True if id_str field exists
     */
    function parseTwitterIds(string memory jsonData) 
        external 
        pure 
        returns (bool hasValidIds, bool userIdExists, bool tweetIdExists) 
    {
        userIdExists = jsonData.hasKey("user_id_str");
        tweetIdExists = jsonData.hasKey("id_str");
        
        if (userIdExists && tweetIdExists) {
            string memory userId = jsonData.getString("user_id_str");
            string memory tweetId = jsonData.getString("id_str");
            
            // Check if IDs are non-empty (basic validation)
            hasValidIds = bytes(userId).length > 0 && bytes(tweetId).length > 0;
        } else {
            hasValidIds = false;
        }
        
        return (hasValidIds, userIdExists, tweetIdExists);
    }

    /**
     * @dev Demonstrate complex JSON parsing with multiple data types
     * @param jsonData Mixed JSON data with various field types
     * @return stringCount Number of string fields found
     * @return boolCount Number of boolean fields found
     * @return hasRequiredFields True if contains both strings and booleans
     */
    function analyzeJsonContent(string memory jsonData) 
        external 
        pure 
        returns (uint256 stringCount, uint256 boolCount, bool hasRequiredFields) 
    {
        // Common string fields in Twitter data
        string[] memory stringFields = new string[](4);
        stringFields[0] = "user_id_str";
        stringFields[1] = "id_str";
        stringFields[2] = "quoted_status_id_str";
        stringFields[3] = "name";
        
        // Common boolean fields
        string[] memory boolFields = new string[](4);
        boolFields[0] = "favorited";
        boolFields[1] = "retweeted";
        boolFields[2] = "verified";
        boolFields[3] = "protected";
        
        // Count existing fields
        for (uint256 i = 0; i < stringFields.length; i++) {
            if (jsonData.hasKey(stringFields[i])) {
                stringCount++;
            }
        }
        
        for (uint256 i = 0; i < boolFields.length; i++) {
            if (jsonData.hasKey(boolFields[i])) {
                boolCount++;
            }
        }
        
        hasRequiredFields = stringCount > 0 && boolCount > 0;
        
        return (stringCount, boolCount, hasRequiredFields);
    }

    /**
     * @dev Extract all available data from a JSON string (for debugging/inspection)
     * @param jsonData The JSON data to parse
     * @return keys Array of all keys found
     * @return values Array of all values corresponding to the keys
     * 
     * Note: This function uses dynamic arrays and should be used carefully in production
     */
    function extractAllData(string memory jsonData) 
        external 
        pure 
        returns (string[] memory keys, string[] memory values) 
    {
        return jsonData.extractAllPairs();
    }
}