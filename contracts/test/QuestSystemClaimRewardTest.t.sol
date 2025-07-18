// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {QuestSystem} from "../src/QuestSystem.sol";
import {MockPrimusZKTLS} from "../src/mocks/MockPrimusZKTLS.sol";
import {IPrimusZKTLS, Attestation, AttNetworkRequest, AttNetworkResponseResolve, Attestor} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";

contract QuestSystemClaimRewardTest is Test {
    QuestSystem public questSystem;
    MockPrimusZKTLS public mockZKTLS;
    
    address public sponsor = makeAddr("sponsor");
    address public user = makeAddr("user");
    address public verifier = makeAddr("verifier");
    
    uint256 constant QUEST_REWARD = 1 ether;
    uint256 constant REWARD_PER_USER = 0.1 ether;
    string constant TARGET_TWEET_ID = "1945396393528713656";
    
    function setUp() public {
        // Deploy mock ZKTLS and set to always pass
        mockZKTLS = new MockPrimusZKTLS(verifier);
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysPass);
        
        // Deploy QuestSystem
        questSystem = new QuestSystem(address(mockZKTLS));
        
        // Fund accounts
        vm.deal(sponsor, 10 ether);
        vm.deal(user, 1 ether);
    }
    
    function testClaimRewardWithRealData() public {
        // Create a quest first
        uint256 questId = _createLikeAndRetweetQuest();
        
        // Prepare attestation data from ProofFavAndRetweet.json
        Attestation memory attestation = _createAttestationFromJson();
        
        // User claims reward
        vm.prank(user);
        questSystem.claimReward(questId, attestation);
        
        // Verify user qualified
        assertTrue(questSystem.hasUserQualified(questId, user));
        
        // Verify user received reward
        assertEq(user.balance, 1 ether + REWARD_PER_USER);
        
        // Verify quest participant count increased
        QuestSystem.Quest memory quest = questSystem.getQuest(questId);
        assertEq(quest.participantCount, 1);
    }
    
    function testClaimRewardFailsIfAlreadyQualified() public {
        uint256 questId = _createLikeAndRetweetQuest();
        Attestation memory attestation = _createAttestationFromJson();
        
        // First claim
        vm.prank(user);
        questSystem.claimReward(questId, attestation);
        
        // Second claim should fail
        vm.prank(user);
        vm.expectRevert(QuestSystem.QuestSystem__UserAlreadyQualified.selector);
        questSystem.claimReward(questId, attestation);
    }
    
    function testClaimRewardFailsIfQuestNotActive() public {
        uint256 questId = _createLikeAndRetweetQuest();
        Attestation memory attestation = _createAttestationFromJson();
        
        // Move time past quest end
        vm.warp(block.timestamp + 2 days);
        
        vm.prank(user);
        vm.expectRevert(QuestSystem.QuestSystem__QuestNotActive.selector);
        questSystem.claimReward(questId, attestation);
    }
    
    function testClaimRewardFailsIfWrongRecipient() public {
        uint256 questId = _createLikeAndRetweetQuest();
        Attestation memory attestation = _createAttestationFromJson();
        
        // Change recipient to different address
        attestation.recipient = makeAddr("wrongUser");
        
        vm.prank(user);
        vm.expectRevert(QuestSystem.QuestSystem__ContentVerificationFailed.selector);
        questSystem.claimReward(questId, attestation);
    }
    
    function testClaimRewardFailsIfProofExpired() public {
        uint256 questId = _createLikeAndRetweetQuest();
        Attestation memory attestation = _createAttestationFromJson();
        
        // Set old timestamp (older than proof validity period of 1 hour)
        // Move block timestamp forward first to avoid underflow
        vm.warp(block.timestamp + 10000); // Move forward 10000 seconds
        uint256 oldTimestamp = block.timestamp - 7200; // 2 hours ago
        attestation.timestamp = uint64(oldTimestamp * 1000); // Convert to milliseconds
        
        vm.prank(user);
        vm.expectRevert(QuestSystem.QuestSystem__ContentVerificationFailed.selector);
        questSystem.claimReward(questId, attestation);
    }
    
    function testClaimRewardFailsIfTargetTweetNotMatched() public {
        uint256 questId = _createLikeAndRetweetQuest();
        Attestation memory attestation = _createAttestationFromJson();
        
        // Change URL to different tweet ID
        attestation.request.url = "https://x.com/i/api/graphql/aTYmkYpjWyvUyrinVWSiYA/TweetDetail?variables=%7B%22focalTweetId%22%3A%22999999999999999999%22%2C%22with_rux_injections%22%3Afalse%7D";
        
        vm.prank(user);
        vm.expectRevert(QuestSystem.QuestSystem__ContentVerificationFailed.selector);
        questSystem.claimReward(questId, attestation);
    }
    
    function testClaimRewardFailsIfNotFavorited() public {
        uint256 questId = _createLikeAndRetweetQuest();
        Attestation memory attestation = _createAttestationFromJson();
        
        // Change data to show not favorited
        attestation.data = "{\"favorited\":\"false\",\"retweeted\":\"true\"}";
        
        vm.prank(user);
        vm.expectRevert(QuestSystem.QuestSystem__ContentVerificationFailed.selector);
        questSystem.claimReward(questId, attestation);
    }
    
    function testClaimRewardFailsIfNotRetweeted() public {
        uint256 questId = _createLikeAndRetweetQuest();
        Attestation memory attestation = _createAttestationFromJson();
        
        // Change data to show not retweeted
        attestation.data = "{\"favorited\":\"true\",\"retweeted\":\"false\"}";
        
        vm.prank(user);
        vm.expectRevert(QuestSystem.QuestSystem__ContentVerificationFailed.selector);
        questSystem.claimReward(questId, attestation);
    }
    
    function _createLikeAndRetweetQuest() internal returns (uint256) {
        // Create verification parameters
        QuestSystem.VerificationParams memory params = QuestSystem.VerificationParams({
            apiUrlPattern: "https://x.com/i/api/graphql/",
            apiEndpointHash: "",
            proofValidityPeriod: 3600, // 1 hour
            targetLikeRetweetId: TARGET_TWEET_ID,
            favoritedJsonPath: "",
            retweetedJsonPath: "",
            requireFavorite: true,
            requireRetweet: true,
            targetQuotedTweetId: "",
            quotedStatusIdJsonPath: "",
            userIdJsonPath: "",
            quoteTweetIdJsonPath: ""
        });
        
        // Create quest
        QuestSystem.Quest memory quest = QuestSystem.Quest({
            id: 0,
            sponsor: sponsor,
            title: "Like and Retweet Quest",
            description: "Like and retweet the target tweet",
            launch_page: "https://x.com/test",
            questType: QuestSystem.QuestType.LikeAndRetweet,
            status: QuestSystem.QuestStatus.Pending,
            verificationParams: params,
            totalRewards: QUEST_REWARD,
            rewardPerUser: REWARD_PER_USER,
            maxParticipants: 0,
            participantCount: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + 1 days,
            claimEndTime: block.timestamp + 2 days,
            isVesting: false,
            vestingDuration: 0
        });
        
        vm.prank(sponsor);
        questSystem.createQuest{value: QUEST_REWARD}(quest);
        
        return 1; // First quest ID
    }
    
    function _createAttestationFromJson() internal view returns (Attestation memory) {
        // Data from ProofFavAndRetweet.json
        AttNetworkRequest memory request = AttNetworkRequest({
            url: "https://x.com/i/api/graphql/aTYmkYpjWyvUyrinVWSiYA/TweetDetail?variables=%7B%22focalTweetId%22%3A%221945396393528713656%22%2C%22with_rux_injections%22%3Afalse%2C%22rankingMode%22%3A%22Relevance%22%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%7D&features=%7B%22rweb_video_screen_enabled%22%3Afalse%2C%22payments_enabled%22%3Afalse%2C%22profile_label_improvements_pcf_label_in_post_enabled%22%3Atrue%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22premium_content_api_read_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22responsive_web_grok_analyze_button_fetch_trends_enabled%22%3Afalse%2C%22responsive_web_grok_analyze_post_followups_enabled%22%3Atrue%2C%22responsive_web_jetfuel_frame%22%3Atrue%2C%22responsive_web_grok_share_attachment_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22responsive_web_grok_show_grok_translated_post%22%3Afalse%2C%22responsive_web_grok_analysis_button_from_backend%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_grok_image_annotation_enabled%22%3Atrue%2C%22responsive_web_grok_community_note_auto_translation_is_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Atrue%2C%22withArticlePlainText%22%3Afalse%2C%22withGrokAnalyze%22%3Afalse%2C%22withDisallowedReplyControls%22%3Afalse%7D",
            header: "",
            method: "GET",
            body: ""
        });
        
        // Create response resolve array
        AttNetworkResponseResolve[] memory responseResolve = new AttNetworkResponseResolve[](2);
        responseResolve[0] = AttNetworkResponseResolve({
            keyName: "favorited",
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[1].entries[2].content.itemContent.tweet_results.result.legacy.favorited"
        });
        responseResolve[1] = AttNetworkResponseResolve({
            keyName: "retweeted",
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[1].entries[2].content.itemContent.tweet_results.result.legacy.retweeted"
        });
        
        // Create attestor array
        Attestor[] memory attestors = new Attestor[](1);
        attestors[0] = Attestor({
            attestorAddr: 0xDB736B13E2f522dBE18B2015d0291E4b193D8eF6,
            url: "https://primuslabs.xyz"
        });
        
        // Create signatures array
        bytes[] memory signatures = new bytes[](1);
        signatures[0] = hex"5a1dac1f11bfc5482725ebf7c9770c9123976a9ecbb9b6046890ae088cc8853b6f56a43c4352f47ca3b4d24ad9f9dda823ed8aa1dac914bdf58a1704acc220d01b";
        
        return Attestation({
            recipient: user,
            request: request,
            reponseResolve: responseResolve,
            data: "{\"favorited\":\"true\",\"retweeted\":\"true\"}",
            attConditions: "[{\"op\":\"REVEAL_STRING\",\"field\":\"$.data.threaded_conversation_with_injections_v2.instructions[1].entries[2].content.itemContent.tweet_results.result.legacy.favorited\"},{\"op\":\"REVEAL_STRING\",\"field\":\"$.data.threaded_conversation_with_injections_v2.instructions[1].entries[2].content.itemContent.tweet_results.result.legacy.retweeted\"}]",
            timestamp: uint64(block.timestamp * 1000), // Convert to milliseconds
            additionParams: "{\"algorithmType\":\"proxytls\"}",
            attestors: attestors,
            signatures: signatures,
            extendedData: "{\"favorited\":\"true\",\"retweeted\":\"true\"}"
        });
    }
}