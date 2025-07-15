// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {IPrimusZKTLS, Attestation} from "../../lib/zktls-contracts/src/IPrimusZKTLS.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../utils/JsonParser.sol";
import "../utils/StringUtils.sol";

/**
 * @title SimpleQuestSystem
 * @notice A simplified, non-upgradeable version of QuestSystem for testing purposes
 * @dev This contract removes the upgradeable complexity to make testing easier
 */
contract SimpleQuestSystem {
    using JsonParser for string;
    using StringUtils for string;

    // --- Enums and Structs ---

    enum QuestStatus { Pending, Active, Ended, Closed, Canceled }
    enum QuestType { LikeAndRetweet, QuoteTweet }

    struct VerificationParams {
        string apiUrlPattern;           // API URL pattern, e.g., "https://x.com/i/api/graphql/"
        string apiEndpointHash;         // API Endpoint hash for precise matching
        uint256 proofValidityPeriod;    // zkTLS proof validity period in seconds
        
        // LikeAndRetweet type parameters
        string targetLikeRetweetId;     // Target tweet ID for like/retweet
        string favoritedJsonPath;       // JSON path for "favorited" status
        string retweetedJsonPath;       // JSON path for "retweeted" status
        bool requireFavorite;           // Whether favorite is required
        bool requireRetweet;            // Whether retweet is required
        
        // QuoteTweet type parameters
        string targetQuotedTweetId;     // Target tweet ID to be quoted
        string quotedStatusIdJsonPath;  // JSON path for "quoted_status_id_str"
        string userIdJsonPath;          // JSON path for "user_id_str"
        string quoteTweetIdJsonPath;    // JSON path for user's own tweet ID ("id_str")
    }

    struct Quest {
        uint256 id;                     // Unique quest ID
        address sponsor;                // Quest creator
        QuestType questType;            // Quest type
        QuestStatus status;             // Quest status
        VerificationParams verificationParams; // Verification parameters
        
        uint256 totalRewards;           // Total ETH rewards (no token support)
        uint256 rewardPerUser;          // ETH reward per user
        uint256 maxParticipants;        // Maximum number of participants
        uint256 participantCount;       // Current participant count
        
        uint256 startTime;              // Quest start time
        uint256 endTime;                // Quest end time
        uint256 claimEndTime;           // Reward claim deadline
        
        bool isVesting;                 // Whether vesting mode is enabled
        uint256 vestingDuration;        // Total vesting duration
    }

    // --- State Variables ---

    IPrimusZKTLS public primusZKTLS;
    uint256 private _nextQuestId;
    address public owner;

    mapping(uint256 => Quest) public quests;
    mapping(uint256 => mapping(address => bool)) public hasQualified;
    mapping(uint256 => mapping(string => bool)) public isQuoteTweetUsed;
    mapping(uint256 => mapping(address => uint256)) public amountClaimedVesting;

    // --- Events ---

    event QuestCreated(uint256 indexed questId, address indexed sponsor, uint256 totalRewards);
    event RewardClaimed(uint256 indexed questId, address indexed recipient, uint256 amount);
    event VestingRewardClaimed(uint256 indexed questId, address indexed recipient, uint256 amount);
    event QuestCanceled(uint256 indexed questId);
    event RemainingRewardsWithdrawn(uint256 indexed questId, address indexed sponsor, uint256 amount);

    // --- Errors ---

    error QuestSystem__InvalidRewardAmount();
    error QuestSystem__InvalidTimeSequence();
    error QuestSystem__IncorrectETHAmount();
    error QuestSystem__NotSponsor();
    error QuestSystem__CannotCancelWithParticipants();
    error QuestSystem__QuestAlreadyCanceled();
    error QuestSystem__ClaimPeriodNotOver();
    error QuestSystem__QuestNotActive();
    error QuestSystem__UserAlreadyQualified();
    error QuestSystem__RewardPoolDepleted();
    error QuestSystem__AttestationVerificationFailed();
    error QuestSystem__ContentVerificationFailed();
    error QuestSystem__NotVestingQuest();
    error QuestSystem__UserNotQualified();
    error QuestSystem__NoRewardsToClaim();
    error QuestSystem__NotOwner();

    // --- Modifiers ---

    modifier onlySponsor(uint256 _questId) {
        if (quests[_questId].sponsor != msg.sender) {
            revert QuestSystem__NotSponsor();
        }
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert QuestSystem__NotOwner();
        }
        _;
    }

    // --- Constructor ---

    constructor(IPrimusZKTLS _primusZKTLS, address _owner) {
        primusZKTLS = _primusZKTLS;
        owner = _owner;
        _nextQuestId = 1;
    }

    // --- Sponsor Functions ---

    /**
     * @notice Create a new quest with ETH rewards
     * @param _quest Quest parameters
     */
    function createQuest(Quest calldata _quest) external payable {
        if (_quest.rewardPerUser == 0) {
            revert QuestSystem__InvalidRewardAmount();
        }
        if (_quest.totalRewards == 0 || _quest.totalRewards % _quest.rewardPerUser != 0) {
            revert QuestSystem__InvalidRewardAmount();
        }
        if (_quest.startTime >= _quest.endTime || _quest.endTime >= _quest.claimEndTime) {
            revert QuestSystem__InvalidTimeSequence();
        }
        if (msg.value != _quest.totalRewards) {
            revert QuestSystem__IncorrectETHAmount();
        }

        uint256 questId = _nextQuestId;
        quests[questId] = _quest;
        quests[questId].id = questId;
        quests[questId].sponsor = msg.sender;
        quests[questId].status = QuestStatus.Pending;
        quests[questId].maxParticipants = _quest.totalRewards / _quest.rewardPerUser;
        
        _nextQuestId++;
        emit QuestCreated(questId, msg.sender, _quest.totalRewards);
    }

    /**
     * @notice Cancel a quest and refund rewards (only if no participants)
     * @param _questId Quest ID to cancel
     */
    function cancelQuest(uint256 _questId) external onlySponsor(_questId) {
        Quest storage q = quests[_questId];
        if (q.participantCount != 0) {
            revert QuestSystem__CannotCancelWithParticipants();
        }
        if (q.status == QuestStatus.Canceled) {
            revert QuestSystem__QuestAlreadyCanceled();
        }

        q.status = QuestStatus.Canceled;
        _transferETH(q.sponsor, q.totalRewards);
        emit QuestCanceled(_questId);
    }

    /**
     * @notice Withdraw remaining rewards after claim period ends
     * @param _questId Quest ID
     */
    function withdrawRemainingRewards(uint256 _questId) external onlySponsor(_questId) {
        Quest storage q = quests[_questId];
        if (block.timestamp <= q.claimEndTime) {
            revert QuestSystem__ClaimPeriodNotOver();
        }
        
        uint256 totalClaimed = q.isVesting ? _calculateTotalVestedClaimed(_questId) : q.participantCount * q.rewardPerUser;
        uint256 remaining = q.totalRewards - totalClaimed;

        if (remaining > 0) {
            q.totalRewards = totalClaimed; // Prevent further withdrawals
            _transferETH(q.sponsor, remaining);
            emit RemainingRewardsWithdrawn(_questId, q.sponsor, remaining);
        }
    }

    // --- User Functions ---

    /**
     * @notice Claim reward by submitting zkTLS attestation
     * @param _questId Quest ID
     * @param _attestation zkTLS attestation proof
     */
    function claimReward(uint256 _questId, Attestation calldata _attestation) external {
        Quest storage q = quests[_questId];
        _updateQuestStatus(_questId);
        
        if (q.status != QuestStatus.Active) {
            revert QuestSystem__QuestNotActive();
        }
        if (hasQualified[_questId][msg.sender]) {
            revert QuestSystem__UserAlreadyQualified();
        }
        if (q.participantCount >= q.maxParticipants) {
            revert QuestSystem__RewardPoolDepleted();
        }
        
        // Verify zkTLS attestation
        if (!primusZKTLS.verifyAttestation(_attestation)) {
            revert QuestSystem__AttestationVerificationFailed();
        }
        
        // Verify quest-specific content
        if (!_verifyQuestContent(_questId, _attestation)) {
            revert QuestSystem__ContentVerificationFailed();
        }

        // Mark user as qualified and increment participant count
        hasQualified[_questId][msg.sender] = true;
        q.participantCount++;

        // For quote tweet, mark the tweet as used
        if (q.questType == QuestType.QuoteTweet) {
            string memory userQuoteTweetId = _attestation.data.getString("id_str");
            isQuoteTweetUsed[_questId][userQuoteTweetId] = true;
        }

        if (!q.isVesting) {
            // Direct reward: transfer immediately
            _transferETH(msg.sender, q.rewardPerUser);
            emit RewardClaimed(_questId, msg.sender, q.rewardPerUser);
        }
        // For vesting, qualification is complete. User calls claimVestingReward separately.
    }
    
    /**
     * @notice Claim vesting rewards (for vesting quests only)
     * @param _questId Quest ID
     */
    function claimVestingReward(uint256 _questId) external {
        Quest storage q = quests[_questId];
        if (!q.isVesting) {
            revert QuestSystem__NotVestingQuest();
        }
        if (!hasQualified[_questId][msg.sender]) {
            revert QuestSystem__UserNotQualified();
        }
        
        _updateQuestStatus(_questId);
        
        uint256 vestedAmount = _calculateVestedAmount(_questId, msg.sender);
        uint256 alreadyClaimed = amountClaimedVesting[_questId][msg.sender];
        uint256 amountToClaim = vestedAmount - alreadyClaimed;
        
        if (amountToClaim == 0) {
            revert QuestSystem__NoRewardsToClaim();
        }

        amountClaimedVesting[_questId][msg.sender] = vestedAmount;
        _transferETH(msg.sender, amountToClaim);
        emit VestingRewardClaimed(_questId, msg.sender, amountToClaim);
    }

    // --- Internal & View Functions ---

    /**
     * @notice Verify quest-specific content in attestation
     * @param _questId Quest ID
     * @param _attestation zkTLS attestation
     * @return bool True if content verification passes
     */
    function _verifyQuestContent(uint256 _questId, Attestation calldata _attestation) internal view returns (bool) {
        Quest storage q = quests[_questId];
        VerificationParams storage params = q.verificationParams;

        // Check proof validity period
        if (block.timestamp - _attestation.timestamp > params.proofValidityPeriod) {
            return false;
        }
        
        // Check recipient matches sender
        if (_attestation.recipient != msg.sender) {
            return false;
        }

        if (q.questType == QuestType.LikeAndRetweet) {
            return _verifyLikeAndRetweet(q, _attestation);
        }
        if (q.questType == QuestType.QuoteTweet) {
            return _verifyQuoteTweet(q, _attestation);
        }
        return false;
    }

    /**
     * @notice Verify like and retweet quest content
     */
    function _verifyLikeAndRetweet(Quest storage _quest, Attestation calldata _attestation) private view returns (bool) {
        VerificationParams storage params = _quest.verificationParams;
        
        // Check URL contains target tweet ID
        if (!_attestation.request.url.contains(params.targetLikeRetweetId)) {
            return false;
        }
        
        string memory dataJson = _attestation.data;
        
        // Check favorite requirement
        if (params.requireFavorite && !dataJson.getBool("favorited")) {
            return false;
        }
        
        // Check retweet requirement
        if (params.requireRetweet && !dataJson.getBool("retweeted")) {
            return false;
        }

        return true;
    }

    /**
     * @notice Verify quote tweet quest content
     */
    function _verifyQuoteTweet(Quest storage _quest, Attestation calldata _attestation) private view returns (bool) {
        VerificationParams storage params = _quest.verificationParams;
        string memory dataJson = _attestation.data;
        
        string memory userQuoteTweetId = dataJson.getString("id_str");
        string memory quotedStatusId = dataJson.getString("quoted_status_id_str");
        
        // Check required fields exist
        if (bytes(userQuoteTweetId).length == 0) {
            return false;
        }
        
        // Check if quote tweet already used
        if (isQuoteTweetUsed[_quest.id][userQuoteTweetId]) {
            return false;
        }
        
        // Check URL matches user's tweet
        if (!_attestation.request.url.contains(userQuoteTweetId)) {
            return false;
        }
        
        // Check quoted tweet ID matches target
        if (!quotedStatusId.equals(params.targetQuotedTweetId)) {
            return false;
        }
        
        return true;
    }

    /**
     * @notice Update quest status based on current time
     */
    function _updateQuestStatus(uint256 _questId) internal {
        Quest storage q = quests[_questId];
        if (q.status == QuestStatus.Canceled) return;

        if (block.timestamp > q.claimEndTime) {
            q.status = QuestStatus.Closed;
        } else if (block.timestamp > q.endTime) {
            q.status = QuestStatus.Ended;
        } else if (block.timestamp >= q.startTime) {
            q.status = QuestStatus.Active;
        }
    }
    
    /**
     * @notice Transfer ETH to recipient
     */
    function _transferETH(address _to, uint256 _amount) internal {
        if (_amount == 0) return;
        (bool success, ) = payable(_to).call{value: _amount}("");
        require(success, "ETH transfer failed");
    }
    
    /**
     * @notice Calculate vested amount for a user
     */
    function _calculateVestedAmount(uint256 _questId, address /* _user */) internal view returns (uint256) {
        Quest storage q = quests[_questId];
        if (block.timestamp <= q.startTime) return 0;
        
        uint256 vestingEnd = q.startTime + q.vestingDuration;
        if (block.timestamp >= vestingEnd) return q.rewardPerUser;
        
        uint256 elapsed = block.timestamp - q.startTime;
        return (q.rewardPerUser * elapsed) / q.vestingDuration;
    }

    /**
     * @notice Calculate total vested amount claimed across all users
     * @dev This is a simplified implementation for demo purposes
     */
    function _calculateTotalVestedClaimed(uint256 _questId) internal view returns (uint256) {
        // In a production system, this would need to track total claimed amounts
        // For this simplified version, we estimate based on participant count
        Quest storage q = quests[_questId];
        if (q.participantCount == 0) return 0;
        
        // Estimate average claimed per user and multiply by participant count
        uint256 averageVested = _calculateVestedAmount(_questId, address(0));
        return (averageVested * q.participantCount);
    }
    
    // --- View Functions ---

    /**
     * @notice Get quest details
     */
    function getQuest(uint256 _questId) external view returns (Quest memory) {
        return quests[_questId];
    }

    /**
     * @notice Get next quest ID
     */
    function getNextQuestId() external view returns (uint256) {
        return _nextQuestId;
    }

    /**
     * @notice Check if user has qualified for a quest
     */
    function hasUserQualified(uint256 _questId, address _user) external view returns (bool) {
        return hasQualified[_questId][_user];
    }

    /**
     * @notice Check if quote tweet has been used
     */
    function isQuoteTweetIdUsed(uint256 _questId, string calldata _quoteTweetId) external view returns (bool) {
        return isQuoteTweetUsed[_questId][_quoteTweetId];
    }

    /**
     * @notice Get vesting reward info for a user
     */
    function getVestingInfo(uint256 _questId, address _user) external view returns (uint256 vestedAmount, uint256 claimedAmount, uint256 claimableAmount) {
        Quest storage q = quests[_questId];
        if (!q.isVesting || !hasQualified[_questId][_user]) {
            return (0, 0, 0);
        }
        
        vestedAmount = _calculateVestedAmount(_questId, _user);
        claimedAmount = amountClaimedVesting[_questId][_user];
        claimableAmount = vestedAmount > claimedAmount ? vestedAmount - claimedAmount : 0;
    }

    // --- Fallback Functions ---

    receive() external payable {}
    fallback() external payable {}
}