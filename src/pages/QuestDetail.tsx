import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PrimusZKTLS } from "@primuslabs/zktls-js-sdk";
import { useAccount, usePublicClient } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { claimRewardWithAttestation, claimReward } from '@/lib/questContract';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Share2,
  Wallet,
  CheckCircle,
  Clock,
  Users,
  Trophy,
  Coins,
  Target,
  FileText,
  Upload,
  ExternalLink,
  Copy,
  MessageSquare,
  Twitter,
  Heart,
  Repeat2,
  Hash,
  Loader2
} from "lucide-react";

// Extend window object type
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Quest data type
interface QuestDetail {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  launch_page: string; // Complete URL link to the tweet
  creator: {
    name: string;
    avatar: string;
    handle: string;
    address: string;
  };
  reward: {
    amount: number;
    type: 'MON' | 'ERC20' | 'NFT';
    distribution: 'Pool' | 'Per participant';
  };
  status: 'Active' | 'Claiming' | 'Cancelled' | 'Paused' | 'Completed';
  participants: {
    current: number;
    max: number;
  };
  deadline: Date;
  questType: 'twitter-interaction' | 'quote-tweet' | 'send-tweet';
  questConfig: {
    tweetUrl?: string;
    quoteTweetUrl?: string;
    requiredActions?: string[];
    requiredHashtag?: string;
  };
  category: 'Social' | 'Content' | 'DeFi' | 'Gaming' | 'Education';
  createdAt: Date;
}

interface Participant {
  id: string;
  address: string;
  joinedAt: Date;
  status: 'joined' | 'submitted' | 'completed';
}



const QuestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { t } = useTranslation('quests');

  const [quest, setQuest] = useState<QuestDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userProgress, setUserProgress] = useState({
    walletConnected: false,
    zkProofStarted: false,
    zkProofGenerated: false,
    proofVerified: false,
    rewardClaimed: false
  });
  const [hasAlreadyParticipated, setHasAlreadyParticipated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [zkProofData, setZkProofData] = useState<any>(null);
  const [primusZKTLS, setPrimusZKTLS] = useState<any>(null);
  const [zkInitializing, setZkInitializing] = useState(true);
  const [zkInitialized, setZkInitialized] = useState(false);
  const [pluginNotInstalled, setPluginNotInstalled] = useState(false);
  const [quoteTweetUrl, setQuoteTweetUrl] = useState<string>('');
  const [quoteTweetUrlError, setQuoteTweetUrlError] = useState<string>('');

  // Initialize Primus ZKTLS SDK
  useEffect(() => {
    const initializePrimus = async () => {
      try {
        setZkInitializing(true);
        setPluginNotInstalled(false);
        const primus = new PrimusZKTLS();
        const appId = import.meta.env.VITE_PRIMUS_APP_ID;
        if (!appId) {
          console.error('VITE_PRIMUS_APP_ID not found in environment');
          setZkInitializing(false);
          return;
        }
        const initResult = await primus.init(appId);
        console.log("Primus ZKTLS initialized:", initResult);
        setPrimusZKTLS(primus);
        setZkInitialized(true);
      } catch (error: any) {
        console.error("Failed to initialize Primus ZKTLS:", error);
        
        // Check if it's plugin not installed error
        if (error?.code === "00006" || error?.message?.includes("00006")) {
          setPluginNotInstalled(true);
          toast({
            title: t('zkProof.primusPluginRequired'),
            description: t('zkProof.installPrimusPlugin'),
            variant: "destructive",
            duration: 8000
          });
        } else {
          toast({
            title: t('zkProof.zktlsInitializationFailed'),
            description: t('zkProof.cannotInitializeZkSystem'),
            variant: "destructive"
          });
        }
        setZkInitialized(false);
      } finally {
        setZkInitializing(false);
      }
    };
    initializePrimus();
  }, []);

  // Listen to wallet connection status
  useEffect(() => {
    if (isConnected && address) {
      setUserProgress(prev => ({ ...prev, walletConnected: true }));
    } else {
      setUserProgress(prev => ({
        ...prev,
        walletConnected: false,
        zkProofStarted: false,
        zkProofGenerated: false,
        proofVerified: false,
        rewardClaimed: false
      }));
      setHasAlreadyParticipated(false);
    }
  }, [isConnected, address]);

  // Check if user has already participated in current activity
  useEffect(() => {
    const checkParticipation = async () => {
      if (!isConnected || !address || !quest?.id) return;

      try {
        const apiBase = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiBase}/api/participations/check/${quest.id}/${address}`);
        const result = await response.json();

        if (result.success && result.data.hasParticipated) {
          setHasAlreadyParticipated(true);
          setUserProgress(prev => ({ ...prev, rewardClaimed: true }));
        } else {
          setHasAlreadyParticipated(false);
        }
      } catch (error) {
        console.error('Failed to check participation:', error);
      }
    };

    checkParticipation();
  }, [isConnected, address, quest?.id]);

  // Get quest detail through API, field mapping
  useEffect(() => {
    const fetchQuestDetail = async () => {
      if (!id) return;
      try {
        const apiBase = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiBase}/api/quests/${id}`);
        const result = await res.json();
        if (!result.success) throw new Error('Quest not found');
        const data = result.data;
        // Field mapping
        setQuest({
          id: data.id,
          title: data.title,
          description: data.description,
          fullDescription: data.description,
          launch_page: data.launch_page || '',
          creator: {
            name: data.sponsor || "",
            avatar: data.sponsor ? (data.sponsor.replace(/^0x/i, '').slice(0, 2).toUpperCase()) : "",
            handle: "",
            address: data.sponsor || ""
          },
          reward: {
            amount: data.rewardPerUser ? Number(data.rewardPerUser) / 1e18 : 0,
            type: "MON",
            distribution: "Per participant"
          },
          status: data.status ? (data.status.charAt(0).toUpperCase() + data.status.slice(1)) : 'Active',
          participants: {
            current: data.participantCount || (data.stats?.participationPercentage ? Math.round((data.stats.participationPercentage / 100) * (data.maxParticipants || 100)) : 0),
            max: data.maxParticipants || 100
          },
          deadline: data.endTime ? new Date(data.endTime) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          questType: data.questType === "likeAndRetweet" ? "twitter-interaction" : data.questType || 'twitter-interaction',
          questConfig: {
            tweetUrl: data.metadata?.targetLikeRetweetId ? `https://twitter.com/i/web/status/${data.metadata.targetLikeRetweetId}` : undefined,
            requiredActions: [
              data.metadata?.requireFavorite ? "like" : null,
              data.metadata?.requireRetweet ? "retweet" : null
            ].filter(Boolean),
            // 其它 metadata 字段如需补充可在此添加
          },
          category: "Social",
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        });
      } catch (e) {
        setQuest(null);
      }
    };
    fetchQuestDetail();
  }, [id]);

  // Get participants through API, field mapping
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!id) return;
      try {
        const apiBase = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiBase}/api/participations/quest/${id}`);
        const result = await res.json();
        if (!result.success) throw new Error('No participants');
        const data = result.data;
        setParticipants(
          Array.isArray(data.participations)
            ? data.participations.map((item: any, idx: number) => ({
              id: item.id || String(idx + 1),
              address: item.userAddress || '',
              joinedAt: item.joinedAt ? new Date(item.joinedAt) : new Date(),
              status: item.status || 'joined',
            }))
            : []
        );
      } catch (e) {
        setParticipants([]);
      }
    };
    fetchParticipants();
  }, [id]);

  if (!quest) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <span className="text-lg text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-[hsl(var(--vibrant-green))]/15 text-[hsl(var(--vibrant-green))] border-[hsl(var(--vibrant-green))]/25';
      case 'Claiming':
        return 'bg-[hsl(var(--vibrant-yellow))]/15 text-[hsl(var(--vibrant-yellow))] border-[hsl(var(--vibrant-yellow))]/25';
      case 'Completed':
        return 'bg-[hsl(var(--vibrant-blue))]/15 text-[hsl(var(--vibrant-blue))] border-[hsl(var(--vibrant-blue))]/25';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const diff = quest.deadline.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const formatReward = () => {
    if (quest.reward.type === 'NFT') return 'NFT Badge';
    return `${quest.reward.amount.toFixed(quest.reward.type === 'MON' ? 3 : 0)} ${quest.reward.type}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 新的处理函数
  const handleConnectWallet = async () => {
    try {
      if (!isConnected && openConnectModal) {
        openConnectModal();
      }
    } catch (error) {
      toast({
        title: t('zkProof.connectionFailed'),
        description: t('zkProof.walletConnectionFailed'),
        variant: "destructive"
      });
    }
  };

  const validateQuoteTweetUrl = (url: string): boolean => {
    // Regex to validate Twitter/X URLs
    const twitterUrlRegex = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
    return twitterUrlRegex.test(url);
  };

  const handleQuoteTweetUrlChange = (url: string) => {
    setQuoteTweetUrl(url);
    if (url && !validateQuoteTweetUrl(url)) {
      setQuoteTweetUrlError(t('participation.invalidTwitterUrl'));
    } else {
      setQuoteTweetUrlError('');
    }
  };

  const handleStartProof = async () => {
    setCurrentStep(t('zkProof.startingProof'));
    setIsLoading(true);
    try {
      if (!primusZKTLS) {
        throw new Error('Primus ZKTLS not initialized');
      }

      if (!address) {
        throw new Error('Wallet not connected');
      }

      // For QuoteTweet quests, validate the quote tweet URL
      if (quest.questType === 'quote-tweet') {
        if (!quoteTweetUrl) {
          throw new Error(t('participation.enterQuoteTweetUrl'));
        }
        if (!validateQuoteTweetUrl(quoteTweetUrl)) {
          throw new Error(t('participation.enterValidTwitterUrl'));
        }
      }

      let attTemplateID = ""
      // 使用固定的 Template ID
      if (quest.questType == "twitter-interaction") {
        attTemplateID = "34a82c3f-781f-49a7-bd49-9d15c9382866";
      } else {
        attTemplateID = "32b16b38-9eab-41e0-96b1-218dd63be7a5"
      }

      const userAddress = address;

      // Generate proof request
      const request = primusZKTLS.generateRequestParams(attTemplateID, userAddress);

      // 设置额外参数 - 对于QuoteTweet使用用户的quote tweet URL，对于其他类型使用quest的launch_page
      const additionParams = {
        "launch_page": quest.questType === 'quote-tweet' ? quoteTweetUrl : quest.launch_page,
      };
      request.setAdditionParams(JSON.stringify(additionParams));

      // 转换请求为字符串
      const requestStr = request.toJsonString();

      // Send to server for signing
      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBase}/api/zktls/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signParams: requestStr })
      });
      const responseJson = await response.json();
      const signedRequestStr = responseJson.signResult;

      setUserProgress(prev => ({ ...prev, zkProofStarted: true }));
      toast({
        title: t('zkProof.signatureComplete'),
        description: t('zkProof.signatureObtained')
      });

      // Auto proceed to next step
      setTimeout(() => handleGenerateProof(signedRequestStr), 1000);
    } catch (error) {
      toast({
        title: t('zkProof.signatureFailed'),
        description: t('zkProof.zkSignatureFailed'),
        variant: "destructive"
      });
      setIsLoading(false);
      setCurrentStep('');
    }
  };

  const handleGenerateProof = async (signedRequestStr: string) => {
    setCurrentStep(t('zkProof.generatingProof'));
    try {
      if (!primusZKTLS) {
        throw new Error('Primus ZKTLS not initialized');
      }

      // Start proof process
      const attestation = await primusZKTLS.startAttestation(signedRequestStr);
      console.log("attestation=", attestation);

      setZkProofData(attestation);
      setUserProgress(prev => ({ ...prev, zkProofGenerated: true }));
      toast({
        title: t('zkProof.proofGenerationComplete'),
        description: t('zkProof.zkProofGenerated')
      });

      // Auto proceed to next step
      setTimeout(() => handleVerifyProof(attestation), 1000);
    } catch (error) {
      // Reset progress states when proof generation fails
      setUserProgress(prev => ({ 
        ...prev, 
        zkProofStarted: false, 
        zkProofGenerated: false,
        proofVerified: false 
      }));
      toast({
        title: t('zkProof.generationFailed'),
        description: t('zkProof.proofGenerationFailed'),
        variant: "destructive"
      });
      setIsLoading(false);
      setCurrentStep('');
    }
  };

  const handleVerifyProof = async (attestation: any) => {
    setCurrentStep(t('zkProof.verifyingProof'));
    try {
      if (!primusZKTLS) {
        throw new Error('Primus ZKTLS not initialized');
      }

      // Verify proof
      const verifyResult = await primusZKTLS.verifyAttestation(attestation);
      console.log("verifyResult=", verifyResult);

      if (!verifyResult) {
        throw new Error('Proof verification failed');
      }

      setUserProgress(prev => ({ ...prev, proofVerified: true }));
      toast({
        title: t('zkProof.proofVerificationPassed'),
        description: t('zkProof.proofVerificationSuccess')
      });
    } catch (error) {
      // Reset progress states when verification fails
      setUserProgress(prev => ({ 
        ...prev, 
        zkProofStarted: false, 
        zkProofGenerated: false,
        proofVerified: false 
      }));
      toast({
        title: t('zkProof.verificationFailed'),
        description: t('zkProof.proofVerificationFailed'),
        variant: "destructive"
      });
    }
    setIsLoading(false);
    setCurrentStep('');
  };

  const handleClaimReward = async () => {
    setCurrentStep(t('zkProof.claimingReward'));
    setIsLoading(true);
    try {
      if (!zkProofData) {
        throw new Error('ZK proof data not available');
      }

      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      if (!quest?.id) {
        throw new Error('Quest ID not found');
      }

      // Debug: Log the zkProofData structure
      console.log('zkProofData structure:', JSON.stringify(zkProofData, null, 2));

      // 调用智能合约 claimReward 方法
      const questIdBigInt = BigInt(quest.id);
      const txHash = await claimRewardWithAttestation(questIdBigInt, zkProofData);

      console.log('Transaction submitted:', txHash);

      // Update step status to waiting for transaction confirmation
      setCurrentStep(t('zkProof.waitingForConfirmation'));
      
      toast({
        title: t('zkProof.transactionSubmitted'),
        description: `${t('zkProof.transactionSubmittedToBlockchain')}${txHash.slice(0, 10)}...`,
        duration: 3000
      });

      // 等待交易被确认
      if (publicClient) {
        try {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash as `0x${string}`
          });
          
          if (receipt && receipt.status === 'success') {
            // Transaction successfully confirmed
            setUserProgress(prev => ({ ...prev, rewardClaimed: true }));
            toast({
              title: t('zkProof.rewardClaimSuccess'),
              description: `${t('zkProof.congratulations')}${formatReward()}${t('zkProof.rewardTransactionConfirmed')}`,
              duration: 5000
            });
          } else {
            throw new Error(t('zkProof.transactionFailedOrReverted'));
          }
        } catch (waitError) {
          console.warn(t('zkProof.checkingTransactionStatus'), waitError);
          // Fallback to polling method
          await waitForTransactionConfirmation(txHash);
        }
      } else {
        // If no public client available, use polling method
        await waitForTransactionConfirmation(txHash);
      }

      // Wait a moment then reload data
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('Claim reward error:', error);
      const errorMessage = parseContractError(error);
      toast({
        title: t('zkProof.claimFailed'),
        description: errorMessage,
        variant: "destructive"
      });
    }
    setIsLoading(false);
    setCurrentStep('');
  };

  // Parse contract error messages
  const parseContractError = (error: any): string => {
    console.log('Parsing contract error:', error);
    
    // Check if error message contains contract errors
    const errorMessage = error?.message || error?.reason || error?.data?.message || '';
    
    // Define contract error mappings
    const contractErrors = {
      'QuestSystem__QuoteTweetAlreadyUsed': t('zkProof.twitterAlreadyUsed'),
      'QuestSystem__UserAlreadyParticipated': t('zkProof.userAlreadyParticipated'),
      'QuestSystem__QuestNotActive': t('zkProof.questNotActive'),
      'QuestSystem__QuestFull': t('zkProof.questFull'),
      'QuestSystem__InvalidProof': t('zkProof.invalidProof'),
      'QuestSystem__ProofExpired': t('zkProof.proofExpired'),
      'QuestSystem__InvalidAttestation': t('zkProof.invalidAttestation'),
      'QuestSystem__InsufficientFunds': t('zkProof.insufficientFunds'),
      'QuestSystem__QuestEnded': t('zkProof.questEnded'),
      'QuestSystem__InvalidQuestId': t('zkProof.invalidQuestId'),
    };
    
    // Check if contains specific contract errors
    for (const [contractError, userMessage] of Object.entries(contractErrors)) {
      if (errorMessage.includes(contractError)) {
        return userMessage;
      }
    }
    
    // Check other common errors
    if (errorMessage.includes('User denied transaction') || errorMessage.includes('user rejected')) {
      return t('zkProof.userDeniedTransaction');
    }
    
    if (errorMessage.includes('insufficient funds')) {
      return t('zkProof.insufficientAccountFunds');
    }
    
    if (errorMessage.includes('gas')) {
      return t('zkProof.gasFeeInsufficient');
    }
    
    if (errorMessage.includes('nonce')) {
      return t('zkProof.nonceError');
    }
    
    if (errorMessage.includes('reverted')) {
      return t('zkProof.transactionReverted');
    }
    
    // If no matching error, return generic error message
    return errorMessage || t('zkProof.rewardClaimFailedGeneric');
  };

  // Polling helper function to wait for transaction confirmation
  const waitForTransactionConfirmation = async (txHash: string) => {
    const maxAttempts = 30; // Max 30 attempts, 3 seconds each
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const receipt = await publicClient?.getTransactionReceipt({
          hash: txHash as `0x${string}`
        });
        
        if (receipt) {
          if (receipt.status === 'success') {
            // Transaction successfully confirmed
            setUserProgress(prev => ({ ...prev, rewardClaimed: true }));
            toast({
              title: t('zkProof.rewardClaimSuccess'),
              description: `${t('zkProof.congratulations')}${formatReward()}${t('zkProof.rewardTransactionConfirmed')}`,
              duration: 5000
            });
            return;
          } else {
            throw new Error(t('zkProof.transactionFailedOrReverted'));
          }
        }
        
        // Wait 3 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
        
        // Update waiting status
        setCurrentStep(`${t('zkProof.waitingForConfirmation')} (${attempts}/${maxAttempts})`);
      } catch (error) {
        console.error(t('zkProof.checkingTransactionStatus'), error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // If timeout without confirmation, show warning but don't count as failure
    toast({
      title: t('zkProof.transactionConfirmationTimeout'),
      description: t('zkProof.transactionMayStillProcessing'),
      variant: "destructive"
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: t('common.linkCopied'),
      description: t('common.questLinkCopied')
    });
  };

  const getParticipantStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-[hsl(var(--vibrant-green))]/15 text-[hsl(var(--vibrant-green))]">{t('quest.participantStatus.completed')}</Badge>;
      case 'submitted':
        return <Badge className="bg-[hsl(var(--vibrant-yellow))]/15 text-[hsl(var(--vibrant-yellow))]">{t('quest.participantStatus.submitted')}</Badge>;
      default:
        return <Badge variant="outline">{t('quest.participantStatus.joined')}</Badge>;
    }
  };

  const getProgressPercentage = () => {
    return (quest.participants.current / quest.participants.max) * 100;
  };

  const getQuestTypeIcon = () => {
    switch (quest.questType) {
      case 'twitter-interaction':
        return <Heart className="h-5 w-5" />;
      case 'quote-tweet':
        return <MessageSquare className="h-5 w-5" />;
      case 'send-tweet':
        return <FileText className="h-5 w-5" />;
      default:
        return <Twitter className="h-5 w-5" />;
    }
  };

  const getQuestTypeLabel = () => {
    switch (quest.questType) {
      case 'twitter-interaction':
        return 'Twitter Interaction';
      case 'quote-tweet':
        return 'Quote Tweet';
      case 'send-tweet':
        return 'Send Tweet';
      default:
        return 'Twitter Quest';
    }
  };

  const getRequiredActions = () => {
    if (quest.questType === 'twitter-interaction' && quest.questConfig.requiredActions) {
      return quest.questConfig.requiredActions.map(action => {
        switch (action) {
          case 'like': return { icon: <Heart className="h-4 w-4" />, label: 'Like' };
          case 'retweet': return { icon: <Repeat2 className="h-4 w-4" />, label: 'Retweet' };
          case 'follow': return { icon: <Twitter className="h-4 w-4" />, label: 'Follow' };
          default: return { icon: <Twitter className="h-4 w-4" />, label: action };
        }
      });
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
          <div className="px-6 py-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/quests')}
                className="text-white hover:bg-white/20 border border-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('navigation.backToQuests')}
              </Button>
              <Button
                variant="ghost"
                onClick={handleShare}
                className="text-white hover:bg-white/20 border border-white/20"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {t('common.share')}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                    {getQuestTypeIcon()}
                  </div>
                  <div>
                    <Badge className="bg-white/20 text-white border-white/30 text-xs">
                      {getQuestTypeLabel()}
                    </Badge>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{quest.title}</h1>
                <p className="text-white/90 mb-3 text-sm">{quest.description}</p>

                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    <AvatarImage src={quest.creator.avatar} />
                    <AvatarFallback className="bg-white/20 text-white text-sm">
                      {quest.creator.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-semibold text-sm">{quest.creator.name}</div>
                    <div className="text-white/70 text-xs">{quest.creator.handle}</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 text-right">
                <Badge className={`text-sm ${getStatusBadgeColor(quest.status)} mb-2`}>
                  {t(`status.${quest.status.toLowerCase()}`)}
                </Badge>
                <div className="text-white/80 text-sm">
                  {getTimeRemaining()} {t('quest.timeRemaining')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-4">
        {/* Overview Cards - Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Reward Card */}
          <Card className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Trophy className="h-4 w-4" />
                {t('quest.reward')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold mb-1">{formatReward()}</div>
              <div className="text-white/80 text-xs">{t(`quest.rewardDistribution.${quest.reward.distribution.toLowerCase().replace(' ', '')}`)}</div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Users className="h-4 w-4" />
                {t('quest.progress')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold mb-1">
                {quest.participants.current}/{quest.participants.max}
              </div>
              <Progress value={getProgressPercentage()} className="mb-1 bg-white/20 [&>div]:bg-white h-2" />
              <div className="text-white/80 text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getTimeRemaining()} {t('quest.timeLeft')}
              </div>
            </CardContent>
          </Card>

          {/* Quest Type Card */}
          <Card className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                {getQuestTypeIcon()}
                {t('quest.type')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-base font-bold mb-1">{getQuestTypeLabel()}</div>
              <div className="text-white/80 text-xs">
                {quest.questType === 'twitter-interaction' ? t('quest.engageWithTweet') : t('quest.shareWithQuote')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="overview">{t('quest.overview')}</TabsTrigger>
                <TabsTrigger value="participants">{t('quest.participants')}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('quest.questDetails')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">{t('quest.description')}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {quest.fullDescription}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">{t('quest.questType')}</h4>
                        <div className="flex items-center gap-2">
                          {getQuestTypeIcon()}
                          <span className="text-sm">{getQuestTypeLabel()}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">{t('quest.category')}</h4>
                        <Badge variant="outline">{quest.category}</Badge>
                      </div>
                    </div>

                    {quest.questType === 'twitter-interaction' && (
                      <div>
                        <h4 className="font-semibold mb-2">{t('quest.requiredActions')}</h4>
                        <div className="flex gap-2 flex-wrap">
                          {getRequiredActions().map((action, index) => (
                            <div key={index} className="flex items-center gap-1 bg-muted rounded-lg px-3 py-1">
                              {action.icon}
                              <span className="text-sm">{action.label}</span>
                            </div>
                          ))}
                        </div>
                        {quest.launch_page && (
                          <div className="mt-3">
                            <h5 className="font-medium mb-1 text-sm">{t('quest.targetTweet')}</h5>
                            <a
                              href={quest.launch_page}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-sm break-all"
                            >
                              {quest.launch_page}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {quest.questType === 'quote-tweet' && (
                      <div>
                        <h4 className="font-semibold mb-2">{t('quest.quoteTweetRequirements')}</h4>
                        {quest.launch_page && (
                          <div className="mb-3">
                            <h5 className="font-medium mb-1 text-sm">{t('quest.originalTweetToQuote')}</h5>
                            <a
                              href={quest.launch_page}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-sm break-all"
                            >
                              {quest.launch_page}
                            </a>
                          </div>
                        )}
                        {quest.questConfig.requiredHashtag && (
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{t('quest.requiredHashtag')}: </span>
                            <Badge variant="secondary">{quest.questConfig.requiredHashtag}</Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="participants" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('quest.questParticipants')} ({participants.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {participant.address.slice(2, 4).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-mono text-sm">{formatAddress(participant.address)}</div>
                              <div className="text-xs text-muted-foreground">
                                {t('quest.joined')} {participant.joinedAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getParticipantStatus(participant.status)}
                            <Button variant="ghost" size="sm">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Participate Section - Right sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t('participation.howToParticipate')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Already participated notice */}
                  {hasAlreadyParticipated && (
                    <div className="text-center p-4 bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] text-white rounded-lg mb-4">
                      <div className="text-lg font-bold">✅ {t('participation.alreadyParticipated')}</div>
                      <div className="text-white/80 text-sm">{t('participation.rewardClaimed')}</div>
                    </div>
                  )}

                  {/* Plugin not installed notice */}
                  {pluginNotInstalled && (
                    <div className="text-center p-4 bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-red))] text-white rounded-lg mb-4">
                      <div className="text-lg font-bold">🔌 {t('participation.pluginRequired')}</div>
                      <div className="text-white/80 text-sm mb-3">
                        {t('participation.installPluginMessage')}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                          onClick={() => window.open('https://chromewebstore.google.com/detail/oeiomhmbaapihbilkfkhmlajkeegnjhe', '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {t('participation.installPlugin')}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                          onClick={() => window.location.reload()}
                        >
                          🔄 {t('participation.retry')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Reward Information */}
                  <div className="text-center p-4 bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white rounded-lg">
                    <div className="text-xl font-bold">{formatReward()}</div>
                    <div className="text-white/80 text-sm">{t('participation.rewardPerParticipant')}</div>
                  </div>

                  {/* Current Status */}
                  {isLoading && currentStep && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium">{currentStep}</div>
                    </div>
                  )}

                  {/* If already participated, hide all steps */}
                  {!hasAlreadyParticipated && (
                    <>
                      {/* Step 1: Connect Wallet */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${userProgress.walletConnected
                          ? 'bg-[hsl(var(--vibrant-green))] text-white'
                          : 'bg-muted text-muted-foreground'
                          }`}>
                          {userProgress.walletConnected ? <CheckCircle className="h-3 w-3" /> : '1'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{t('participation.connectWallet')}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {t('participation.connectWalletDescription')}
                          </p>
                          {!isConnected ? (
                            <Button onClick={handleConnectWallet} disabled={isLoading} size="sm" className="w-full">
                              <Wallet className="h-3 w-3 mr-1" />
                              {t('participation.connectWalletButton')}
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      {/* 步骤 2: Quote Tweet URL Input (for quote-tweet quests) */}
                      {quest.questType === 'quote-tweet' && (
                        <div className="flex items-start gap-3 p-3 rounded-lg border">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${quoteTweetUrl && !quoteTweetUrlError
                            ? 'bg-[hsl(var(--vibrant-green))] text-white'
                            : isConnected && !hasAlreadyParticipated
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                            }`}>
                            {quoteTweetUrl && !quoteTweetUrlError ? <CheckCircle className="h-3 w-3" /> : '2'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{t('participation.quoteTweetUrl')}</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {t('participation.quoteTweetDescription')}
                            </p>
                            <div className="mb-2">
                              <a
                                href={quest.launch_page}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline block mb-2"
                              >
                                📝 {t('participation.quoteTweetPrompt')}: {quest.launch_page}
                              </a>
                            </div>
                            <input
                              type="text"
                              placeholder={t('participation.quoteTweetPlaceholder')}
                              value={quoteTweetUrl}
                              onChange={(e) => handleQuoteTweetUrlChange(e.target.value)}
                              className="w-full text-xs border border-border rounded px-2 py-1 mb-1 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                              disabled={!isConnected || hasAlreadyParticipated}
                            />
                            {quoteTweetUrlError && (
                              <p className="text-xs text-red-500 mb-1">{quoteTweetUrlError}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Start Proof */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${userProgress.zkProofStarted
                          ? 'bg-[hsl(var(--vibrant-green))] text-white'
                          : isConnected && !hasAlreadyParticipated && (quest.questType !== 'quote-tweet' || (quoteTweetUrl && !quoteTweetUrlError))
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                          }`}>
                          {userProgress.zkProofStarted ? <CheckCircle className="h-3 w-3" /> : quest.questType === 'quote-tweet' ? '3' : '2'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{t('participation.startProof')}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {t('participation.startProofDescription')}
                          </p>
                          {zkInitializing && (
                            <div className="text-xs text-blue-500 mb-2">
                              ⏳ {t('participation.initializingSystem')}
                            </div>
                          )}
                          {isConnected && !userProgress.zkProofStarted && (quest.questType !== 'quote-tweet' || (quoteTweetUrl && !quoteTweetUrlError)) ? (
                            <Button 
                              onClick={handleStartProof} 
                              disabled={isLoading || !zkInitialized || pluginNotInstalled} 
                              size="sm" 
                              className="w-full"
                            >
                              {pluginNotInstalled 
                                ? t('participation.installPluginFirst') 
                                : isLoading && currentStep.includes('ZK') 
                                  ? t('participation.starting') 
                                  : !zkInitialized 
                                    ? t('participation.initializingZktls') 
                                    : t('participation.startProofButton')
                              }
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      {/* Step 4: Generate Proof */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${userProgress.zkProofGenerated
                          ? 'bg-[hsl(var(--vibrant-green))] text-white'
                          : userProgress.zkProofStarted
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                          }`}>
                          {userProgress.zkProofGenerated ? <CheckCircle className="h-3 w-3" /> : quest.questType === 'quote-tweet' ? '4' : '3'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{t('participation.generateProof')}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {t('participation.generateProofDescription')}
                          </p>
                          {userProgress.zkProofStarted && !userProgress.zkProofGenerated && isLoading && (
                            <div className="text-xs text-muted-foreground">{t('participation.generatingProof')}</div>
                          )}
                        </div>
                      </div>

                      {/* Step 5: Verify Proof */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${userProgress.proofVerified
                          ? 'bg-[hsl(var(--vibrant-green))] text-white'
                          : userProgress.zkProofGenerated
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                          }`}>
                          {userProgress.proofVerified ? <CheckCircle className="h-3 w-3" /> : quest.questType === 'quote-tweet' ? '5' : '4'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{t('participation.verifyProof')}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {t('participation.verifyProofDescription')}
                          </p>
                          {userProgress.zkProofGenerated && !userProgress.proofVerified && isLoading && (
                            <div className="text-xs text-muted-foreground">{t('participation.verifyingProof')}</div>
                          )}
                        </div>
                      </div>

                      {/* Step 6: Submit Reward */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${userProgress.rewardClaimed
                          ? 'bg-[hsl(var(--vibrant-green))] text-white'
                          : userProgress.proofVerified
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                          }`}>
                          {userProgress.rewardClaimed ? <CheckCircle className="h-3 w-3" /> : quest.questType === 'quote-tweet' ? '6' : '5'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{t('participation.claimReward')}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {t('participation.claimRewardDescription')}
                          </p>
                          {userProgress.proofVerified && !userProgress.rewardClaimed ? (
                            <Button onClick={handleClaimReward} disabled={isLoading} size="sm" className="w-full">
                              {isLoading ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Trophy className="h-3 w-3 mr-1" />
                              )}
                              {isLoading 
                                ? (currentStep.includes('Waiting for transaction') ? t('participation.confirming') : t('participation.claiming')) 
                                : t('participation.claimRewardButton')
                              }
                            </Button>
                          ) : userProgress.rewardClaimed ? (
                            <div className="text-xs text-[hsl(var(--vibrant-green))] font-medium">
                              🎉 {t('participation.rewardSuccessfullyClaimed')}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestDetail;