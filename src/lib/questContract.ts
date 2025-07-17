import { parseEther } from 'viem';
import { writeContract, readContract } from '@wagmi/core';
import { config } from './wagmi';

// QuestSystem contract address from environment variables
// Falls back to default Sepolia address if not configured
export const QUEST_SYSTEM_ADDRESS = (import.meta.env.VITE_QUEST_SYSTEM_ADDRESS || '0xe685751047B223E74131Ce7f4E5A425F44AF64d6') as `0x${string}`;

// Chain ID from environment variables (defaults to Sepolia)
export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '11155111');

// QuestSystem ABI (minimal required functions)
export const QUEST_SYSTEM_ABI = [{ "type": "constructor", "inputs": [], "stateMutability": "nonpayable" }, { "type": "fallback", "stateMutability": "payable" }, { "type": "receive", "stateMutability": "payable" }, { "type": "function", "name": "UPGRADE_INTERFACE_VERSION", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "amountClaimedVesting", "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }, { "name": "", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "canUserClaimReward", "inputs": [{ "name": "_questId", "type": "uint256", "internalType": "uint256" }, { "name": "_user", "type": "address", "internalType": "address" }], "outputs": [{ "name": "canClaim", "type": "bool", "internalType": "bool" }, { "name": "reason", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "cancelQuest", "inputs": [{ "name": "_questId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "claimReward", "inputs": [{ "name": "_questId", "type": "uint256", "internalType": "uint256" }, { "name": "_attestation", "type": "tuple", "internalType": "struct Attestation", "components": [{ "name": "recipient", "type": "address", "internalType": "address" }, { "name": "request", "type": "tuple", "internalType": "struct AttNetworkRequest", "components": [{ "name": "url", "type": "string", "internalType": "string" }, { "name": "header", "type": "string", "internalType": "string" }, { "name": "method", "type": "string", "internalType": "string" }, { "name": "body", "type": "string", "internalType": "string" }] }, { "name": "reponseResolve", "type": "tuple[]", "internalType": "struct AttNetworkResponseResolve[]", "components": [{ "name": "keyName", "type": "string", "internalType": "string" }, { "name": "parseType", "type": "string", "internalType": "string" }, { "name": "parsePath", "type": "string", "internalType": "string" }] }, { "name": "data", "type": "string", "internalType": "string" }, { "name": "attConditions", "type": "string", "internalType": "string" }, { "name": "timestamp", "type": "uint64", "internalType": "uint64" }, { "name": "additionParams", "type": "string", "internalType": "string" }, { "name": "attestors", "type": "tuple[]", "internalType": "struct Attestor[]", "components": [{ "name": "attestorAddr", "type": "address", "internalType": "address" }, { "name": "url", "type": "string", "internalType": "string" }] }, { "name": "signatures", "type": "bytes[]", "internalType": "bytes[]" }, { "name": "extendedData", "type": "string", "internalType": "string" }] }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "claimRewardTest", "inputs": [{ "name": "_questId", "type": "uint256", "internalType": "uint256" }, { "name": "_attestation", "type": "tuple", "internalType": "struct Attestation", "components": [{ "name": "recipient", "type": "address", "internalType": "address" }, { "name": "request", "type": "tuple", "internalType": "struct AttNetworkRequest", "components": [{ "name": "url", "type": "string", "internalType": "string" }, { "name": "header", "type": "string", "internalType": "string" }, { "name": "method", "type": "string", "internalType": "string" }, { "name": "body", "type": "string", "internalType": "string" }] }, { "name": "reponseResolve", "type": "tuple[]", "internalType": "struct AttNetworkResponseResolve[]", "components": [{ "name": "keyName", "type": "string", "internalType": "string" }, { "name": "parseType", "type": "string", "internalType": "string" }, { "name": "parsePath", "type": "string", "internalType": "string" }] }, { "name": "data", "type": "string", "internalType": "string" }, { "name": "attConditions", "type": "string", "internalType": "string" }, { "name": "timestamp", "type": "uint64", "internalType": "uint64" }, { "name": "additionParams", "type": "string", "internalType": "string" }, { "name": "attestors", "type": "tuple[]", "internalType": "struct Attestor[]", "components": [{ "name": "attestorAddr", "type": "address", "internalType": "address" }, { "name": "url", "type": "string", "internalType": "string" }] }, { "name": "signatures", "type": "bytes[]", "internalType": "bytes[]" }, { "name": "extendedData", "type": "string", "internalType": "string" }] }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "claimVestingReward", "inputs": [{ "name": "_questId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "createQuest", "inputs": [{ "name": "_quest", "type": "tuple", "internalType": "struct QuestSystem.Quest", "components": [{ "name": "id", "type": "uint256", "internalType": "uint256" }, { "name": "sponsor", "type": "address", "internalType": "address" }, { "name": "title", "type": "string", "internalType": "string" }, { "name": "description", "type": "string", "internalType": "string" }, { "name": "launch_page", "type": "string", "internalType": "string" }, { "name": "questType", "type": "uint8", "internalType": "enum QuestSystem.QuestType" }, { "name": "status", "type": "uint8", "internalType": "enum QuestSystem.QuestStatus" }, { "name": "verificationParams", "type": "tuple", "internalType": "struct QuestSystem.VerificationParams", "components": [{ "name": "apiUrlPattern", "type": "string", "internalType": "string" }, { "name": "apiEndpointHash", "type": "string", "internalType": "string" }, { "name": "proofValidityPeriod", "type": "uint256", "internalType": "uint256" }, { "name": "targetLikeRetweetId", "type": "string", "internalType": "string" }, { "name": "favoritedJsonPath", "type": "string", "internalType": "string" }, { "name": "retweetedJsonPath", "type": "string", "internalType": "string" }, { "name": "requireFavorite", "type": "bool", "internalType": "bool" }, { "name": "requireRetweet", "type": "bool", "internalType": "bool" }, { "name": "targetQuotedTweetId", "type": "string", "internalType": "string" }, { "name": "quotedStatusIdJsonPath", "type": "string", "internalType": "string" }, { "name": "userIdJsonPath", "type": "string", "internalType": "string" }, { "name": "quoteTweetIdJsonPath", "type": "string", "internalType": "string" }] }, { "name": "totalRewards", "type": "uint256", "internalType": "uint256" }, { "name": "rewardPerUser", "type": "uint256", "internalType": "uint256" }, { "name": "maxParticipants", "type": "uint256", "internalType": "uint256" }, { "name": "participantCount", "type": "uint256", "internalType": "uint256" }, { "name": "startTime", "type": "uint256", "internalType": "uint256" }, { "name": "endTime", "type": "uint256", "internalType": "uint256" }, { "name": "claimEndTime", "type": "uint256", "internalType": "uint256" }, { "name": "isVesting", "type": "bool", "internalType": "bool" }, { "name": "vestingDuration", "type": "uint256", "internalType": "uint256" }] }], "outputs": [], "stateMutability": "payable" }, { "type": "function", "name": "getAllQuestIds", "inputs": [{ "name": "_offset", "type": "uint256", "internalType": "uint256" }, { "name": "_limit", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "questIds", "type": "uint256[]", "internalType": "uint256[]" }, { "name": "totalCount", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "getMultipleQuests", "inputs": [{ "name": "_questIds", "type": "uint256[]", "internalType": "uint256[]" }], "outputs": [{ "name": "", "type": "tuple[]", "internalType": "struct QuestSystem.Quest[]", "components": [{ "name": "id", "type": "uint256", "internalType": "uint256" }, { "name": "sponsor", "type": "address", "internalType": "address" }, { "name": "title", "type": "string", "internalType": "string" }, { "name": "description", "type": "string", "internalType": "string" }, { "name": "launch_page", "type": "string", "internalType": "string" }, { "name": "questType", "type": "uint8", "internalType": "enum QuestSystem.QuestType" }, { "name": "status", "type": "uint8", "internalType": "enum QuestSystem.QuestStatus" }, { "name": "verificationParams", "type": "tuple", "internalType": "struct QuestSystem.VerificationParams", "components": [{ "name": "apiUrlPattern", "type": "string", "internalType": "string" }, { "name": "apiEndpointHash", "type": "string", "internalType": "string" }, { "name": "proofValidityPeriod", "type": "uint256", "internalType": "uint256" }, { "name": "targetLikeRetweetId", "type": "string", "internalType": "string" }, { "name": "favoritedJsonPath", "type": "string", "internalType": "string" }, { "name": "retweetedJsonPath", "type": "string", "internalType": "string" }, { "name": "requireFavorite", "type": "bool", "internalType": "bool" }, { "name": "requireRetweet", "type": "bool", "internalType": "bool" }, { "name": "targetQuotedTweetId", "type": "string", "internalType": "string" }, { "name": "quotedStatusIdJsonPath", "type": "string", "internalType": "string" }, { "name": "userIdJsonPath", "type": "string", "internalType": "string" }, { "name": "quoteTweetIdJsonPath", "type": "string", "internalType": "string" }] }, { "name": "totalRewards", "type": "uint256", "internalType": "uint256" }, { "name": "rewardPerUser", "type": "uint256", "internalType": "uint256" }, { "name": "maxParticipants", "type": "uint256", "internalType": "uint256" }, { "name": "participantCount", "type": "uint256", "internalType": "uint256" }, { "name": "startTime", "type": "uint256", "internalType": "uint256" }, { "name": "endTime", "type": "uint256", "internalType": "uint256" }, { "name": "claimEndTime", "type": "uint256", "internalType": "uint256" }, { "name": "isVesting", "type": "bool", "internalType": "bool" }, { "name": "vestingDuration", "type": "uint256", "internalType": "uint256" }] }], "stateMutability": "view" }, { "type": "function", "name": "getNextQuestId", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "getQuest", "inputs": [{ "name": "_questId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "tuple", "internalType": "struct QuestSystem.Quest", "components": [{ "name": "id", "type": "uint256", "internalType": "uint256" }, { "name": "sponsor", "type": "address", "internalType": "address" }, { "name": "title", "type": "string", "internalType": "string" }, { "name": "description", "type": "string", "internalType": "string" }, { "name": "launch_page", "type": "string", "internalType": "string" }, { "name": "questType", "type": "uint8", "internalType": "enum QuestSystem.QuestType" }, { "name": "status", "type": "uint8", "internalType": "enum QuestSystem.QuestStatus" }, { "name": "verificationParams", "type": "tuple", "internalType": "struct QuestSystem.VerificationParams", "components": [{ "name": "apiUrlPattern", "type": "string", "internalType": "string" }, { "name": "apiEndpointHash", "type": "string", "internalType": "string" }, { "name": "proofValidityPeriod", "type": "uint256", "internalType": "uint256" }, { "name": "targetLikeRetweetId", "type": "string", "internalType": "string" }, { "name": "favoritedJsonPath", "type": "string", "internalType": "string" }, { "name": "retweetedJsonPath", "type": "string", "internalType": "string" }, { "name": "requireFavorite", "type": "bool", "internalType": "bool" }, { "name": "requireRetweet", "type": "bool", "internalType": "bool" }, { "name": "targetQuotedTweetId", "type": "string", "internalType": "string" }, { "name": "quotedStatusIdJsonPath", "type": "string", "internalType": "string" }, { "name": "userIdJsonPath", "type": "string", "internalType": "string" }, { "name": "quoteTweetIdJsonPath", "type": "string", "internalType": "string" }] }, { "name": "totalRewards", "type": "uint256", "internalType": "uint256" }, { "name": "rewardPerUser", "type": "uint256", "internalType": "uint256" }, { "name": "maxParticipants", "type": "uint256", "internalType": "uint256" }, { "name": "participantCount", "type": "uint256", "internalType": "uint256" }, { "name": "startTime", "type": "uint256", "internalType": "uint256" }, { "name": "endTime", "type": "uint256", "internalType": "uint256" }, { "name": "claimEndTime", "type": "uint256", "internalType": "uint256" }, { "name": "isVesting", "type": "bool", "internalType": "bool" }, { "name": "vestingDuration", "type": "uint256", "internalType": "uint256" }] }], "stateMutability": "view" }, { "type": "function", "name": "getQuestDetails", "inputs": [{ "name": "_questId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "quest", "type": "tuple", "internalType": "struct QuestSystem.Quest", "components": [{ "name": "id", "type": "uint256", "internalType": "uint256" }, { "name": "sponsor", "type": "address", "internalType": "address" }, { "name": "title", "type": "string", "internalType": "string" }, { "name": "description", "type": "string", "internalType": "string" }, { "name": "launch_page", "type": "string", "internalType": "string" }, { "name": "questType", "type": "uint8", "internalType": "enum QuestSystem.QuestType" }, { "name": "status", "type": "uint8", "internalType": "enum QuestSystem.QuestStatus" }, { "name": "verificationParams", "type": "tuple", "internalType": "struct QuestSystem.VerificationParams", "components": [{ "name": "apiUrlPattern", "type": "string", "internalType": "string" }, { "name": "apiEndpointHash", "type": "string", "internalType": "string" }, { "name": "proofValidityPeriod", "type": "uint256", "internalType": "uint256" }, { "name": "targetLikeRetweetId", "type": "string", "internalType": "string" }, { "name": "favoritedJsonPath", "type": "string", "internalType": "string" }, { "name": "retweetedJsonPath", "type": "string", "internalType": "string" }, { "name": "requireFavorite", "type": "bool", "internalType": "bool" }, { "name": "requireRetweet", "type": "bool", "internalType": "bool" }, { "name": "targetQuotedTweetId", "type": "string", "internalType": "string" }, { "name": "quotedStatusIdJsonPath", "type": "string", "internalType": "string" }, { "name": "userIdJsonPath", "type": "string", "internalType": "string" }, { "name": "quoteTweetIdJsonPath", "type": "string", "internalType": "string" }] }, { "name": "totalRewards", "type": "uint256", "internalType": "uint256" }, { "name": "rewardPerUser", "type": "uint256", "internalType": "uint256" }, { "name": "maxParticipants", "type": "uint256", "internalType": "uint256" }, { "name": "participantCount", "type": "uint256", "internalType": "uint256" }, { "name": "startTime", "type": "uint256", "internalType": "uint256" }, { "name": "endTime", "type": "uint256", "internalType": "uint256" }, { "name": "claimEndTime", "type": "uint256", "internalType": "uint256" }, { "name": "isVesting", "type": "bool", "internalType": "bool" }, { "name": "vestingDuration", "type": "uint256", "internalType": "uint256" }] }, { "name": "currentStatus", "type": "uint8", "internalType": "enum QuestSystem.QuestStatus" }, { "name": "remainingSlots", "type": "uint256", "internalType": "uint256" }, { "name": "timeUntilStart", "type": "uint256", "internalType": "uint256" }, { "name": "timeUntilEnd", "type": "uint256", "internalType": "uint256" }, { "name": "timeUntilClaimEnd", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "getQuestStatistics", "inputs": [], "outputs": [{ "name": "totalQuests", "type": "uint256", "internalType": "uint256" }, { "name": "activeQuests", "type": "uint256", "internalType": "uint256" }, { "name": "completedQuests", "type": "uint256", "internalType": "uint256" }, { "name": "totalRewardsDistributed", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "getQuestsByParticipant", "inputs": [{ "name": "_user", "type": "address", "internalType": "address" }, { "name": "_offset", "type": "uint256", "internalType": "uint256" }, { "name": "_limit", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "questIds", "type": "uint256[]", "internalType": "uint256[]" }, { "name": "totalCount", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "getQuestsBySponsor", "inputs": [{ "name": "_sponsor", "type": "address", "internalType": "address" }, { "name": "_offset", "type": "uint256", "internalType": "uint256" }, { "name": "_limit", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "questIds", "type": "uint256[]", "internalType": "uint256[]" }, { "name": "totalCount", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "getQuestsByStatus", "inputs": [{ "name": "_status", "type": "uint8", "internalType": "enum QuestSystem.QuestStatus" }, { "name": "_offset", "type": "uint256", "internalType": "uint256" }, { "name": "_limit", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "questIds", "type": "uint256[]", "internalType": "uint256[]" }, { "name": "totalCount", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "getUserStatistics", "inputs": [{ "name": "_user", "type": "address", "internalType": "address" }], "outputs": [{ "name": "participatedQuests", "type": "uint256", "internalType": "uint256" }, { "name": "totalRewardsEarned", "type": "uint256", "internalType": "uint256" }, { "name": "pendingVestingRewards", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "getVestingInfo", "inputs": [{ "name": "_questId", "type": "uint256", "internalType": "uint256" }, { "name": "_user", "type": "address", "internalType": "address" }], "outputs": [{ "name": "vestedAmount", "type": "uint256", "internalType": "uint256" }, { "name": "claimedAmount", "type": "uint256", "internalType": "uint256" }, { "name": "claimableAmount", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "hasQualified", "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }, { "name": "", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "hasUserQualified", "inputs": [{ "name": "_questId", "type": "uint256", "internalType": "uint256" }, { "name": "_user", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "initialize", "inputs": [{ "name": "_primusZKTLS", "type": "address", "internalType": "contract IPrimusZKTLS" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "isQuoteTweetIdUsed", "inputs": [{ "name": "_questId", "type": "uint256", "internalType": "uint256" }, { "name": "_quoteTweetId", "type": "string", "internalType": "string" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "isQuoteTweetUsed", "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }, { "name": "", "type": "string", "internalType": "string" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "owner", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "primusZKTLS", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "contract IPrimusZKTLS" }], "stateMutability": "view" }, { "type": "function", "name": "proxiableUUID", "inputs": [], "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }], "stateMutability": "view" }, { "type": "function", "name": "quests", "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "id", "type": "uint256", "internalType": "uint256" }, { "name": "sponsor", "type": "address", "internalType": "address" }, { "name": "title", "type": "string", "internalType": "string" }, { "name": "description", "type": "string", "internalType": "string" }, { "name": "launch_page", "type": "string", "internalType": "string" }, { "name": "questType", "type": "uint8", "internalType": "enum QuestSystem.QuestType" }, { "name": "status", "type": "uint8", "internalType": "enum QuestSystem.QuestStatus" }, { "name": "verificationParams", "type": "tuple", "internalType": "struct QuestSystem.VerificationParams", "components": [{ "name": "apiUrlPattern", "type": "string", "internalType": "string" }, { "name": "apiEndpointHash", "type": "string", "internalType": "string" }, { "name": "proofValidityPeriod", "type": "uint256", "internalType": "uint256" }, { "name": "targetLikeRetweetId", "type": "string", "internalType": "string" }, { "name": "favoritedJsonPath", "type": "string", "internalType": "string" }, { "name": "retweetedJsonPath", "type": "string", "internalType": "string" }, { "name": "requireFavorite", "type": "bool", "internalType": "bool" }, { "name": "requireRetweet", "type": "bool", "internalType": "bool" }, { "name": "targetQuotedTweetId", "type": "string", "internalType": "string" }, { "name": "quotedStatusIdJsonPath", "type": "string", "internalType": "string" }, { "name": "userIdJsonPath", "type": "string", "internalType": "string" }, { "name": "quoteTweetIdJsonPath", "type": "string", "internalType": "string" }] }, { "name": "totalRewards", "type": "uint256", "internalType": "uint256" }, { "name": "rewardPerUser", "type": "uint256", "internalType": "uint256" }, { "name": "maxParticipants", "type": "uint256", "internalType": "uint256" }, { "name": "participantCount", "type": "uint256", "internalType": "uint256" }, { "name": "startTime", "type": "uint256", "internalType": "uint256" }, { "name": "endTime", "type": "uint256", "internalType": "uint256" }, { "name": "claimEndTime", "type": "uint256", "internalType": "uint256" }, { "name": "isVesting", "type": "bool", "internalType": "bool" }, { "name": "vestingDuration", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "renounceOwnership", "inputs": [], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "transferOwnership", "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "upgradeToAndCall", "inputs": [{ "name": "newImplementation", "type": "address", "internalType": "address" }, { "name": "data", "type": "bytes", "internalType": "bytes" }], "outputs": [], "stateMutability": "payable" }, { "type": "function", "name": "withdrawRemainingRewards", "inputs": [{ "name": "_questId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "event", "name": "Initialized", "inputs": [{ "name": "version", "type": "uint64", "indexed": false, "internalType": "uint64" }], "anonymous": false }, { "type": "event", "name": "OwnershipTransferred", "inputs": [{ "name": "previousOwner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }], "anonymous": false }, { "type": "event", "name": "QuestCanceled", "inputs": [{ "name": "questId", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "QuestCreated", "inputs": [{ "name": "questId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "sponsor", "type": "address", "indexed": true, "internalType": "address" }, { "name": "totalRewards", "type": "uint256", "indexed": false, "internalType": "uint256" }, { "name": "title", "type": "string", "indexed": false, "internalType": "string" }, { "name": "description", "type": "string", "indexed": false, "internalType": "string" }], "anonymous": false }, { "type": "event", "name": "RemainingRewardsWithdrawn", "inputs": [{ "name": "questId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "sponsor", "type": "address", "indexed": true, "internalType": "address" }, { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "RewardClaimed", "inputs": [{ "name": "questId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "recipient", "type": "address", "indexed": true, "internalType": "address" }, { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "Upgraded", "inputs": [{ "name": "implementation", "type": "address", "indexed": true, "internalType": "address" }], "anonymous": false }, { "type": "event", "name": "VestingRewardClaimed", "inputs": [{ "name": "questId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "recipient", "type": "address", "indexed": true, "internalType": "address" }, { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "error", "name": "AddressEmptyCode", "inputs": [{ "name": "target", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC1967InvalidImplementation", "inputs": [{ "name": "implementation", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC1967NonPayable", "inputs": [] }, { "type": "error", "name": "FailedCall", "inputs": [] }, { "type": "error", "name": "InvalidInitialization", "inputs": [] }, { "type": "error", "name": "NotInitializing", "inputs": [] }, { "type": "error", "name": "OwnableInvalidOwner", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "OwnableUnauthorizedAccount", "inputs": [{ "name": "account", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "QuestSystem__AttestationVerificationFailed", "inputs": [] }, { "type": "error", "name": "QuestSystem__CannotCancelWithParticipants", "inputs": [] }, { "type": "error", "name": "QuestSystem__ClaimPeriodNotOver", "inputs": [] }, { "type": "error", "name": "QuestSystem__ContentVerificationFailed", "inputs": [] }, { "type": "error", "name": "QuestSystem__IncorrectETHAmount", "inputs": [] }, { "type": "error", "name": "QuestSystem__InvalidRewardAmount", "inputs": [] }, { "type": "error", "name": "QuestSystem__InvalidTimeSequence", "inputs": [] }, { "type": "error", "name": "QuestSystem__NoRewardsToClaim", "inputs": [] }, { "type": "error", "name": "QuestSystem__NotSponsor", "inputs": [] }, { "type": "error", "name": "QuestSystem__NotVestingQuest", "inputs": [] }, { "type": "error", "name": "QuestSystem__QuestAlreadyCanceled", "inputs": [] }, { "type": "error", "name": "QuestSystem__QuestNotActive", "inputs": [] }, { "type": "error", "name": "QuestSystem__RewardPoolDepleted", "inputs": [] }, { "type": "error", "name": "QuestSystem__UserAlreadyQualified", "inputs": [] }, { "type": "error", "name": "QuestSystem__UserNotQualified", "inputs": [] }, { "type": "error", "name": "UUPSUnauthorizedCallContext", "inputs": [] }, { "type": "error", "name": "UUPSUnsupportedProxiableUUID", "inputs": [{ "name": "slot", "type": "bytes32", "internalType": "bytes32" }] }] as const;

// Mock attestation data from ProofFavAndRetweet.json (updated to match contract structure)
export const MOCK_ATTESTATION = {
  "recipient": "0xB12a1f7035FdCBB4cC5Fa102C01346BD45439Adf",
  "request": {
    "url": "https://x.com/i/api/graphql/FJGOFKfjA67MmT4I9p1qZg/TweetDetail?variables=%7B%22focalTweetId%22%3A%221942933687978365289%22%2C%22with_rux_injections%22%3Afalse%2C%22rankingMode%22%3A%22Relevance%22%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%7D&features=%7B%22rweb_video_screen_enabled%22%3Afalse%2C%22payments_enabled%22%3Afalse%2C%22profile_label_improvements_pcf_label_in_post_enabled%22%3Atrue%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22premium_content_api_read_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22responsive_web_grok_analyze_button_fetch_trends_enabled%22%3Afalse%2C%22responsive_web_grok_analyze_post_followups_enabled%22%3Atrue%2C%22responsive_web_jetfuel_frame%22%3Atrue%2C%22responsive_web_grok_share_attachment_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22responsive_web_grok_show_grok_translated_post%22%3Afalse%2C%22responsive_web_grok_analysis_button_from_backend%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_grok_image_annotation_enabled%22%3Atrue%2C%22responsive_web_grok_community_note_auto_translation_is_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Atrue%2C%22withArticlePlainText%22%3Afalse%2C%22withGrokAnalyze%22%3Afalse%2C%22withDisallowedReplyControls%22%3Afalse%7D",
    "header": "",
    "method": "GET",
    "body": ""
  },
  "responseResolve": [
    {
      "keyName": "favorited",
      "parseType": "STRING",
      "parsePath": "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.favorited"
    },
    {
      "keyName": "retweeted",
      "parseType": "STRING",
      "parsePath": "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.retweeted"
    }
  ],
  "data": "{\"favorited\":\"true\",\"retweeted\":\"true\"}",
  "attConditions": "[{\"op\":\"REVEAL_STRING\",\"field\":\"$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.favorited\"},{\"op\":\"REVEAL_STRING\",\"field\":\"$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.retweeted\"}]",
  "timestamp": 1752473912632,
  "additionParams": "{\"algorithmType\":\"proxytls\"}",
  "attestors": [
    {
      "attestorAddr": "0xdb736b13e2f522dbe18b2015d0291e4b193d8ef6",
      "url": "https://attestor.primus.network"
    }
  ],
  "signatures": ["0x2c54ef20a94e5f892341bd47db97e9792eff8a273bdc732e914efd00e9e1356a5d06db1bf11daa8ea1ca0c7ac6917eafdd58db6f8490941236096500fd2a5b471b"],
  "extendedData": ""
};

// Extract tweet ID from URL for testing
export function extractTweetIdFromUrl(url: string): string {
  // From the mock data, the focalTweetId is 1942933687978365289
  const match = url.match(/focalTweetId%22%3A%22(\d+)%22/);
  return match ? match[1] : '1942933687978365289'; // fallback to mock data tweet ID
}

// Create LikeAndRetweet quest
export async function createLikeAndRetweetQuest(params: {
  title: string; // Quest title
  description: string; // Quest description
  launch_page: string; // Complete URL link to the tweet
  totalRewards: string; // in ETH
  rewardPerUser: string; // in ETH
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  claimEndTime: number; // Unix timestamp
  requireFavorite: boolean;
  requireRetweet: boolean;
  isVesting?: boolean;
  vestingDuration?: number; // in seconds
}) {
  const totalRewardsWei = parseEther(params.totalRewards);
  const rewardPerUserWei = parseEther(params.rewardPerUser);
  const maxParticipants = Number(totalRewardsWei / rewardPerUserWei);

  // Use data from mock attestation for verification parameters
  const tweetId = extractTweetIdFromUrl(MOCK_ATTESTATION.request.url);

  const quest = {
    id: 0n, // Will be set by contract
    sponsor: '0x0000000000000000000000000000000000000000', // Will be set by contract
    title: params.title,
    description: params.description,
    launch_page: params.launch_page,
    questType: 0, // LikeAndRetweet
    status: 0, // Pending
    verificationParams: {
      apiUrlPattern: 'https://x.com/i/api/graphql/',
      apiEndpointHash: 'FJGOFKfjA67MmT4I9p1qZg', // From mock data URL
      proofValidityPeriod: 3600n, // 1 hour
      targetLikeRetweetId: tweetId,
      favoritedJsonPath: '$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.favorited',
      retweetedJsonPath: '$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.retweeted',
      requireFavorite: params.requireFavorite,
      requireRetweet: params.requireRetweet,
      targetQuotedTweetId: '', // Not used for LikeAndRetweet
      quotedStatusIdJsonPath: '', // Not used for LikeAndRetweet
      userIdJsonPath: '', // Not used for LikeAndRetweet
      quoteTweetIdJsonPath: '' // Not used for LikeAndRetweet
    },
    totalRewards: totalRewardsWei,
    rewardPerUser: rewardPerUserWei,
    maxParticipants: BigInt(maxParticipants),
    participantCount: 0n,
    startTime: BigInt(params.startTime),
    endTime: BigInt(params.endTime),
    claimEndTime: BigInt(params.claimEndTime),
    isVesting: params.isVesting || false,
    vestingDuration: BigInt(params.vestingDuration || 0)
  };

  console.log(JSON.stringify(quest, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));

  const hash = await writeContract(config, {
    address: QUEST_SYSTEM_ADDRESS,
    abi: QUEST_SYSTEM_ABI,
    functionName: 'createQuest',
    args: [quest],
    value: totalRewardsWei,
    chainId: CHAIN_ID,
  });

  return hash;
}

// Get quest by ID
export async function getQuest(questId: bigint) {
  const quest = await readContract(config, {
    address: QUEST_SYSTEM_ADDRESS,
    abi: QUEST_SYSTEM_ABI,
    functionName: 'getQuest',
    args: [questId],
    chainId: CHAIN_ID,
  });

  return quest;
}

// Get next quest ID
export async function getNextQuestId() {
  const nextId = await readContract(config, {
    address: QUEST_SYSTEM_ADDRESS,
    abi: QUEST_SYSTEM_ABI,
    functionName: 'getNextQuestId',
    chainId: CHAIN_ID,
  });

  return nextId;
}

// Claim reward with mock attestation
export async function claimReward(questId: bigint, attestation: any) {
  const hash = await writeContract(config, {
    address: QUEST_SYSTEM_ADDRESS,
    abi: QUEST_SYSTEM_ABI,
    functionName: 'claimReward',
    args: [questId, attestation],
    chainId: CHAIN_ID,
    value: 0n
  });

  return hash;
}

// Claim reward with ZKTLS attestation
export async function claimRewardWithAttestation(questId: bigint, attestation: unknown) {
  // Validate attestation structure before sending to contract
  const att = attestation as any;

  if (!att) {
    throw new Error('Attestation is required');
  }

  // Ensure required fields exist
  if (!att.recipient) {
    throw new Error('Attestation missing recipient');
  }

  if (!att.request) {
    throw new Error('Attestation missing request');
  }

  if (!Array.isArray(att.responseResolve)) {
    throw new Error('Attestation responseResolve must be an array');
  }

  if (!Array.isArray(att.signatures)) {
    throw new Error('Attestation signatures must be an array');
  }

  console.log('Calling claimReward with:', {
    questId: questId.toString(),
    attestation: att
  });

  try {
    // Add contract simulation for debugging
    console.log('Simulating contract call first...');

    // Use viem's simulateContract to catch errors before wallet submission
    const { request } = await import('@wagmi/core').then(m => m.simulateContract(config, {
      address: QUEST_SYSTEM_ADDRESS,
      abi: QUEST_SYSTEM_ABI,
      functionName: 'claimReward',
      args: [questId, attestation],
      chainId: CHAIN_ID,
    }));

    console.log('Contract simulation successful, proceeding with actual transaction...');

    const hash = await writeContract(config, request);
    return hash;
  } catch (simulationError: any) {
    console.error('Contract simulation failed:', simulationError);

    // Parse simulation error to identify specific contract requirement failures
    let errorMessage = 'Contract execution would fail';

    if (simulationError?.message) {
      const msg = simulationError.message.toLowerCase();

      if (msg.includes('questsystem__questnotactive')) {
        errorMessage = 'Quest is not currently active';
      } else if (msg.includes('questsystem__useralreadyqualified')) {
        errorMessage = 'User has already qualified for this quest';
      } else if (msg.includes('questsystem__rewardpooldepleted')) {
        errorMessage = 'Quest reward pool is depleted (max participants reached)';
      } else if (msg.includes('questsystem__attestationverificationfailed')) {
        errorMessage = 'ZKTLS attestation verification failed';
      } else if (msg.includes('questsystem__contentverificationfailed')) {
        errorMessage = 'Quest content verification failed (check if you liked/retweeted the correct tweet)';
      } else if (msg.includes('revert')) {
        // Extract revert reason if available
        const revertMatch = msg.match(/revert (.+)/);
        if (revertMatch) {
          errorMessage = `Contract reverted: ${revertMatch[1]}`;
        }
      }

      errorMessage += `\n\nDetailed error: ${simulationError.message}`;
    }

    throw new Error(errorMessage);
  }
}

// Get all quest IDs with pagination
export async function getAllQuestIds(offset: number = 0, limit: number = 10) {
  const result = await readContract(config, {
    address: QUEST_SYSTEM_ADDRESS,
    abi: QUEST_SYSTEM_ABI,
    functionName: 'getAllQuestIds',
    args: [BigInt(offset), BigInt(limit)],
    chainId: CHAIN_ID,
  });

  return {
    questIds: result[0],
    totalCount: result[1]
  };
}

// Get multiple quests by IDs
export async function getMultipleQuests(questIds: bigint[]) {
  const quests = await readContract(config, {
    address: QUEST_SYSTEM_ADDRESS,
    abi: QUEST_SYSTEM_ABI,
    functionName: 'getMultipleQuests',
    args: [questIds],
    chainId: CHAIN_ID,
  });

  return quests;
}

// Check if user has qualified for a quest
export async function hasUserQualified(questId: bigint, userAddress: string) {
  const hasQualified = await readContract(config, {
    address: QUEST_SYSTEM_ADDRESS,
    abi: QUEST_SYSTEM_ABI,
    functionName: 'hasUserQualified',
    args: [questId, userAddress],
    chainId: CHAIN_ID,
  });

  return hasQualified;
}

// Get all available quests
export async function getAllQuests(limit: number = 50) {
  try {
    const { questIds, totalCount } = await getAllQuestIds(0, limit);

    if (questIds.length === 0) {
      return { quests: [], totalCount };
    }

    const quests = await getMultipleQuests(questIds);
    return { quests, totalCount };
  } catch (error) {
    console.error('Error fetching quests:', error);
    return { quests: [], totalCount: 0n };
  }
}