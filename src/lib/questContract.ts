import { parseEther } from 'viem';
import { writeContract, readContract } from '@wagmi/core';
import { config } from './wagmi';

// QuestSystem contract address from environment variables
// Falls back to default Sepolia address if not configured
export const QUEST_SYSTEM_ADDRESS = (import.meta.env.VITE_QUEST_SYSTEM_ADDRESS || '0xe685751047B223E74131Ce7f4E5A425F44AF64d6') as `0x${string}`;

// Chain ID from environment variables (defaults to Sepolia)
export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || '11155111');

// QuestSystem ABI (minimal required functions)
export const QUEST_SYSTEM_ABI = [{"inputs":[{"internalType":"address","name":"_primusZKTLS","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"QuestSystem__AttestationVerificationFailed","type":"error"},{"inputs":[],"name":"QuestSystem__CannotCancelWithParticipants","type":"error"},{"inputs":[],"name":"QuestSystem__ClaimPeriodNotOver","type":"error"},{"inputs":[],"name":"QuestSystem__ContentVerificationFailed","type":"error"},{"inputs":[],"name":"QuestSystem__IncorrectETHAmount","type":"error"},{"inputs":[],"name":"QuestSystem__InvalidRewardAmount","type":"error"},{"inputs":[],"name":"QuestSystem__InvalidTimeSequence","type":"error"},{"inputs":[],"name":"QuestSystem__NoRewardsToClaim","type":"error"},{"inputs":[],"name":"QuestSystem__NotSponsor","type":"error"},{"inputs":[],"name":"QuestSystem__NotVestingQuest","type":"error"},{"inputs":[],"name":"QuestSystem__QuestAlreadyCanceled","type":"error"},{"inputs":[],"name":"QuestSystem__QuestNotActive","type":"error"},{"inputs":[],"name":"QuestSystem__RewardPoolDepleted","type":"error"},{"inputs":[],"name":"QuestSystem__UserAlreadyQualified","type":"error"},{"inputs":[],"name":"QuestSystem__UserNotQualified","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"}],"name":"QuestCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"},{"indexed":true,"internalType":"address","name":"sponsor","type":"address"},{"indexed":false,"internalType":"uint256","name":"totalRewards","type":"uint256"},{"indexed":false,"internalType":"string","name":"title","type":"string"},{"indexed":false,"internalType":"string","name":"description","type":"string"}],"name":"QuestCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"},{"indexed":true,"internalType":"address","name":"sponsor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RemainingRewardsWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"questId","type":"uint256"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"VestingRewardClaimed","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"amountClaimedVesting","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_questId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"canUserClaimReward","outputs":[{"internalType":"bool","name":"canClaim","type":"bool"},{"internalType":"string","name":"reason","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_questId","type":"uint256"}],"name":"cancelQuest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_questId","type":"uint256"},{"components":[{"internalType":"address","name":"recipient","type":"address"},{"components":[{"internalType":"string","name":"url","type":"string"},{"internalType":"string","name":"header","type":"string"},{"internalType":"string","name":"method","type":"string"},{"internalType":"string","name":"body","type":"string"}],"internalType":"struct AttNetworkRequest","name":"request","type":"tuple"},{"components":[{"internalType":"string","name":"keyName","type":"string"},{"internalType":"string","name":"parseType","type":"string"},{"internalType":"string","name":"parsePath","type":"string"}],"internalType":"struct AttNetworkResponseResolve[]","name":"reponseResolve","type":"tuple[]"},{"internalType":"string","name":"data","type":"string"},{"internalType":"string","name":"attConditions","type":"string"},{"internalType":"uint64","name":"timestamp","type":"uint64"},{"internalType":"string","name":"additionParams","type":"string"},{"components":[{"internalType":"address","name":"attestorAddr","type":"address"},{"internalType":"string","name":"url","type":"string"}],"internalType":"struct Attestor[]","name":"attestors","type":"tuple[]"},{"internalType":"bytes[]","name":"signatures","type":"bytes[]"},{"internalType":"string","name":"extendedData","type":"string"}],"internalType":"struct Attestation","name":"_attestation","type":"tuple"}],"name":"claimReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_questId","type":"uint256"}],"name":"claimVestingReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"sponsor","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"launch_page","type":"string"},{"internalType":"enum QuestSystem.QuestType","name":"questType","type":"uint8"},{"internalType":"enum QuestSystem.QuestStatus","name":"status","type":"uint8"},{"components":[{"internalType":"string","name":"apiUrlPattern","type":"string"},{"internalType":"string","name":"apiEndpointHash","type":"string"},{"internalType":"uint256","name":"proofValidityPeriod","type":"uint256"},{"internalType":"string","name":"targetLikeRetweetId","type":"string"},{"internalType":"string","name":"favoritedJsonPath","type":"string"},{"internalType":"string","name":"retweetedJsonPath","type":"string"},{"internalType":"bool","name":"requireFavorite","type":"bool"},{"internalType":"bool","name":"requireRetweet","type":"bool"},{"internalType":"string","name":"targetQuotedTweetId","type":"string"},{"internalType":"string","name":"quotedStatusIdJsonPath","type":"string"},{"internalType":"string","name":"userIdJsonPath","type":"string"},{"internalType":"string","name":"quoteTweetIdJsonPath","type":"string"}],"internalType":"struct QuestSystem.VerificationParams","name":"verificationParams","type":"tuple"},{"internalType":"uint256","name":"totalRewards","type":"uint256"},{"internalType":"uint256","name":"rewardPerUser","type":"uint256"},{"internalType":"uint256","name":"maxParticipants","type":"uint256"},{"internalType":"uint256","name":"participantCount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"claimEndTime","type":"uint256"},{"internalType":"bool","name":"isVesting","type":"bool"},{"internalType":"uint256","name":"vestingDuration","type":"uint256"}],"internalType":"struct QuestSystem.Quest","name":"_quest","type":"tuple"}],"name":"createQuest","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_offset","type":"uint256"},{"internalType":"uint256","name":"_limit","type":"uint256"}],"name":"getAllQuestIds","outputs":[{"internalType":"uint256[]","name":"questIds","type":"uint256[]"},{"internalType":"uint256","name":"totalCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_questIds","type":"uint256[]"}],"name":"getMultipleQuests","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"sponsor","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"launch_page","type":"string"},{"internalType":"enum QuestSystem.QuestType","name":"questType","type":"uint8"},{"internalType":"enum QuestSystem.QuestStatus","name":"status","type":"uint8"},{"components":[{"internalType":"string","name":"apiUrlPattern","type":"string"},{"internalType":"string","name":"apiEndpointHash","type":"string"},{"internalType":"uint256","name":"proofValidityPeriod","type":"uint256"},{"internalType":"string","name":"targetLikeRetweetId","type":"string"},{"internalType":"string","name":"favoritedJsonPath","type":"string"},{"internalType":"string","name":"retweetedJsonPath","type":"string"},{"internalType":"bool","name":"requireFavorite","type":"bool"},{"internalType":"bool","name":"requireRetweet","type":"bool"},{"internalType":"string","name":"targetQuotedTweetId","type":"string"},{"internalType":"string","name":"quotedStatusIdJsonPath","type":"string"},{"internalType":"string","name":"userIdJsonPath","type":"string"},{"internalType":"string","name":"quoteTweetIdJsonPath","type":"string"}],"internalType":"struct QuestSystem.VerificationParams","name":"verificationParams","type":"tuple"},{"internalType":"uint256","name":"totalRewards","type":"uint256"},{"internalType":"uint256","name":"rewardPerUser","type":"uint256"},{"internalType":"uint256","name":"maxParticipants","type":"uint256"},{"internalType":"uint256","name":"participantCount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"claimEndTime","type":"uint256"},{"internalType":"bool","name":"isVesting","type":"bool"},{"internalType":"uint256","name":"vestingDuration","type":"uint256"}],"internalType":"struct QuestSystem.Quest[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNextQuestId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_questId","type":"uint256"}],"name":"getQuest","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"sponsor","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"launch_page","type":"string"},{"internalType":"enum QuestSystem.QuestType","name":"questType","type":"uint8"},{"internalType":"enum QuestSystem.QuestStatus","name":"status","type":"uint8"},{"components":[{"internalType":"string","name":"apiUrlPattern","type":"string"},{"internalType":"string","name":"apiEndpointHash","type":"string"},{"internalType":"uint256","name":"proofValidityPeriod","type":"uint256"},{"internalType":"string","name":"targetLikeRetweetId","type":"string"},{"internalType":"string","name":"favoritedJsonPath","type":"string"},{"internalType":"string","name":"retweetedJsonPath","type":"string"},{"internalType":"bool","name":"requireFavorite","type":"bool"},{"internalType":"bool","name":"requireRetweet","type":"bool"},{"internalType":"string","name":"targetQuotedTweetId","type":"string"},{"internalType":"string","name":"quotedStatusIdJsonPath","type":"string"},{"internalType":"string","name":"userIdJsonPath","type":"string"},{"internalType":"string","name":"quoteTweetIdJsonPath","type":"string"}],"internalType":"struct QuestSystem.VerificationParams","name":"verificationParams","type":"tuple"},{"internalType":"uint256","name":"totalRewards","type":"uint256"},{"internalType":"uint256","name":"rewardPerUser","type":"uint256"},{"internalType":"uint256","name":"maxParticipants","type":"uint256"},{"internalType":"uint256","name":"participantCount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"claimEndTime","type":"uint256"},{"internalType":"bool","name":"isVesting","type":"bool"},{"internalType":"uint256","name":"vestingDuration","type":"uint256"}],"internalType":"struct QuestSystem.Quest","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_questId","type":"uint256"}],"name":"getQuestDetails","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"sponsor","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"launch_page","type":"string"},{"internalType":"enum QuestSystem.QuestType","name":"questType","type":"uint8"},{"internalType":"enum QuestSystem.QuestStatus","name":"status","type":"uint8"},{"components":[{"internalType":"string","name":"apiUrlPattern","type":"string"},{"internalType":"string","name":"apiEndpointHash","type":"string"},{"internalType":"uint256","name":"proofValidityPeriod","type":"uint256"},{"internalType":"string","name":"targetLikeRetweetId","type":"string"},{"internalType":"string","name":"favoritedJsonPath","type":"string"},{"internalType":"string","name":"retweetedJsonPath","type":"string"},{"internalType":"bool","name":"requireFavorite","type":"bool"},{"internalType":"bool","name":"requireRetweet","type":"bool"},{"internalType":"string","name":"targetQuotedTweetId","type":"string"},{"internalType":"string","name":"quotedStatusIdJsonPath","type":"string"},{"internalType":"string","name":"userIdJsonPath","type":"string"},{"internalType":"string","name":"quoteTweetIdJsonPath","type":"string"}],"internalType":"struct QuestSystem.VerificationParams","name":"verificationParams","type":"tuple"},{"internalType":"uint256","name":"totalRewards","type":"uint256"},{"internalType":"uint256","name":"rewardPerUser","type":"uint256"},{"internalType":"uint256","name":"maxParticipants","type":"uint256"},{"internalType":"uint256","name":"participantCount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"claimEndTime","type":"uint256"},{"internalType":"bool","name":"isVesting","type":"bool"},{"internalType":"uint256","name":"vestingDuration","type":"uint256"}],"internalType":"struct QuestSystem.Quest","name":"quest","type":"tuple"},{"internalType":"enum QuestSystem.QuestStatus","name":"currentStatus","type":"uint8"},{"internalType":"uint256","name":"remainingSlots","type":"uint256"},{"internalType":"uint256","name":"timeUntilStart","type":"uint256"},{"internalType":"uint256","name":"timeUntilEnd","type":"uint256"},{"internalType":"uint256","name":"timeUntilClaimEnd","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getQuestStatistics","outputs":[{"internalType":"uint256","name":"totalQuests","type":"uint256"},{"internalType":"uint256","name":"activeQuests","type":"uint256"},{"internalType":"uint256","name":"completedQuests","type":"uint256"},{"internalType":"uint256","name":"totalRewardsDistributed","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"_offset","type":"uint256"},{"internalType":"uint256","name":"_limit","type":"uint256"}],"name":"getQuestsByParticipant","outputs":[{"internalType":"uint256[]","name":"questIds","type":"uint256[]"},{"internalType":"uint256","name":"totalCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_sponsor","type":"address"},{"internalType":"uint256","name":"_offset","type":"uint256"},{"internalType":"uint256","name":"_limit","type":"uint256"}],"name":"getQuestsBySponsor","outputs":[{"internalType":"uint256[]","name":"questIds","type":"uint256[]"},{"internalType":"uint256","name":"totalCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"enum QuestSystem.QuestStatus","name":"_status","type":"uint8"},{"internalType":"uint256","name":"_offset","type":"uint256"},{"internalType":"uint256","name":"_limit","type":"uint256"}],"name":"getQuestsByStatus","outputs":[{"internalType":"uint256[]","name":"questIds","type":"uint256[]"},{"internalType":"uint256","name":"totalCount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"getUserStatistics","outputs":[{"internalType":"uint256","name":"participatedQuests","type":"uint256"},{"internalType":"uint256","name":"totalRewardsEarned","type":"uint256"},{"internalType":"uint256","name":"pendingVestingRewards","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_questId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"getVestingInfo","outputs":[{"internalType":"uint256","name":"vestedAmount","type":"uint256"},{"internalType":"uint256","name":"claimedAmount","type":"uint256"},{"internalType":"uint256","name":"claimableAmount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"hasQualified","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_questId","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"hasUserQualified","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_questId","type":"uint256"},{"internalType":"string","name":"_quoteTweetId","type":"string"}],"name":"isQuoteTweetIdUsed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"string","name":"","type":"string"}],"name":"isQuoteTweetUsed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"primusZKTLS","outputs":[{"internalType":"contract IPrimusZKTLS","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"quests","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"sponsor","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"launch_page","type":"string"},{"internalType":"enum QuestSystem.QuestType","name":"questType","type":"uint8"},{"internalType":"enum QuestSystem.QuestStatus","name":"status","type":"uint8"},{"components":[{"internalType":"string","name":"apiUrlPattern","type":"string"},{"internalType":"string","name":"apiEndpointHash","type":"string"},{"internalType":"uint256","name":"proofValidityPeriod","type":"uint256"},{"internalType":"string","name":"targetLikeRetweetId","type":"string"},{"internalType":"string","name":"favoritedJsonPath","type":"string"},{"internalType":"string","name":"retweetedJsonPath","type":"string"},{"internalType":"bool","name":"requireFavorite","type":"bool"},{"internalType":"bool","name":"requireRetweet","type":"bool"},{"internalType":"string","name":"targetQuotedTweetId","type":"string"},{"internalType":"string","name":"quotedStatusIdJsonPath","type":"string"},{"internalType":"string","name":"userIdJsonPath","type":"string"},{"internalType":"string","name":"quoteTweetIdJsonPath","type":"string"}],"internalType":"struct QuestSystem.VerificationParams","name":"verificationParams","type":"tuple"},{"internalType":"uint256","name":"totalRewards","type":"uint256"},{"internalType":"uint256","name":"rewardPerUser","type":"uint256"},{"internalType":"uint256","name":"maxParticipants","type":"uint256"},{"internalType":"uint256","name":"participantCount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"claimEndTime","type":"uint256"},{"internalType":"bool","name":"isVesting","type":"bool"},{"internalType":"uint256","name":"vestingDuration","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_questId","type":"uint256"}],"name":"withdrawRemainingRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}] as const;

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