// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./StringUtils.sol";

/**
 * @title JsonParser
 * @dev A library for parsing simple JSON strings in Solidity
 * Designed specifically for zkTLS data formats with string and boolean values
 * 
 * Supported JSON formats:
 * - {"key":"value","key2":"value2"} 
 * - {"favorited":"true","retweeted":"false"}
 * - {"user_id_str":"123456789","id_str":"987654321"}
 * 
 * Note: This is a lightweight parser for specific use cases, not a full JSON parser
 */
library JsonParser {
    using StringUtils for string;

    /**
     * @dev Extract a string value for a given key from JSON
     * @param json The JSON string to parse
     * @param key The key to extract the value for
     * @return The string value associated with the key, or empty string if not found
     * 
     * Example: getString('{"name":"Alice","age":"25"}', "name") returns "Alice"
     */
    function getString(string memory json, string memory key) internal pure returns (string memory) {
        bytes memory jsonBytes = bytes(json);
        bytes memory keyBytes = bytes(key);
        
        if (jsonBytes.length == 0 || keyBytes.length == 0) {
            return "";
        }

        // Look for "key" first
        string memory keyPattern = string(abi.encodePacked('"', key, '"'));
        bytes memory keyPatternBytes = bytes(keyPattern);
        
        uint256 keyStart = _findPattern(jsonBytes, keyPatternBytes);
        if (keyStart == type(uint256).max) {
            return "";
        }
        
        // Move past the key and look for the colon
        uint256 colonPos = keyStart + keyPatternBytes.length;
        colonPos = _skipWhitespace(jsonBytes, colonPos);
        
        // Check for colon
        if (colonPos >= jsonBytes.length || jsonBytes[colonPos] != ':') {
            return "";
        }
        
        // Move to the start of the value (after colon)
        uint256 valueStart = colonPos + 1;
        
        // Skip whitespace
        valueStart = _skipWhitespace(jsonBytes, valueStart);
        
        // Value should start with a quote
        if (valueStart >= jsonBytes.length || jsonBytes[valueStart] != '"') {
            return "";
        }
        
        // Skip the opening quote
        valueStart++;
        
        // Find the closing quote
        uint256 valueEnd = _findClosingQuote(jsonBytes, valueStart);
        if (valueEnd == type(uint256).max) {
            return "";
        }
        
        // Extract the value between quotes
        return _extractSubstring(jsonBytes, valueStart, valueEnd);
    }

    /**
     * @dev Extract a boolean value for a given key from JSON
     * @param json The JSON string to parse
     * @param key The key to extract the value for
     * @return The boolean value associated with the key, false if not found or invalid
     * 
     * Handles both boolean literals and string representations:
     * - getBool('{"active":true}', "active") returns true
     * - getBool('{"active":"true"}', "active") returns true
     * - getBool('{"active":"false"}', "active") returns false
     */
    function getBool(string memory json, string memory key) internal pure returns (bool) {
        bytes memory jsonBytes = bytes(json);
        bytes memory keyBytes = bytes(key);
        
        if (jsonBytes.length == 0 || keyBytes.length == 0) {
            return false;
        }

        // Look for "key" first
        string memory keyPattern = string(abi.encodePacked('"', key, '"'));
        bytes memory keyPatternBytes = bytes(keyPattern);
        
        uint256 keyStart = _findPattern(jsonBytes, keyPatternBytes);
        if (keyStart == type(uint256).max) {
            return false;
        }
        
        // Move past the key and look for the colon
        uint256 colonPos = keyStart + keyPatternBytes.length;
        colonPos = _skipWhitespace(jsonBytes, colonPos);
        
        // Check for colon
        if (colonPos >= jsonBytes.length || jsonBytes[colonPos] != ':') {
            return false;
        }
        
        // Move to the start of the value (after colon)
        uint256 valueStart = colonPos + 1;
        
        // Skip whitespace
        valueStart = _skipWhitespace(jsonBytes, valueStart);
        
        if (valueStart >= jsonBytes.length) {
            return false;
        }
        
        // Check for quoted string value
        if (jsonBytes[valueStart] == '"') {
            valueStart++; // Skip opening quote
            uint256 valueEnd = _findClosingQuote(jsonBytes, valueStart);
            if (valueEnd == type(uint256).max) {
                return false;
            }
            
            string memory valueStr = _extractSubstring(jsonBytes, valueStart, valueEnd);
            return _stringToBool(valueStr);
        }
        
        // Check for boolean literal (true/false)
        if (_startsWith(jsonBytes, valueStart, "true")) {
            return true;
        } else if (_startsWith(jsonBytes, valueStart, "false")) {
            return false;
        }
        
        return false;
    }

    /**
     * @dev Check if a key exists in the JSON
     * @param json The JSON string to parse
     * @param key The key to check for
     * @return True if the key exists, false otherwise
     * 
     * Example: hasKey('{"name":"Alice"}', "name") returns true
     */
    // function hasKey(string memory json, string memory key) internal pure returns (bool) {
    //     bytes memory jsonBytes = bytes(json);
    //     bytes memory keyBytes = bytes(key);
        
    //     if (jsonBytes.length == 0 || keyBytes.length == 0) {
    //         return false;
    //     }

    //     // Look for "key" first
    //     string memory keyPattern = string(abi.encodePacked('"', key, '"'));
    //     bytes memory keyPatternBytes = bytes(keyPattern);
        
    //     uint256 keyStart = _findPattern(jsonBytes, keyPatternBytes);
    //     if (keyStart == type(uint256).max) {
    //         return false;
    //     }
        
    //     // Move past the key and look for the colon
    //     uint256 colonPos = keyStart + keyPatternBytes.length;
    //     colonPos = _skipWhitespace(jsonBytes, colonPos);
        
    //     // Check for colon to confirm it's a valid key-value pair
    //     return colonPos < jsonBytes.length && jsonBytes[colonPos] == ':';
    // }

    /**
     * @dev Extract all key-value pairs from a simple JSON object
     * @param json The JSON string to parse
     * @return keys Array of keys found in the JSON
     * @return values Array of values corresponding to the keys
     * 
     * Note: This function has limitations and should be used carefully in production
     * due to dynamic array allocations in memory
     */
    // function extractAllPairs(string memory json) internal pure returns (string[] memory keys, string[] memory values) {
    //     bytes memory jsonBytes = bytes(json);
        
    //     // Count the number of key-value pairs first
    //     uint256 pairCount = _countPairs(jsonBytes);
        
    //     if (pairCount == 0) {
    //         return (new string[](0), new string[](0));
    //     }
        
    //     keys = new string[](pairCount);
    //     values = new string[](pairCount);
        
    //     uint256 currentIndex = 0;
    //     uint256 pos = 0;
        
    //     while (pos < jsonBytes.length && currentIndex < pairCount) {
    //         // Find next key
    //         uint256 keyStart = _findNextQuote(jsonBytes, pos);
    //         if (keyStart == type(uint256).max) break;
            
    //         keyStart++; // Skip opening quote
    //         uint256 keyEnd = _findClosingQuote(jsonBytes, keyStart);
    //         if (keyEnd == type(uint256).max) break;
            
    //         keys[currentIndex] = _extractSubstring(jsonBytes, keyStart, keyEnd);
            
    //         // Find the colon
    //         pos = keyEnd + 1;
    //         pos = _findChar(jsonBytes, pos, ':');
    //         if (pos == type(uint256).max) break;
            
    //         pos++; // Skip colon
    //         pos = _skipWhitespace(jsonBytes, pos);
            
    //         // Find value
    //         if (pos < jsonBytes.length && jsonBytes[pos] == '"') {
    //             pos++; // Skip opening quote
    //             uint256 valueEnd = _findClosingQuote(jsonBytes, pos);
    //             if (valueEnd == type(uint256).max) break;
                
    //             values[currentIndex] = _extractSubstring(jsonBytes, pos, valueEnd);
    //             pos = valueEnd + 1;
    //         }
            
    //         currentIndex++;
    //     }
        
    //     return (keys, values);
    // }

    // Internal helper functions

    /**
     * @dev Find a pattern in bytes array
     */
    function _findPattern(bytes memory data, bytes memory pattern) private pure returns (uint256) {
        if (pattern.length == 0 || data.length < pattern.length) {
            return type(uint256).max;
        }
        
        for (uint256 i = 0; i <= data.length - pattern.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < pattern.length; j++) {
                if (data[i + j] != pattern[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return i;
            }
        }
        
        return type(uint256).max;
    }

    /**
     * @dev Skip whitespace characters
     */
    function _skipWhitespace(bytes memory data, uint256 start) private pure returns (uint256) {
        while (start < data.length) {
            bytes1 char = data[start];
            if (char != ' ' && char != '\t' && char != '\n' && char != '\r') {
                break;
            }
            start++;
        }
        return start;
    }

    /**
     * @dev Find closing quote, handling escaped quotes
     */
    function _findClosingQuote(bytes memory data, uint256 start) private pure returns (uint256) {
        if (start >= data.length) {
            return type(uint256).max;
        }
        
        for (uint256 i = start; i < data.length; i++) {
            if (data[i] == '"') {
                // Check if it's escaped (count consecutive backslashes)
                uint256 backslashCount = 0;
                if (i > 0) {
                    uint256 j = i - 1;
                    while (j < data.length && data[j] == '\\') { // Use < instead of >= to avoid underflow
                        backslashCount++;
                        if (j == 0) break;
                        j--;
                    }
                }
                // If even number of backslashes (including 0), quote is not escaped
                if (backslashCount % 2 == 0) {
                    return i;
                }
            }
        }
        return type(uint256).max;
    }

    /**
     * @dev Extract substring from bytes
     */
    function _extractSubstring(bytes memory data, uint256 start, uint256 end) private pure returns (string memory) {
        if (start >= end || end > data.length) {
            return "";
        }
        
        bytes memory result = new bytes(end - start);
        for (uint256 i = 0; i < end - start; i++) {
            result[i] = data[start + i];
        }
        
        return string(result);
    }

    /**
     * @dev Convert string to boolean
     */
    function _stringToBool(string memory str) private pure returns (bool) {
        return str.equals("true");
    }

    /**
     * @dev Check if bytes starts with a pattern at given position
     */
    function _startsWith(bytes memory data, uint256 start, string memory pattern) private pure returns (bool) {
        bytes memory patternBytes = bytes(pattern);
        
        if (start + patternBytes.length > data.length) {
            return false;
        }
        
        for (uint256 i = 0; i < patternBytes.length; i++) {
            if (data[start + i] != patternBytes[i]) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * @dev Count key-value pairs in JSON
     */
    // function _countPairs(bytes memory data) private pure returns (uint256) {
    //     uint256 count = 0;
    //     uint256 pos = 0;
        
    //     while (pos < data.length) {
    //         pos = _findChar(data, pos, '"');
    //         if (pos == type(uint256).max) break;
            
    //         pos++; // Skip quote
    //         pos = _findClosingQuote(data, pos);
    //         if (pos == type(uint256).max) break;
            
    //         pos++; // Skip closing quote
    //         pos = _findChar(data, pos, ':');
    //         if (pos == type(uint256).max) break;
            
    //         count++;
    //         pos++;
    //     }
        
    //     return count;
    // }

    /**
     * @dev Find next occurrence of a character
     */
    function _findChar(bytes memory data, uint256 start, bytes1 char) private pure returns (uint256) {
        for (uint256 i = start; i < data.length; i++) {
            if (data[i] == char) {
                return i;
            }
        }
        return type(uint256).max;
    }

    /**
     * @dev Find next quote character
     */
    function _findNextQuote(bytes memory data, uint256 start) private pure returns (uint256) {
        return _findChar(data, start, '"');
    }
}