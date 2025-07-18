// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {QuestSystem} from "../src/QuestSystem.sol";
import {MockPrimusZKTLS} from "../src/mocks/MockPrimusZKTLS.sol";
import {IPrimusZKTLS, Attestation, AttNetworkRequest, AttNetworkResponseResolve, Attestor} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";

/**
 * @title Sepolia Test Script
 * @dev Complete test script for Sepolia deployment with quest creation and claim testing
 * @notice Run with: forge script script/SepoliaTestScript.s.sol --rpc-url https://ethereum-sepolia-rpc.publicnode.com --broadcast --verify
 */
contract SepoliaTestScript is Script {
    
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Sepolia Test Script Started ===");
        console.log("Deployer:", deployer);
        console.log("Network:", block.chainid);
        console.log("Balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Use existing ZKTLS contract
        console.log("\n=== Step 1: Using existing ZKTLS contract ===");
        address zkTLSContract = 0x3760aB354507a29a9F5c65A66C74353fd86393FA;
        console.log("Using ZKTLS contract at:", zkTLSContract);

        // Step 2: Deploy QuestSystem
        console.log("\n=== Step 2: Deploying QuestSystem ===");
        QuestSystem questSystem = new QuestSystem(zkTLSContract);
        console.log("QuestSystem deployed at:", address(questSystem));

        // Step 3: Create Quest using provided rawdata
        console.log("\n=== Step 3: Creating Quest ===");
        QuestSystem.Quest memory quest = _createQuestFromRawData();
        
        try questSystem.createQuest{value: quest.totalRewards}(quest) {
            console.log("[SUCCESS] Quest created successfully!");
            console.log("Quest ID: 1");
            console.log("Total Rewards:", quest.totalRewards);
        } catch Error(string memory reason) {
            console.log("[ERROR] Quest creation failed:", reason);
            vm.stopBroadcast();
            return;
        } catch {
            console.log("[ERROR] Quest creation failed with unknown error");
            vm.stopBroadcast();
            return;
        }

        // // Step 4: Test claimReward using provided calldata
        // console.log("\n=== Step 4: Testing claimReward ===");
        // Attestation memory attestation = _createAttestationFromCalldata();
        
        // try questSystem.claimReward(1, attestation) {
        //     console.log("[SUCCESS] claimReward successful!");
        //     console.log("Reward claimed by:", deployer);
        // } catch Error(string memory reason) {
        //     console.log("[ERROR] claimReward failed:", reason);
        // } catch {
        //     console.log("[ERROR] claimReward failed with unknown error");
        // }

        vm.stopBroadcast();

        // Final Summary
        console.log("\n=== Final Summary ===");
        console.log("ZKTLS Contract:", zkTLSContract);
        console.log("QuestSystem:", address(questSystem));
        console.log("Deployer balance after:", deployer.balance);
        
        // console.log("\n=== Manual Test Commands ===");
        // console.log("To test claimReward manually:");
        // console.log("cast send", address(questSystem));
        // console.log("\"claimReward(uint256,(address,address,string,string,string,string,uint256,string[],uint256[],string,string[],address[],string[]))\"");
        // console.log("1 <attestation_data> --rpc-url https://ethereum-sepolia-rpc.publicnode.com --private-key $PRIVATE_KEY");
    }

    /**
     * @notice Test claimReward function with existing contract
     * @dev Use this to test step 4 with an already deployed QuestSystem contract
     * @param questSystemAddress Address of the deployed QuestSystem contract
     */
    function testClaimReward(address questSystemAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== Testing ClaimReward ===");
        console.log("Deployer:", deployer);
        console.log("QuestSystem Address:", questSystemAddress);
        console.log("Network:", block.chainid);
        
        QuestSystem questSystem = QuestSystem(payable(questSystemAddress));
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("\n=== Step 4: Testing claimReward ===");
        Attestation memory attestation = _createAttestationFromCalldata();
        
        try questSystem.claimReward(1, attestation) {
            console.log("[SUCCESS] claimReward successful!");
            console.log("Reward claimed by:", deployer);
            
            // Check if user has qualified
            try questSystem.hasQualified(1, deployer) returns (bool qualified) {
                console.log("User qualified status:", qualified);
            } catch {
                console.log("Could not check qualification status");
            }
            
        } catch Error(string memory reason) {
            console.log("[ERROR] claimReward failed:", reason);
        } catch {
            console.log("[ERROR] claimReward failed with unknown error");
        }
        
        vm.stopBroadcast();
        
        console.log("\n=== Test Complete ===");
        console.log("Deployer balance after:", deployer.balance);
    }

    function _createQuestFromRawData() internal pure returns (QuestSystem.Quest memory) {
        // Decode the createQuest rawdata from createQuest_rawdata.txt
        QuestSystem.VerificationParams memory verificationParams = QuestSystem.VerificationParams({
            apiUrlPattern: "https://x.com/i/api/graphql/",
            apiEndpointHash: "FJGOFKfjA67MmT4I9p1qZg",
            proofValidityPeriod: 1942933687978365289,
            targetLikeRetweetId: "",
            favoritedJsonPath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.favorited",
            retweetedJsonPath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.retweeted",
            requireFavorite: false,
            requireRetweet: false,
            targetQuotedTweetId: "",
            quotedStatusIdJsonPath: "",
            userIdJsonPath: "",
            quoteTweetIdJsonPath: ""
        });

        return QuestSystem.Quest({
            id: 0,
            sponsor: address(0),
            title: "Monad@BJ",
            description: "Monad@BJ",
            launch_page: "https://x.com/BoxMrChen/status/1945396393528713656",
            questType: QuestSystem.QuestType.LikeAndRetweet,
            status: QuestSystem.QuestStatus.Pending,
            verificationParams: verificationParams,
            totalRewards: 10000000000000000, // 0.01 ETH
            rewardPerUser: 1000000000000000,  // 0.001 ETH  
            maxParticipants: 10,
            participantCount: 0,
            startTime: 1752763977,
            endTime: 1752850377,
            claimEndTime: 1752936777,
            isVesting: false,
            vestingDuration: 0
        });
    }

    function _createAttestationFromCalldata() internal pure returns (Attestation memory) {
        // Create attestation based on ProofFavAndRetweet.json and calldata.txt
        address recipient = 0xcA3c580751a27c04208AeBD70fa7e88509711270;
        
        // Create the network request
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
        signatures[0] = hex"704034dd2a9d5d06895f474f530f50b162066d5d0409e09779bf23284cb025e43464e635888dd6b18c2016561fde4a6c6f0dda78edfdf9f1b63749e94e7eb1971c";

        return Attestation({
            recipient: recipient,
            request: request,
            reponseResolve: responseResolve,
            data: "{\"favorited\":\"true\",\"retweeted\":\"true\"}",
            attConditions: "[{\"op\":\"REVEAL_STRING\",\"field\":\"$.data.threaded_conversation_with_injections_v2.instructions[1].entries[2].content.itemContent.tweet_results.result.legacy.favorited\"},{\"op\":\"REVEAL_STRING\",\"field\":\"$.data.threaded_conversation_with_injections_v2.instructions[1].entries[2].content.itemContent.tweet_results.result.legacy.retweeted\"}]",
            timestamp: 1752763977408,
            additionParams: "{\"algorithmType\":\"proxytls\",\"launch_page\":\"https://x.com/BoxMrChen/status/1945396393528713656\"}",
            attestors: attestors,
            signatures: signatures
        });
    }
}