// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

library StringUtils {
    /**
     * @dev Returns true if `str` starts with `prefix`
     */
    function startsWith(string memory str, string memory prefix) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory prefixBytes = bytes(prefix);
        
        if (prefixBytes.length > strBytes.length) {
            return false;
        }
        
        for (uint256 i = 0; i < prefixBytes.length; i++) {
            if (strBytes[i] != prefixBytes[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Returns true if `str` ends with `suffix`
     */
    function suffixWith(string memory str, string memory suffix) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory suffixBytes = bytes(suffix);
        
        if (suffixBytes.length > strBytes.length) {
            return false;
        }
        
        uint256 offset = strBytes.length - suffixBytes.length;
        
        for (uint256 i = 0; i < suffixBytes.length; i++) {
            if (strBytes[offset + i] != suffixBytes[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Returns true if two strings are equal
     */
    function equals(string memory str1, string memory str2) internal pure returns (bool) {
        return keccak256(bytes(str1)) == keccak256(bytes(str2));
    }
    
    /**
     * @dev Extracts substring before the first occurrence of `delimiter`
     * Returns the original string if delimiter is not found
     */
    function extractStr(string memory str, string memory delimiter) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory delimiterBytes = bytes(delimiter);
        
        if (delimiterBytes.length == 0 || strBytes.length == 0) {
            return str;
        }
        
        // Find the delimiter
        for (uint256 i = 0; i <= strBytes.length - delimiterBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < delimiterBytes.length; j++) {
                if (strBytes[i + j] != delimiterBytes[j]) {
                    found = false;
                    break;
                }
            }
            
            if (found) {
                // Extract substring before delimiter
                bytes memory result = new bytes(i);
                for (uint256 k = 0; k < i; k++) {
                    result[k] = strBytes[k];
                }
                return string(result);
            }
        }
        
        // Delimiter not found, return original string
        return str;
    }
    
    /**
     * @dev Extracts value for a given key from a key-value string format
     * Expected format: "key1=value1&key2=value2" or similar
     * Returns empty string if key is not found
     */
    function extractValue(string memory str, string memory key) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory keyBytes = bytes(key);
        
        if (keyBytes.length == 0 || strBytes.length == 0) {
            return "";
        }
        
        // Look for "key="
        string memory keyPattern = string(abi.encodePacked(key, "="));
        bytes memory keyPatternBytes = bytes(keyPattern);
        
        for (uint256 i = 0; i <= strBytes.length - keyPatternBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < keyPatternBytes.length; j++) {
                if (strBytes[i + j] != keyPatternBytes[j]) {
                    found = false;
                    break;
                }
            }
            
            if (found) {
                // Found key=, now extract value until next & or end of string
                uint256 valueStart = i + keyPatternBytes.length;
                uint256 valueEnd = strBytes.length;
                
                // Find the end of the value (next & character)
                for (uint256 k = valueStart; k < strBytes.length; k++) {
                    if (strBytes[k] == "&") {
                        valueEnd = k;
                        break;
                    }
                }
                
                // Extract the value
                bytes memory result = new bytes(valueEnd - valueStart);
                for (uint256 l = 0; l < valueEnd - valueStart; l++) {
                    result[l] = strBytes[valueStart + l];
                }
                
                return string(result);
            }
        }
        
        return "";
    }
    
    /**
     * @dev Returns the length of a string
     */
    function length(string memory str) internal pure returns (uint256) {
        return bytes(str).length;
    }
    
    /**
     * @dev Returns true if string is empty
     */
    function isEmpty(string memory str) internal pure returns (bool) {
        return bytes(str).length == 0;
    }
    
    /**
     * @dev Converts string to lowercase (ASCII only)
     */
    function toLowerCase(string memory str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(strBytes.length);
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            // Convert A-Z to a-z
            if (strBytes[i] >= 0x41 && strBytes[i] <= 0x5A) {
                result[i] = bytes1(uint8(strBytes[i]) + 32);
            } else {
                result[i] = strBytes[i];
            }
        }
        
        return string(result);
    }
    
    /**
     * @dev Returns true if `str` contains `substring`
     */
    function contains(string memory str, string memory substring) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory subBytes = bytes(substring);
        
        if (subBytes.length == 0) {
            return true; // Empty string is contained in any string
        }
        
        if (subBytes.length > strBytes.length) {
            return false;
        }
        
        for (uint256 i = 0; i <= strBytes.length - subBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < subBytes.length; j++) {
                if (strBytes[i + j] != subBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Splits a string by delimiter and returns the part at the given index
     * Returns empty string if index is out of bounds
     */
    function split(string memory str, string memory delimiter, uint256 index) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory delimiterBytes = bytes(delimiter);
        
        if (delimiterBytes.length == 0) {
            return index == 0 ? str : "";
        }
        
        uint256 currentIndex = 0;
        uint256 start = 0;
        
        for (uint256 i = 0; i <= strBytes.length - delimiterBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < delimiterBytes.length; j++) {
                if (strBytes[i + j] != delimiterBytes[j]) {
                    found = false;
                    break;
                }
            }
            
            if (found) {
                if (currentIndex == index) {
                    // Extract substring from start to i
                    bytes memory result = new bytes(i - start);
                    for (uint256 k = 0; k < i - start; k++) {
                        result[k] = strBytes[start + k];
                    }
                    return string(result);
                }
                currentIndex++;
                start = i + delimiterBytes.length;
                i += delimiterBytes.length - 1; // Skip delimiter
            }
        }
        
        // Check if we're looking for the last part
        if (currentIndex == index && start < strBytes.length) {
            bytes memory result = new bytes(strBytes.length - start);
            for (uint256 k = 0; k < strBytes.length - start; k++) {
                result[k] = strBytes[start + k];
            }
            return string(result);
        }
        
        return "";
    }
}