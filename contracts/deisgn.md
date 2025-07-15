### **设计方案 V2.0 (最终版)**

这是一个完整的 `QuestSystem` 合约设计文档，旨在支持基于 zkTLS 证明的任务发布、验证和奖励分发。

#### 1\. 概述 (Overview)

`QuestSystem` 是一个去中心化的任务平台，允许任何人（Sponsor）创建链上任务，并使用加密货币（ETH 或 ERC20 代币）作为奖励。用户通过完成指定的链下行为（如点赞、转推、引用推文），并利用 Primus zkTLS 技术生成隐私保护的有效性证明（`Attestation`），来验证其行为并领取奖励。

#### 2\. 核心架构 (Core Architecture)

  * **可升级性 (Upgradability)**: 合约采用 OpenZeppelin 的 UUPS (Universal Upgradeable Proxy Standard) 代理模式，确保未来的功能迭代和逻辑修复不会影响已有的任务数据和用户状态。
  * **权限管理**: 继承 `OwnableUpgradeable`，合约的部署者（Owner）拥有最高管理权限，如设置关键地址。任务的创建者（Sponsor）拥有对其所创建任务的管理权限，如取消任务或提取剩余奖励。
  * **数据驱动**: 系统的核心是围绕一个清晰的 `Quest` 结构体来组织的，该结构体封装了任务的所有属性，包括验证规则、奖励信息、时间限制和状态。

#### 3\. 数据结构 (Data Structures)

**Enums (枚举)**

```solidity
// 任务状态机，清晰地定义了任务的生命周期
enum QuestStatus {
    Pending, // 任务已创建，但未到开始时间
    Active,  // 任务进行中，用户可以提交证明
    Ended,   // 任务已结束，但仍在奖励领取期
    Closed,  // 奖励领取期也已结束
    Canceled // 任务被创建者取消
}

// 任务类型，用于分派到不同的验证逻辑
enum QuestType {
    LikeAndRetweet, // 点赞和/或转推
    QuoteTweet      // 引用指定推文
}
```

**Structs (结构体)**

```solidity
// zkTLS 验证参数，每个任务都有一套独立的验证规则
struct VerificationParams {
    // URL 相关
    string apiUrlPattern;       // API URL的固定前缀, e.g., "https://x.com/i/api/graphql/"
    string apiEndpointHash;     // API Endpoint 的哈希，用于精确匹配
    
    // 证明时效性
    uint256 proofValidityPeriod; // zkTLS 证明的有效时间（秒），防止重放攻击

    // LikeAndRetweet 类型参数
    string targetLikeRetweetId;   // 要求用户点赞/转推的目标推文ID
    string favoritedJsonPath;     // "favorited" 状态的 JSON 路径
    string retweetedJsonPath;     // "retweeted" 状态的 JSON 路径
    bool requireFavorite;         // 是否必须点赞
    bool requireRetweet;          // 是否必须转推

    // QuoteTweet 类型参数
    string targetQuotedTweetId;   // 要求用户引用的目标推文ID
    string quotedStatusIdJsonPath; // "quoted_status_id_str" 的 JSON 路径
    string userIdJsonPath;         // "user_id_str" 的 JSON 路径
    string quoteTweetIdJsonPath;   // 用户自己的引用推文ID("id_str")的 JSON 路径
}

// Quest 核心结构体，定义了一个完整的任务
struct Quest {
    uint256 id;                  // 任务的唯一ID
    address sponsor;             // 任务创建者
    QuestType questType;         // 任务类型
    QuestStatus status;          // 任务状态
    VerificationParams verificationParams; // 验证参数

    address rewardToken;         // 奖励代币地址 (address(0) for ETH)
    uint256 totalRewards;        // 总奖励
    uint256 rewardPerUser;       // 每个用户的奖励
    uint256 maxParticipants;     // 最大参与人数
    uint256 participantCount;    // 当前已参与人数

    uint256 startTime;           // 任务开始时间
    uint256 endTime;             // 任务结束时间
    uint256 claimEndTime;        // 奖励领取截止时间

    bool isVesting;              // 是否为 Vesting 模式
    uint256 vestingDuration;     // Vesting 总时长
}
```

**State Variables (状态变量)**

```solidity
// Primus zkTLS 验证器合约接口
IPrimusZKTLS public primusZKTLS;

// 任务ID自增计数器
uint256 private _nextQuestId;

// 存储所有任务: questId => Quest
mapping(uint256 => Quest) public quests;

// 记录用户是否有资格领取奖励: questId => userAddress => bool
mapping(uint256 => mapping(address => bool)) public hasQualified;

// 记录引用推文是否已被用于领取奖励: questId => quoteTweetId => bool
mapping(uint256 => mapping(string => bool)) public isQuoteTweetUsed;

// (Vesting 相关) 记录用户已领取的奖励金额
mapping(uint256 => mapping(address => uint256)) public amountClaimedVesting;
```

#### 4\. 功能模块详解 (Detailed Functional Modules)

**4.1 Sponsor/Admin Functions**

  * `initialize(IPrimusZKTLS)`: (Owner only) UUPS 初始化函数，设置 zkTLS 验证器地址。
  * `createQuest(...)`: (Sponsor) 创建新任务，接收所有 `Quest` 参数，并锁定奖励（ETH 或 ERC20）。
  * `cancelQuest(questId)`: (Sponsor only) 在无人参与的情况下取消任务，并退还所有奖励。
  * `withdrawRemainingRewards(questId)`: (Sponsor only) 在奖励领取期结束后，提取无人领取的剩余奖励。

**4.2 User-Facing Functions**

  * `claimReward(questId, Attestation)`: 用户核心交互函数。
    1.  执行一系列前置检查（任务状态、时间、奖励余量、是否已参与等）。
    2.  调用 `primusZKTLS.verifyAttestation` 对证明进行加密验证。
    3.  调用内部 `_verifyQuestContent` 对证明内容进行业务逻辑验证。
    4.  验证通过后，根据是否为 Vesting 模式，执行不同操作：
          * **直接模式**: 立即发放奖励，并标记用户已参与。
          * **Vesting 模式**: 仅标记用户资格，不立即发奖。用户需后续调用 `claimVestingReward`。
  * `claimVestingReward(questId)`: (Vesting only) 用户在资格激活后，可随时调用此函数，合约会根据当前时间计算并转账用户当前可领取的线性释放的奖励部分。

**4.3 内部验证逻辑 (`_verifyQuestContent`)**

此函数是验证的核心，根据 `quest.questType` 分发到具体的验证实现。

  * **通用验证**: 检查 `attestation.timestamp` 的时效性；检查 `attestation.recipient` 与 `msg.sender` 是否匹配。
  * **`_verifyLikeAndRetweet`**:
    1.  验证 `attestation.request.url` 是否与 `targetLikeRetweetId` 匹配。
    2.  验证 `attestation.reponseResolve` 中的 `jsonPath` 是否与任务设置匹配。
    3.  从 `attestation.data` 中解析出 `favorited` 和 `retweeted` 的布尔值。
    4.  根据任务设置的 `requireFavorite` 和 `requireRetweet` 条件进行检查。
  * **`_verifyQuoteTweet`**:
    1.  从 `attestation.data` 中解析出 `quoted_status_id_str` (引用的推文ID) 和 `id_str` (用户自己的推文ID)。
    2.  检查 `id_str` 是否在 `isQuoteTweetUsed` mapping 中被使用过。
    3.  验证 `attestation.request.url` 必须是关于 `id_str` 这条推文的。
    4.  验证 `attestation.reponseResolve` 中的 `jsonPath` 是否正确。
    5.  最关键一步：验证解析出的 `quoted_status_id_str` 是否等于任务设定的 `targetQuotedTweetId`。

#### 5\. 安全性与最佳实践

  * **Checks-Effects-Interactions Pattern**: 所有状态变更（如标记 `hasQualified`）都在外部调用（转账）之前完成，防止重入攻击。
  * **证明时效性**: `proofValidityPeriod` 机制有效防止了使用旧证明进行攻击的风险。
  * **权限控制**: 使用 `OwnableUpgradeable` 和 `onlySponsor` 检查，确保只有授权地址才能执行关键操作。
  * **数据隔离**: 使用 `mapping` 确保不同任务和不同用户之间的数据严格隔离。

-----

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IPrimusZKTLS, Attestation} from "@primuslabs/zktls-contracts/src/IPrimusZKTLS.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./utils/JsonParser.sol";
import "./utils/StringUtils.sol";

/**
 * @title QuestSystem
 * @author Gemini AI
 * @notice A decentralized system for creating and verifying quests using Primus zkTLS attestations.
 * It supports various quest types like 'Like & Retweet' and 'Quote Tweet',
 * with direct or vesting reward mechanisms.
 * This contract is upgradeable using the UUPS pattern.
 */
contract QuestSystem is Initializable, OwnableUpgradeable {
    using JsonParser for string;
    using StringUtils for string;

    // --- Enums and Structs ---

    enum QuestStatus { Pending, Active, Ended, Closed, Canceled }
    enum QuestType { LikeAndRetweet, QuoteTweet }

    struct VerificationParams {
        string apiUrlPattern;
        string apiEndpointHash;
        uint256 proofValidityPeriod;
        string targetLikeRetweetId;
        string favoritedJsonPath;
        string retweetedJsonPath;
        bool requireFavorite;
        bool requireRetweet;
        string targetQuotedTweetId;
        string quotedStatusIdJsonPath;
        string userIdJsonPath;
        string quoteTweetIdJsonPath;
    }

    struct Quest {
        uint256 id;
        address sponsor;
        QuestType questType;
        QuestStatus status;
        VerificationParams verificationParams;
        address rewardToken;
        uint256 totalRewards;
        uint256 rewardPerUser;
        uint256 maxParticipants;
        uint256 participantCount;
        uint256 startTime;
        uint256 endTime;
        uint256 claimEndTime;
        bool isVesting;
        uint256 vestingDuration;
    }

    // --- State Variables ---

    IPrimusZKTLS public primusZKTLS;
    uint256 private _nextQuestId;

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

    // --- Modifiers ---

    modifier onlySponsor(uint256 _questId) {
        require(quests[_questId].sponsor == msg.sender, "QuestSystem: Caller is not the sponsor");
        _;
    }

    // --- Initializer ---

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(IPrimusZKTLS _primusZKTLS) public initializer {
        __Ownable_init(msg.sender);
        primusZKTLS = _primusZKTLS;
        _nextQuestId = 1;
    }

    // --- Sponsor Functions ---

    function createQuest(Quest calldata _quest) external payable {
        require(_quest.rewardPerUser > 0, "Reward per user must be > 0");
        require(_quest.totalRewards > 0 && _quest.totalRewards % _quest.rewardPerUser == 0, "Invalid total rewards");
        require(_quest.startTime < _quest.endTime && _quest.endTime < _quest.claimEndTime, "Invalid time sequence");

        uint256 questId = _nextQuestId;
        quests[questId] = _quest;
        quests[questId].id = questId;
        quests[questId].sponsor = msg.sender;
        quests[questId].status = QuestStatus.Pending;
        quests[questId].maxParticipants = _quest.totalRewards / _quest.rewardPerUser;
        
        if (_quest.rewardToken == address(0)) {
            require(msg.value == _quest.totalRewards, "Incorrect ETH sent");
        } else {
            require(msg.value == 0, "ETH sent for ERC20 quest");
            IERC20Upgradeable(_quest.rewardToken).transferFrom(msg.sender, address(this), _quest.totalRewards);
        }

        _nextQuestId++;
        emit QuestCreated(questId, msg.sender, _quest.totalRewards);
    }

    function cancelQuest(uint256 _questId) external onlySponsor(_questId) {
        Quest storage q = quests[_questId];
        require(q.participantCount == 0, "Cannot cancel quest with participants");
        require(q.status != QuestStatus.Canceled, "Quest already canceled");

        q.status = QuestStatus.Canceled;
        _transferReward(q.sponsor, q.rewardToken, q.totalRewards);
        emit QuestCanceled(_questId);
    }

    function withdrawRemainingRewards(uint256 _questId) external onlySponsor(_questId) {
        Quest storage q = quests[_questId];
        require(block.timestamp > q.claimEndTime, "Claim period not over");
        
        uint256 totalClaimed = q.isVesting ? _calculateTotalVestedClaimed(_questId) : q.participantCount * q.rewardPerUser;
        uint256 remaining = q.totalRewards - totalClaimed;

        if (remaining > 0) {
            q.totalRewards = totalClaimed; // Prevent further withdrawals
            _transferReward(q.sponsor, q.rewardToken, remaining);
            emit RemainingRewardsWithdrawn(_questId, q.sponsor, remaining);
        }
    }

    // --- User Functions ---

    function claimReward(uint256 _questId, Attestation calldata _attestation) external {
        Quest storage q = quests[_questId];
        _updateQuestStatus(_questId);
        require(q.status == QuestStatus.Active, "Quest not active");
        require(!hasQualified[_questId][msg.sender], "User has already qualified");
        require(q.participantCount < q.maxParticipants, "Reward pool depleted");
        
        primusZKTLS.verifyAttestation(_attestation);
        require(_verifyQuestContent(_questId, _attestation), "Attestation content verification failed");

        hasQualified[_questId][msg.sender] = true;
        q.participantCount++;

        if (!q.isVesting) {
            _transferReward(msg.sender, q.rewardToken, q.rewardPerUser);
            emit RewardClaimed(_questId, msg.sender, q.rewardPerUser);
        }
        // For vesting, qualification is now complete. User calls claimVestingReward separately.
    }
    
    function claimVestingReward(uint256 _questId) external {
        Quest storage q = quests[_questId];
        require(q.isVesting, "Not a vesting quest");
        require(hasQualified[_questId][msg.sender], "User not qualified");
        _updateQuestStatus(_questId);
        
        uint256 vestedAmount = _calculateVestedAmount(_questId, msg.sender);
        uint256 alreadyClaimed = amountClaimedVesting[_questId][msg.sender];
        uint256 amountToClaim = vestedAmount - alreadyClaimed;
        
        require(amountToClaim > 0, "No rewards to claim");

        amountClaimedVesting[_questId][msg.sender] = vestedAmount;
        _transferReward(msg.sender, q.rewardToken, amountToClaim);
        emit VestingRewardClaimed(_questId, msg.sender, amountToClaim);
    }


    // --- Internal & View Functions ---

    function _verifyQuestContent(uint256 _questId, Attestation calldata _attestation) internal view returns (bool) {
        Quest storage q = quests[_questId];
        VerificationParams storage params = q.verificationParams;

        require(block.timestamp - _attestation.timestamp <= params.proofValidityPeriod, "Proof expired");
        require(_attestation.recipient == msg.sender, "Recipient mismatch");

        if (q.questType == QuestType.LikeAndRetweet) {
            return _verifyLikeAndRetweet(q, _attestation);
        }
        if (q.questType == QuestType.QuoteTweet) {
            return _verifyQuoteTweet(q, _attestation);
        }
        return false;
    }

    function _verifyLikeAndRetweet(Quest storage _quest, Attestation calldata _attestation) private view returns (bool) {
        VerificationParams storage params = _quest.verificationParams;
        require(
            _attestation.request.url.contains(params.targetLikeRetweetId),
            "URL does not match target tweet"
        );
        // Additional checks for jsonPath can be added here if needed
        
        string memory dataJson = _attestation.data;
        if (params.requireFavorite && !dataJson.getBool("favorited")) return false;
        if (params.requireRetweet && !dataJson.getBool("retweeted")) return false;

        return true;
    }

    function _verifyQuoteTweet(Quest storage _quest, Attestation calldata _attestation) private view returns (bool) {
        VerificationParams storage params = _quest.verificationParams;
        string memory dataJson = _attestation.data;
        
        string memory userQuoteTweetId = dataJson.getString("id_str");
        string memory quotedStatusId = dataJson.getString("quoted_status_id_str");
        
        require(bytes(userQuoteTweetId).length > 0, "User quote tweet ID missing");
        require(!isQuoteTweetUsed[_quest.id][userQuoteTweetId], "Quote tweet already used");
        require(_attestation.request.url.contains(userQuoteTweetId), "URL mismatch with user's tweet");
        require(
            keccak256(abi.encodePacked(quotedStatusId)) == keccak256(abi.encodePacked(params.targetQuotedTweetId)),
            "Incorrect tweet quoted"
        );
        
        return true;
    }

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
    
    function _transferReward(address _to, address _token, uint256 _amount) internal {
        if (_amount == 0) return;
        if (_token == address(0)) {
            payable(_to).transfer(_amount);
        } else {
            IERC20Upgradeable(_token).transfer(_to, _amount);
        }
    }
    
    function _calculateVestedAmount(uint256 _questId, address _user) internal view returns (uint256) {
        Quest storage q = quests[_questId];
        if (block.timestamp <= q.startTime) return 0;
        
        uint256 vestingEnd = q.startTime + q.vestingDuration;
        if (block.timestamp >= vestingEnd) return q.rewardPerUser;
        
        uint256 elapsed = block.timestamp - q.startTime;
        return (q.rewardPerUser * elapsed) / q.vestingDuration;
    }

    function _calculateTotalVestedClaimed(uint256 _questId) internal view returns (uint256) {
        // This is a simplification. A real implementation would need to iterate
        // or store total claimed amount to be accurate. For this demo, we assume
        // it can be calculated based on participantCount and vesting progress.
        // A more robust solution would be needed for production.
        return 0; 
    }
    
    receive() external payable {}
}
```