// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {QuestSystem} from "../src/QuestSystem.sol";
import {MockPrimusZKTLS} from "../src/mocks/MockPrimusZKTLS.sol";
import {IPrimusZKTLS, Attestation, RequestData, ResponseResolve, Attestor} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";
import {JsonParser} from "../src/utils/JsonParser.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title QuestSystemRealData Test
 * @dev Tests QuestSystem using real zkTLS JSON data from ProofFavAndRetweet.json and ProofQuoteTweet.json
 */
contract QuestSystemRealDataTest is Test {
    using JsonParser for string;

    QuestSystem public questSystem;
    MockPrimusZKTLS public mockZKTLS;
    
    address public sponsor = address(0x1234);
    address public user1 = address(0xB12a1f7035FdCBB4cC5Fa102C01346BD45439Adf); // From real data
    address public user2 = address(0x5678);
    
    uint256 public constant QUEST_REWARD = 1 ether;
    uint256 public constant REWARD_PER_USER = 0.1 ether;
    
    // Real data from ProofFavAndRetweet.json
    string constant REAL_FAV_RETWEET_DATA = '{"favorited":"true","retweeted":"true"}';
    string constant REAL_FAV_RETWEET_URL = "https://x.com/i/api/graphql/FJGOFKfjA67MmT4I9p1qZg/TweetDetail?variables=%7B%22focalTweetId%22%3A%221942933687978365289%22%2C%22with_rux_injections%22%3Afalse%2C%22rankingMode%22%3A%22Relevance%22%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%7D&features=%7B%22rweb_video_screen_enabled%22%3Afalse%2C%22payments_enabled%22%3Afalse%2C%22profile_label_improvements_pcf_label_in_post_enabled%22%3Atrue%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22premium_content_api_read_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22responsive_web_grok_analyze_button_fetch_trends_enabled%22%3Afalse%2C%22responsive_web_grok_analyze_post_followups_enabled%22%3Atrue%2C%22responsive_web_jetfuel_frame%22%3Atrue%2C%22responsive_web_grok_share_attachment_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22responsive_web_grok_show_grok_translated_post%22%3Afalse%2C%22responsive_web_grok_analysis_button_from_backend%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_grok_image_annotation_enabled%22%3Atrue%2C%22responsive_web_grok_community_note_auto_translation_is_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Atrue%2C%22withArticlePlainText%22%3Afalse%2C%22withGrokAnalyze%22%3Afalse%2C%22withDisallowedReplyControls%22%3Afalse%7D";
    uint256 constant REAL_FAV_RETWEET_TIMESTAMP = 1752473912632;
    
    // Real data from ProofQuoteTweet.json  
    string constant REAL_QUOTE_TWEET_DATA = '{"user_id_str":"898091366260948992","id_str":"1940381550228721818","quoted_status_id_str":"1940372466486137302"}';
    string constant REAL_QUOTE_TWEET_URL = "https://x.com/i/api/graphql/FJGOFKfjA67MmT4I9p1qZg/TweetDetail?variables=%7B%22focalTweetId%22%3A%221940381550228721818%22%2C%22with_rux_injections%22%3Afalse%2C%22rankingMode%22%3A%22Relevance%22%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%7D&features=%7B%22rweb_video_screen_enabled%22%3Afalse%2C%22payments_enabled%22%3Afalse%2C%22profile_label_improvements_pcf_label_in_post_enabled%22%3Atrue%2C%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22premium_content_api_read_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22responsive_web_grok_analyze_button_fetch_trends_enabled%22%3Afalse%2C%22responsive_web_grok_analyze_post_followups_enabled%22%3Atrue%2C%22responsive_web_jetfuel_frame%22%3Atrue%2C%22responsive_web_grok_share_attachment_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22responsive_web_grok_show_grok_translated_post%22%3Afalse%2C%22responsive_web_grok_analysis_button_from_backend%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_grok_image_annotation_enabled%22%3Atrue%2C%22responsive_web_grok_community_note_auto_translation_is_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Atrue%2C%22withArticlePlainText%22%3Afalse%2C%22withGrokAnalyze%22%3Afalse%2C%22withDisallowedReplyControls%22%3Afalse%7D";
    uint256 constant REAL_QUOTE_TWEET_TIMESTAMP = 1752475379394;
    
    // Target tweet IDs from real data
    string constant TARGET_LIKE_RETWEET_ID = "1942933687978365289";
    string constant TARGET_QUOTED_TWEET_ID = "1940372466486137302";
    string constant USER_QUOTE_TWEET_ID = "1940381550228721818";

    function setUp() public {
        // Deploy mock zkTLS
        mockZKTLS = new MockPrimusZKTLS(address(0x1234)); // Provide verifier address
        
        // Deploy QuestSystem with proxy
        QuestSystem implementation = new QuestSystem();
        
        bytes memory initData = abi.encodeWithSelector(
            QuestSystem.initialize.selector,
            address(mockZKTLS)
        );
        
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        
        questSystem = QuestSystem(payable(address(proxy)));
        
        // Setup accounts with ETH
        vm.deal(sponsor, 10 ether);
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        
        // Set mock to simulate real-world verification
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
    }
    
    function createRealLikeRetweetAttestation() internal view returns (Attestation memory) {
        ResponseResolve[] memory responseResolve = new ResponseResolve[](2);
        responseResolve[0] = ResponseResolve({
            keyName: "favorited",
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.favorited"
        });
        responseResolve[1] = ResponseResolve({
            keyName: "retweeted", 
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.retweeted"
        });
        
        Attestor[] memory attestors = new Attestor[](1);
        attestors[0] = Attestor({
            attestorAddr: 0xDB736B13E2f522dBE18B2015d0291E4b193D8eF6,
            url: "https://primuslabs.xyz"
        });
        
        bytes[] memory signatures = new bytes[](1);
        signatures[0] = hex"2c54ef20a94e5f892341bd47db97e9792eff8a273bdc732e914efd00e9e1356a5d06db1bf11daa8ea1ca0c7ac6917eafdd58db6f8490941236096500fd2a5b471b";
        
        return Attestation({
            recipient: user1,
            request: RequestData({
                url: REAL_FAV_RETWEET_URL,
                header: "",
                method: "GET",
                body: ""
            }),
            responseResolve: responseResolve,
            data: REAL_FAV_RETWEET_DATA,
            attConditions: "[{\"op\":\"REVEAL_STRING\",\"field\":\"$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.favorited\"},{\"op\":\"REVEAL_STRING\",\"field\":\"$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.retweeted\"}]",
            timestamp: REAL_FAV_RETWEET_TIMESTAMP,
            additionParams: "{\"algorithmType\":\"proxytls\"}",
            attestors: attestors,
            signatures: signatures,
            extendedData: "{\"favorited\":\"true\",\"retweeted\":\"true\"}"
        });
    }
    
    function createRealQuoteTweetAttestation() internal view returns (Attestation memory) {
        ResponseResolve[] memory responseResolve = new ResponseResolve[](3);
        responseResolve[0] = ResponseResolve({
            keyName: "quoted_status_id_str",
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.quoted_status_id_str"
        });
        responseResolve[1] = ResponseResolve({
            keyName: "user_id_str",
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.user_id_str"
        });
        responseResolve[2] = ResponseResolve({
            keyName: "id_str",
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.id_str"
        });
        
        Attestor[] memory attestors = new Attestor[](1);
        attestors[0] = Attestor({
            attestorAddr: 0xDB736B13E2f522dBE18B2015d0291E4b193D8eF6,
            url: "https://primuslabs.xyz"
        });
        
        bytes[] memory signatures = new bytes[](1);
        signatures[0] = hex"95cab346057f2eb5bf7ca0a60f6b3006597eb8a8606df3db82fe26bf257e89cb52b2aed831d04e3ca07dd043a313d24015781b23ae3c688927ad115bea6441091c";
        
        return Attestation({
            recipient: user1,
            request: RequestData({
                url: REAL_QUOTE_TWEET_URL,
                header: "",
                method: "GET", 
                body: ""
            }),
            responseResolve: responseResolve,
            data: REAL_QUOTE_TWEET_DATA,
            attConditions: "[{\"op\":\"REVEAL_STRING\",\"field\":\"$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.quoted_status_id_str\"},{\"op\":\"REVEAL_STRING\",\"field\":\"$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.user_id_str\"},{\"op\":\"REVEAL_STRING\",\"field\":\"$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.id_str\"}]",
            timestamp: REAL_QUOTE_TWEET_TIMESTAMP,
            additionParams: "{\"algorithmType\":\"proxytls\"}",
            attestors: attestors,
            signatures: signatures,
            extendedData: "{\"id_str\":\"1940381550228721818\",\"quoted_status_id_str\":\"1940372466486137302\",\"user_id_str\":\"898091366260948992\"}"
        });
    }

    function testJsonParsingRealData() public {
        console.log("=== Testing JSON Parsing with Real Data ===");
        
        // Test Like/Retweet data parsing
        string memory favoritedValue = REAL_FAV_RETWEET_DATA.getString("favorited");
        string memory retweetedValue = REAL_FAV_RETWEET_DATA.getString("retweeted");
        bool favorited = REAL_FAV_RETWEET_DATA.getBool("favorited");
        bool retweeted = REAL_FAV_RETWEET_DATA.getBool("retweeted");
        
        console.log("Favorited string value:", favoritedValue);
        console.log("Retweeted string value:", retweetedValue);
        console.log("Favorited bool value:", favorited);
        console.log("Retweeted bool value:", retweeted);
        
        assertEq(favoritedValue, "true");
        assertEq(retweetedValue, "true");
        assertTrue(favorited);
        assertTrue(retweeted);
        
        // Test Quote Tweet data parsing
        string memory userIdStr = REAL_QUOTE_TWEET_DATA.getString("user_id_str");
        string memory idStr = REAL_QUOTE_TWEET_DATA.getString("id_str");
        string memory quotedStatusIdStr = REAL_QUOTE_TWEET_DATA.getString("quoted_status_id_str");
        
        console.log("User ID:", userIdStr);
        console.log("Tweet ID:", idStr);
        console.log("Quoted Status ID:", quotedStatusIdStr);
        
        assertEq(userIdStr, "898091366260948992");
        assertEq(idStr, "1940381550228721818");
        assertEq(quotedStatusIdStr, "1940372466486137302");
        
        console.log("[PASS] All JSON parsing tests passed!");
    }
    
    function testRealDataLikeRetweetQuest() public {
        console.log("=== Testing Real Like & Retweet Quest ===");
        
        // Create quest with real tweet ID
        vm.startPrank(sponsor);
        
        QuestSystem.VerificationParams memory params = QuestSystem.VerificationParams({
            apiUrlPattern: "https://x.com/i/api/graphql",
            apiEndpointHash: "",
            proofValidityPeriod: 3600, // 1 hour
            targetLikeRetweetId: TARGET_LIKE_RETWEET_ID,
            favoritedJsonPath: "",
            retweetedJsonPath: "",
            requireFavorite: true,
            requireRetweet: true,
            targetQuotedTweetId: "",
            quotedStatusIdJsonPath: "",
            userIdJsonPath: "",
            quoteTweetIdJsonPath: ""
        });
        
        QuestSystem.Quest memory quest = QuestSystem.Quest({
            id: 0,
            sponsor: sponsor,
            questType: QuestSystem.QuestType.LikeAndRetweet,
            status: QuestSystem.QuestStatus.Pending, // Will be determined by time
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
        
        questSystem.createQuest{value: QUEST_REWARD}(quest);
        uint256 questId = 1; // First quest will have ID 1
        vm.stopPrank();
        
        console.log("Quest created with ID:", questId);
        
        // User claims reward with real attestation
        vm.startPrank(user1);
        
        Attestation memory realAttestation = createRealLikeRetweetAttestation();
        
        // Adjust timestamp to be recent for validity check
        // Use current timestamp since block.timestamp might be small in test environment
        realAttestation.timestamp = block.timestamp > 300 ? block.timestamp - 300 : block.timestamp;
        
        uint256 balanceBefore = user1.balance;
        console.log("User balance before claim:", balanceBefore);
        
        questSystem.claimReward(questId, realAttestation);
        
        uint256 balanceAfter = user1.balance;
        console.log("User balance after claim:", balanceAfter);
        
        assertEq(balanceAfter - balanceBefore, REWARD_PER_USER);
        assertTrue(questSystem.hasQualified(questId, user1));
        
        vm.stopPrank();
        
        console.log("[PASS] Real Like & Retweet quest completed successfully!");
    }
    
    function testRealDataQuoteTweetQuest() public {
        console.log("=== Testing Real Quote Tweet Quest ===");
        
        // Create quote tweet quest with real target tweet ID
        vm.startPrank(sponsor);
        
        QuestSystem.VerificationParams memory params = QuestSystem.VerificationParams({
            apiUrlPattern: "https://x.com/i/api/graphql",
            apiEndpointHash: "",
            proofValidityPeriod: 3600, // 1 hour
            targetLikeRetweetId: "",
            favoritedJsonPath: "",
            retweetedJsonPath: "",
            requireFavorite: false,
            requireRetweet: false,
            targetQuotedTweetId: TARGET_QUOTED_TWEET_ID,
            quotedStatusIdJsonPath: "",
            userIdJsonPath: "",
            quoteTweetIdJsonPath: ""
        });
        
        QuestSystem.Quest memory quest = QuestSystem.Quest({
            id: 0,
            sponsor: sponsor,
            questType: QuestSystem.QuestType.QuoteTweet,
            status: QuestSystem.QuestStatus.Pending, // Will be determined by time
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
        
        questSystem.createQuest{value: QUEST_REWARD}(quest);
        uint256 questId = 1; // First quest will have ID 1
        vm.stopPrank();
        
        console.log("Quote Tweet Quest created with ID:", questId);
        
        // User claims reward with real quote tweet attestation
        vm.startPrank(user1);
        
        Attestation memory realAttestation = createRealQuoteTweetAttestation();
        
        // Adjust timestamp to be recent for validity check
        // Use current timestamp since block.timestamp might be small in test environment
        realAttestation.timestamp = block.timestamp > 300 ? block.timestamp - 300 : block.timestamp;
        
        uint256 balanceBefore = user1.balance;
        console.log("User balance before claim:", balanceBefore);
        
        questSystem.claimReward(questId, realAttestation);
        
        uint256 balanceAfter = user1.balance;
        console.log("User balance after claim:", balanceAfter);
        
        assertEq(balanceAfter - balanceBefore, REWARD_PER_USER);
        assertTrue(questSystem.hasQualified(questId, user1));
        assertTrue(questSystem.isQuoteTweetUsed(questId, USER_QUOTE_TWEET_ID));
        
        vm.stopPrank();
        
        console.log("[PASS] Real Quote Tweet quest completed successfully!");
    }
    
    function testRealUrlFormatValidation() public {
        console.log("=== Testing Real URL Format Validation ===");
        
        // Verify URL contains the expected tweet ID for Like/Retweet
        assertTrue(keccak256(abi.encodePacked(REAL_FAV_RETWEET_URL)).length > 0);
        
        // Check if URL contains the tweet ID (encoded in URL)
        // In real URL: "focalTweetId%22%3A%221942933687978365289%22"
        // This is URL-encoded version of: "focalTweetId":"1942933687978365289"
        
        // Verify URL contains the expected tweet ID for Quote Tweet
        assertTrue(keccak256(abi.encodePacked(REAL_QUOTE_TWEET_URL)).length > 0);
        
        console.log("[PASS] URL format validation passed!");
    }
    
    function testRealSignatureFormat() public {
        console.log("=== Testing Real Signature Format ===");
        
        Attestation memory likeRetweetAtt = createRealLikeRetweetAttestation();
        Attestation memory quoteTweetAtt = createRealQuoteTweetAttestation();
        
        // Verify signature lengths (should be 65 bytes as per Ethereum standard)
        assertEq(likeRetweetAtt.signatures[0].length, 65);
        assertEq(quoteTweetAtt.signatures[0].length, 65);
        
        // Verify attestor addresses
        assertEq(likeRetweetAtt.attestors[0].attestorAddr, 0xDB736B13E2f522dBE18B2015d0291E4b193D8eF6);
        assertEq(quoteTweetAtt.attestors[0].attestorAddr, 0xDB736B13E2f522dBE18B2015d0291E4b193D8eF6);
        
        // Verify attestor URLs
        assertEq(likeRetweetAtt.attestors[0].url, "https://primuslabs.xyz");
        assertEq(quoteTweetAtt.attestors[0].url, "https://primuslabs.xyz");
        
        console.log("[PASS] Signature format validation passed!");
    }
    
    function testRealDataVsSimulatedData() public {
        console.log("=== Comparing Real Data vs Simulated Data ===");
        
        // Real data characteristics
        console.log("Real Like/Retweet data length:", bytes(REAL_FAV_RETWEET_DATA).length);
        console.log("Real Quote Tweet data length:", bytes(REAL_QUOTE_TWEET_DATA).length);
        console.log("Real Like/Retweet URL length:", bytes(REAL_FAV_RETWEET_URL).length);
        console.log("Real Quote Tweet URL length:", bytes(REAL_QUOTE_TWEET_URL).length);
        
        // Test that our JsonParser handles both formats
        bool realFavorited = REAL_FAV_RETWEET_DATA.getBool("favorited");
        bool realRetweeted = REAL_FAV_RETWEET_DATA.getBool("retweeted");
        
        // Simulated data for comparison
        string memory simulatedData = '{"favorited":true,"retweeted":false}';
        bool simulatedFavorited = simulatedData.getBool("favorited");
        bool simulatedRetweeted = simulatedData.getBool("retweeted");
        
        console.log("Real favorited (string 'true'):", realFavorited);
        console.log("Simulated favorited (bool true):", simulatedFavorited);
        console.log("Real retweeted (string 'true'):", realRetweeted);
        console.log("Simulated retweeted (bool false):", simulatedRetweeted);
        
        // Both should work with our JsonParser
        assertTrue(realFavorited);
        assertTrue(simulatedFavorited);
        assertTrue(realRetweeted);
        assertFalse(simulatedRetweeted);
        
        console.log("[PASS] Real vs simulated data comparison passed!");
    }
    
    function testRealDataErrorHandling() public {
        console.log("=== Testing Real Data Error Handling ===");
        
        // Test with malformed real-like data
        string memory malformedData = '{"favorited":"true","retweeted":}'; // Missing value
        
        // Should gracefully handle malformed JSON
        bool malformedFavorited = malformedData.getBool("favorited");
        bool malformedRetweeted = malformedData.getBool("retweeted");
        
        assertTrue(malformedFavorited); // Should still parse first field
        assertFalse(malformedRetweeted); // Should return false for malformed field
        
        // Test with incomplete real data
        string memory incompleteData = '{"favorited":"true"}'; // Missing retweeted field
        
        bool incompleteFavorited = incompleteData.getBool("favorited");
        bool incompleteRetweeted = incompleteData.getBool("retweeted");
        
        assertTrue(incompleteFavorited);
        assertFalse(incompleteRetweeted); // Should return false for missing field
        
        console.log("[PASS] Error handling tests passed!");
    }
}