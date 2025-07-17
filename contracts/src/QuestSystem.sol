// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPrimusZKTLS, Attestation} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/JsonParser.sol";
import "./utils/StringUtils.sol";

/**
 * @title QuestSystem
 * @author Primus Labs
 * @notice A decentralized system for creating and verifying quests using Primus zkTLS attestations.
 * It supports various quest types like 'Like & Retweet' and 'Quote Tweet',
 * with direct or vesting reward mechanisms using ETH only.
 * This contract is deployed directly as a standalone contract.
 */
contract QuestSystem is Ownable {
    using JsonParser for string;
    using StringUtils for string;

    // --- Enums and Structs ---

    enum QuestStatus {
        Pending,
        Active,
        Ended,
        Closed,
        Canceled
    }
    enum QuestType {
        LikeAndRetweet,
        QuoteTweet
    }

    struct VerificationParams {
        string apiUrlPattern; // API URL pattern, e.g., "https://x.com/i/api/graphql/"
        string apiEndpointHash; // API Endpoint hash for precise matching
        uint256 proofValidityPeriod; // zkTLS proof validity period in seconds
        // LikeAndRetweet type parameters
        string targetLikeRetweetId; // Target tweet ID for like/retweet
        string favoritedJsonPath; // JSON path for "favorited" status
        string retweetedJsonPath; // JSON path for "retweeted" status
        bool requireFavorite; // Whether favorite is required
        bool requireRetweet; // Whether retweet is required
        // QuoteTweet type parameters
        string targetQuotedTweetId; // Target tweet ID to be quoted
        string quotedStatusIdJsonPath; // JSON path for "quoted_status_id_str"
        string userIdJsonPath; // JSON path for "user_id_str"
        string quoteTweetIdJsonPath; // JSON path for user's own tweet ID ("id_str")
    }

    struct Quest {
        uint256 id; // Unique quest ID
        address sponsor; // Quest creator
        string title; // Quest title
        string description; // Quest description
        string launch_page; // Complete URL link to the tweet
        QuestType questType; // Quest type
        QuestStatus status; // Quest status
        VerificationParams verificationParams; // Verification parameters
        uint256 totalRewards; // Total ETH rewards (no token support)
        uint256 rewardPerUser; // ETH reward per user
        uint256 maxParticipants; // Maximum number of participants
        uint256 participantCount; // Current participant count
        uint256 startTime; // Quest start time
        uint256 endTime; // Quest end time
        uint256 claimEndTime; // Reward claim deadline
        bool isVesting; // Whether vesting mode is enabled
        uint256 vestingDuration; // Total vesting duration
    }

    // --- State Variables ---

    IPrimusZKTLS public primusZKTLS;
    uint256 private _nextQuestId;

    mapping(uint256 => Quest) public quests;
    mapping(uint256 => mapping(address => bool)) public hasQualified;
    mapping(uint256 => mapping(string => bool)) public isQuoteTweetUsed;
    mapping(uint256 => mapping(address => uint256)) public amountClaimedVesting;

    // --- Events ---

    event QuestCreated(
        uint256 indexed questId,
        address indexed sponsor,
        uint256 totalRewards,
        string title,
        string description
    );
    event RewardClaimed(
        uint256 indexed questId,
        address indexed recipient,
        uint256 amount
    );
    event VestingRewardClaimed(
        uint256 indexed questId,
        address indexed recipient,
        uint256 amount
    );
    event QuestCanceled(uint256 indexed questId);
    event RemainingRewardsWithdrawn(
        uint256 indexed questId,
        address indexed sponsor,
        uint256 amount
    );

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

    // --- Modifiers ---

    modifier onlySponsor(uint256 _questId) {
        if (quests[_questId].sponsor != msg.sender) {
            revert QuestSystem__NotSponsor();
        }
        _;
    }

    // --- Constructor ---

    constructor(address _primusZKTLS) Ownable(msg.sender) {
        primusZKTLS = IPrimusZKTLS(_primusZKTLS);
        _nextQuestId = 1;
    }

    // --- Sponsor Functions ---

    /**
     * @notice Create a new quest with ETH rewards
     * @param _quest Quest parameters
     */
    function createQuest(Quest calldata _quest) external payable {
        _validateQuestParameters(_quest);

        uint256 questId = _nextQuestId;
        _storeQuest(questId, _quest);

        _nextQuestId++;
        emit QuestCreated(
            questId,
            msg.sender,
            _quest.totalRewards,
            _quest.title,
            _quest.description
        );
    }

    /**
     * @notice Validate quest parameters
     * @param _quest Quest parameters to validate
     */
    function _validateQuestParameters(Quest calldata _quest) internal view {
        if (_quest.rewardPerUser == 0) {
            revert QuestSystem__InvalidRewardAmount();
        }
        if (
            _quest.totalRewards == 0 ||
            _quest.totalRewards % _quest.rewardPerUser != 0
        ) {
            revert QuestSystem__InvalidRewardAmount();
        }
        if (
            _quest.startTime >= _quest.endTime ||
            _quest.endTime >= _quest.claimEndTime
        ) {
            revert QuestSystem__InvalidTimeSequence();
        }
        if (msg.value != _quest.totalRewards) {
            revert QuestSystem__IncorrectETHAmount();
        }
    }

    /**
     * @notice Store quest in storage
     * @param questId Quest ID
     * @param _quest Quest parameters
     */
    function _storeQuest(uint256 questId, Quest calldata _quest) internal {
        Quest storage q = quests[questId];
        q.id = questId;
        q.sponsor = msg.sender;
        q.title = _quest.title;
        q.description = _quest.description;
        q.launch_page = _quest.launch_page;
        q.questType = _quest.questType;
        q.status = _quest.status;
        q.verificationParams = _quest.verificationParams;
        q.totalRewards = _quest.totalRewards;
        q.rewardPerUser = _quest.rewardPerUser;
        q.maxParticipants = _quest.totalRewards / _quest.rewardPerUser;
        q.participantCount = 0;
        q.startTime = _quest.startTime;
        q.endTime = _quest.endTime;
        q.claimEndTime = _quest.claimEndTime;
        q.isVesting = _quest.isVesting;
        q.vestingDuration = _quest.vestingDuration;
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
    function withdrawRemainingRewards(
        uint256 _questId
    ) external onlySponsor(_questId) {
        Quest storage q = quests[_questId];
        if (block.timestamp <= q.claimEndTime) {
            revert QuestSystem__ClaimPeriodNotOver();
        }

        uint256 totalClaimed = q.isVesting
            ? _calculateTotalVestedClaimed(_questId)
            : q.participantCount * q.rewardPerUser;
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
    function claimReward(
        uint256 _questId,
        Attestation calldata _attestation
    ) external virtual {
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
        try primusZKTLS.verifyAttestation(_attestation) {
            // Verification successful
        } catch {
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
            string memory userQuoteTweetId = _attestation.data.getString(
                "user_id_str"
            );
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
    function _verifyQuestContent(
        uint256 _questId,
        Attestation calldata _attestation
    ) internal view returns (bool) {
        Quest storage q = quests[_questId];
        VerificationParams storage params = q.verificationParams;

        // Check proof validity period
        // Convert attestation timestamp from milliseconds to seconds
        uint256 attestationTimestampSeconds = _attestation.timestamp / 1000;
        
        if (
            block.timestamp - attestationTimestampSeconds >
            params.proofValidityPeriod
        ) {
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
    function _verifyLikeAndRetweet(
        Quest storage _quest,
        Attestation calldata _attestation
    ) private view returns (bool) {
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
    function _verifyQuoteTweet(
        Quest storage _quest,
        Attestation calldata _attestation
    ) private view returns (bool) {
        VerificationParams storage params = _quest.verificationParams;
        string memory dataJson = _attestation.data;

        string memory userQuoteTweetId = dataJson.getString("id_str");
        string memory quotedStatusId = dataJson.getString(
            "quoted_status_id_str"
        );

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
     * @dev Only updates status if quest is not canceled
     */
    function _updateQuestStatus(uint256 _questId) internal {
        Quest storage q = quests[_questId];
        // Only update status if quest is not canceled
        if (q.status != QuestStatus.Canceled) {
            q.status = _getQuestStatusByTime(
                q.startTime,
                q.endTime,
                q.claimEndTime
            );
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
    function _calculateVestedAmount(
        uint256 _questId,
        address /* _user */
    ) internal view returns (uint256) {
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
    function _calculateTotalVestedClaimed(
        uint256 _questId
    ) internal view returns (uint256) {
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
     * @notice Get quest details with current status
     */
    function getQuest(uint256 _questId) external view returns (Quest memory) {
        Quest memory quest = quests[_questId];
        // Update status based on current time
        if (quest.status != QuestStatus.Canceled) {
            quest.status = _getQuestStatusByTime(
                quest.startTime,
                quest.endTime,
                quest.claimEndTime
            );
        }
        return quest;
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
    function hasUserQualified(
        uint256 _questId,
        address _user
    ) external view returns (bool) {
        return hasQualified[_questId][_user];
    }

    /**
     * @notice Check if quote tweet has been used
     */
    function isQuoteTweetIdUsed(
        uint256 _questId,
        string calldata _quoteTweetId
    ) external view returns (bool) {
        return isQuoteTweetUsed[_questId][_quoteTweetId];
    }

    /**
     * @notice Get vesting reward info for a user
     */
    function getVestingInfo(
        uint256 _questId,
        address _user
    )
        external
        view
        returns (
            uint256 vestedAmount,
            uint256 claimedAmount,
            uint256 claimableAmount
        )
    {
        Quest storage q = quests[_questId];
        if (!q.isVesting || !hasQualified[_questId][_user]) {
            return (0, 0, 0);
        }

        vestedAmount = _calculateVestedAmount(_questId, _user);
        claimedAmount = amountClaimedVesting[_questId][_user];
        claimableAmount = vestedAmount > claimedAmount
            ? vestedAmount - claimedAmount
            : 0;
    }

    /**
     * @notice Get all quest IDs (for pagination, use offset and limit)
     * @param _offset Starting quest ID (1-based)
     * @param _limit Maximum number of quests to return
     * @return questIds Array of quest IDs
     * @return totalCount Total number of quests
     */
    function getAllQuestIds(
        uint256 _offset,
        uint256 _limit
    ) external view returns (uint256[] memory questIds, uint256 totalCount) {
        totalCount = _nextQuestId - 1; // Total quests created

        if (_offset > totalCount || _limit == 0) {
            return (new uint256[](0), totalCount);
        }

        uint256 end = _offset + _limit - 1;
        if (end > totalCount) {
            end = totalCount;
        }

        uint256 length = end - _offset + 1;
        questIds = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            questIds[i] = _offset + i;
        }
    }

    /**
     * @notice Get multiple quest details at once with current status
     * @param _questIds Array of quest IDs to retrieve
     * @return quests Array of quest details
     */
    function getMultipleQuests(
        uint256[] calldata _questIds
    ) external view returns (Quest[] memory) {
        Quest[] memory questArray = new Quest[](_questIds.length);

        for (uint256 i = 0; i < _questIds.length; i++) {
            questArray[i] = quests[_questIds[i]];
            // Update status based on current time if not canceled
            if (questArray[i].status != QuestStatus.Canceled) {
                questArray[i].status = _getQuestStatusByTime(
                    questArray[i].startTime,
                    questArray[i].endTime,
                    questArray[i].claimEndTime
                );
            }
        }

        return questArray;
    }

    /**
     * @notice Get quests by status
     * @param _status Quest status to filter by
     * @param _offset Starting position (0-based)
     * @param _limit Maximum number of quests to return
     * @return questIds Array of quest IDs matching the status
     * @return totalCount Total number of quests with this status
     */
    function getQuestsByStatus(
        QuestStatus _status,
        uint256 _offset,
        uint256 _limit
    ) external view returns (uint256[] memory questIds, uint256 totalCount) {
        // First pass: count total matching quests
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextQuestId; i++) {
            QuestStatus currentStatus = _getUpdatedQuestStatus(i);
            if (currentStatus == _status) {
                matchCount++;
            }
        }

        totalCount = matchCount;

        if (_offset >= matchCount || _limit == 0) {
            return (new uint256[](0), totalCount);
        }

        // Second pass: collect matching quest IDs with pagination
        uint256 collected = 0;
        uint256 skipped = 0;
        uint256 actualLimit = _limit;
        if (_offset + _limit > matchCount) {
            actualLimit = matchCount - _offset;
        }

        questIds = new uint256[](actualLimit);

        for (uint256 i = 1; i < _nextQuestId && collected < actualLimit; i++) {
            QuestStatus currentStatus = _getUpdatedQuestStatus(i);
            if (currentStatus == _status) {
                if (skipped >= _offset) {
                    questIds[collected] = i;
                    collected++;
                } else {
                    skipped++;
                }
            }
        }
    }

    /**
     * @notice Get quests by sponsor
     * @param _sponsor Sponsor address
     * @param _offset Starting position (0-based)
     * @param _limit Maximum number of quests to return
     * @return questIds Array of quest IDs sponsored by the address
     * @return totalCount Total number of quests by this sponsor
     */
    function getQuestsBySponsor(
        address _sponsor,
        uint256 _offset,
        uint256 _limit
    ) external view returns (uint256[] memory questIds, uint256 totalCount) {
        // First pass: count total matching quests
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextQuestId; i++) {
            if (quests[i].sponsor == _sponsor) {
                matchCount++;
            }
        }

        totalCount = matchCount;

        if (_offset >= matchCount || _limit == 0) {
            return (new uint256[](0), totalCount);
        }

        // Second pass: collect matching quest IDs with pagination
        uint256 collected = 0;
        uint256 skipped = 0;
        uint256 actualLimit = _limit;
        if (_offset + _limit > matchCount) {
            actualLimit = matchCount - _offset;
        }

        questIds = new uint256[](actualLimit);

        for (uint256 i = 1; i < _nextQuestId && collected < actualLimit; i++) {
            if (quests[i].sponsor == _sponsor) {
                if (skipped >= _offset) {
                    questIds[collected] = i;
                    collected++;
                } else {
                    skipped++;
                }
            }
        }
    }

    /**
     * @notice Get quests that a user has participated in
     * @param _user User address
     * @param _offset Starting position (0-based)
     * @param _limit Maximum number of quests to return
     * @return questIds Array of quest IDs the user has participated in
     * @return totalCount Total number of quests the user has participated in
     */
    function getQuestsByParticipant(
        address _user,
        uint256 _offset,
        uint256 _limit
    ) external view returns (uint256[] memory questIds, uint256 totalCount) {
        // First pass: count total matching quests
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextQuestId; i++) {
            if (hasQualified[i][_user]) {
                matchCount++;
            }
        }

        totalCount = matchCount;

        if (_offset >= matchCount || _limit == 0) {
            return (new uint256[](0), totalCount);
        }

        // Second pass: collect matching quest IDs with pagination
        uint256 collected = 0;
        uint256 skipped = 0;
        uint256 actualLimit = _limit;
        if (_offset + _limit > matchCount) {
            actualLimit = matchCount - _offset;
        }

        questIds = new uint256[](actualLimit);

        for (uint256 i = 1; i < _nextQuestId && collected < actualLimit; i++) {
            if (hasQualified[i][_user]) {
                if (skipped >= _offset) {
                    questIds[collected] = i;
                    collected++;
                } else {
                    skipped++;
                }
            }
        }
    }

    /**
     * @notice Get quest summary statistics
     * @return totalQuests Total number of quests created
     * @return activeQuests Number of currently active quests
     * @return completedQuests Number of ended/closed quests
     * @return totalRewardsDistributed Total ETH rewards distributed across all quests
     */
    function getQuestStatistics()
        external
        view
        returns (
            uint256 totalQuests,
            uint256 activeQuests,
            uint256 completedQuests,
            uint256 totalRewardsDistributed
        )
    {
        totalQuests = _nextQuestId - 1;

        for (uint256 i = 1; i < _nextQuestId; i++) {
            Quest storage q = quests[i];
            QuestStatus currentStatus = _getUpdatedQuestStatus(i);

            if (currentStatus == QuestStatus.Active) {
                activeQuests++;
            } else if (
                currentStatus == QuestStatus.Ended ||
                currentStatus == QuestStatus.Closed
            ) {
                completedQuests++;
            }

            // Calculate distributed rewards
            if (q.isVesting) {
                totalRewardsDistributed += _calculateTotalVestedClaimed(i);
            } else {
                totalRewardsDistributed += q.participantCount * q.rewardPerUser;
            }
        }
    }

    /**
     * @notice Get user's quest participation summary
     * @param _user User address
     * @return participatedQuests Number of quests the user has participated in
     * @return totalRewardsEarned Total ETH rewards earned by the user
     * @return pendingVestingRewards Total pending vesting rewards
     */
    function getUserStatistics(
        address _user
    )
        external
        view
        returns (
            uint256 participatedQuests,
            uint256 totalRewardsEarned,
            uint256 pendingVestingRewards
        )
    {
        for (uint256 i = 1; i < _nextQuestId; i++) {
            if (hasQualified[i][_user]) {
                participatedQuests++;

                Quest storage q = quests[i];
                if (q.isVesting) {
                    uint256 vestedAmount = _calculateVestedAmount(i, _user);
                    uint256 claimedAmount = amountClaimedVesting[i][_user];
                    totalRewardsEarned += claimedAmount;
                    pendingVestingRewards += vestedAmount > claimedAmount
                        ? vestedAmount - claimedAmount
                        : 0;
                } else {
                    totalRewardsEarned += q.rewardPerUser;
                }
            }
        }
    }

    /**
     * @notice Get detailed quest info with current status
     * @param _questId Quest ID
     * @return quest Quest details
     * @return currentStatus Current quest status (calculated based on time)
     * @return remainingSlots Remaining participant slots
     * @return timeUntilStart Time until quest starts (0 if already started)
     * @return timeUntilEnd Time until quest ends (0 if already ended)
     * @return timeUntilClaimEnd Time until claim period ends (0 if already ended)
     */
    function getQuestDetails(
        uint256 _questId
    )
        external
        view
        returns (
            Quest memory quest,
            QuestStatus currentStatus,
            uint256 remainingSlots,
            uint256 timeUntilStart,
            uint256 timeUntilEnd,
            uint256 timeUntilClaimEnd
        )
    {
        quest = quests[_questId];
        currentStatus = _getUpdatedQuestStatus(_questId);

        // Update quest status in returned struct
        quest.status = currentStatus;

        remainingSlots = quest.maxParticipants > quest.participantCount
            ? quest.maxParticipants - quest.participantCount
            : 0;

        if (block.timestamp < quest.startTime) {
            timeUntilStart = quest.startTime - block.timestamp;
        }

        if (block.timestamp < quest.endTime) {
            timeUntilEnd = quest.endTime - block.timestamp;
        }

        if (block.timestamp < quest.claimEndTime) {
            timeUntilClaimEnd = quest.claimEndTime - block.timestamp;
        }
    }

    /**
     * @notice Get multiple users' vesting info for a quest
     * @param _questId Quest ID
     * @param _users Array of user addresses
     * @return vestingInfos Array of vesting information for each user
     */
    function getMultipleVestingInfo(uint256 _questId, address[] calldata _users) external view returns (
        VestingInfo[] memory vestingInfos
    ) {
        vestingInfos = new VestingInfo[](_users.length);

        for (uint256 i = 0; i < _users.length; i++) {
            (uint256 vestedAmount, uint256 claimedAmount, uint256 claimableAmount) = this.getVestingInfo(_questId, _users[i]);
            vestingInfos[i] = VestingInfo({
                user: _users[i],
                vestedAmount: vestedAmount,
                claimedAmount: claimedAmount,
                claimableAmount: claimableAmount,
                isQualified: hasQualified[_questId][_users[i]]
            });
        }
    }

    /**
     * @notice Check if user can claim rewards for a quest
     * @param _questId Quest ID
     * @param _user User address
     * @return canClaim Whether the user can claim rewards
     * @return reason Reason if user cannot claim (empty if can claim)
     */
    function canUserClaimReward(
        uint256 _questId,
        address _user
    ) external view returns (bool canClaim, string memory reason) {
        Quest storage q = quests[_questId];
        QuestStatus currentStatus = _getUpdatedQuestStatus(_questId);

        if (currentStatus != QuestStatus.Active) {
            return (false, "Quest not active");
        }

        if (hasQualified[_questId][_user]) {
            return (false, "User already qualified");
        }

        if (q.participantCount >= q.maxParticipants) {
            return (false, "Reward pool depleted");
        }

        return (true, "");
    }

    // --- Internal Helper Functions ---

    /**
     * @notice Get updated quest status without modifying state
     */
    function _getUpdatedQuestStatus(
        uint256 _questId
    ) internal view returns (QuestStatus) {
        Quest storage q = quests[_questId];
        if (q.status == QuestStatus.Canceled) return QuestStatus.Canceled;

        return _getQuestStatusByTime(q.startTime, q.endTime, q.claimEndTime);
    }

    /**
     * @notice Get quest status based on time parameters
     * @param _startTime Quest start time
     * @param _endTime Quest end time
     * @param _claimEndTime Quest claim end time
     * @return QuestStatus based on current time
     */
    function _getQuestStatusByTime(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _claimEndTime
    ) internal view returns (QuestStatus) {
        if (block.timestamp > _claimEndTime) {
            return QuestStatus.Closed;
        } else if (block.timestamp > _endTime) {
            return QuestStatus.Ended;
        } else if (block.timestamp >= _startTime) {
            return QuestStatus.Active;
        } else {
            return QuestStatus.Pending;
        }
    }

    // --- Structs for Complex Return Types ---

    struct VestingInfo {
        address user;
        uint256 vestedAmount;
        uint256 claimedAmount;
        uint256 claimableAmount;
        bool isQualified;
    }

    // --- Fallback Functions ---

    receive() external payable {}

    fallback() external payable {}

}
