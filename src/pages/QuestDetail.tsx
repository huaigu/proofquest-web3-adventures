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
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { claimRewardWithAttestation, claimReward } from '@/lib/questContract';
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

// 扩展 window 对象类型
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Mock quest data type
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
    type: 'ETH' | 'ERC20' | 'NFT';
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

// Mock data with different quest types
const getMockQuest = (id: string): QuestDetail => {
  const questId = parseInt(id.replace('quest-', ''));

  const questData = {
    'quest-1': {
      title: "Like and Retweet our Project Announcement",
      description: "Help us spread the word about our latest project update by engaging with our announcement tweet.",
      fullDescription: "We're launching an exciting new feature and need your help to amplify our reach. This quest involves engaging with our official announcement tweet through likes and retweets. Your participation helps us build community awareness and demonstrates your support for our project.",
      questType: 'twitter-interaction' as const,
      questConfig: {
        tweetUrl: "https://twitter.com/proofquest/status/1234567890",
        requiredActions: ["like", "retweet"]
      },
      reward: { amount: 0.01, type: 'ETH' as const, distribution: 'Per participant' as const },
      participants: { current: 234, max: 500 }
    },
    'quest-2': {
      title: "Quote Tweet with Your Web3 Journey",
      description: "Share your Web3 journey by quote tweeting our community thread with the #Web3Journey hashtag.",
      fullDescription: "We want to hear about your unique Web3 journey! Quote tweet our community appreciation post and share your story, challenges, and wins in the Web3 space. This helps build our community narrative and inspires others.",
      questType: 'quote-tweet' as const,
      questConfig: {
        quoteTweetUrl: "https://twitter.com/proofquest/status/1234567891",
        requiredHashtag: "#Web3Journey"
      },
      reward: { amount: 0.05, type: 'ETH' as const, distribution: 'Per participant' as const },
      participants: { current: 67, max: 200 }
    },
    'quest-3': {
      title: "Follow and Like Our DeFi Education Thread",
      description: "Join our community by following our account and liking our comprehensive DeFi education thread.",
      fullDescription: "Expand your DeFi knowledge by engaging with our educational content. This quest requires you to follow our Twitter account and like our detailed thread explaining DeFi concepts, protocols, and best practices.",
      questType: 'twitter-interaction' as const,
      questConfig: {
        tweetUrl: "https://twitter.com/proofquest/status/1234567892",
        requiredActions: ["follow", "like"]
      },
      reward: { amount: 50, type: 'ERC20' as const, distribution: 'Per participant' as const },
      participants: { current: 156, max: 300 }
    },
    'quest-4': {
      title: "Quote Tweet with #ProofQuest and Your Thoughts",
      description: "Share what excites you about zero-knowledge proofs by quote tweeting with #ProofQuest hashtag.",
      fullDescription: "Help us build excitement around zero-knowledge proof technology! Quote tweet our latest ZK research post and share your thoughts, questions, or insights about how ZK proofs might impact the future of privacy and blockchain technology.",
      questType: 'quote-tweet' as const,
      questConfig: {
        quoteTweetUrl: "https://twitter.com/proofquest/status/1234567893",
        requiredHashtag: "#ProofQuest"
      },
      reward: { amount: 0.03, type: 'ETH' as const, distribution: 'Per participant' as const },
      participants: { current: 89, max: 150 }
    }
  };

  const defaultQuest = questData['quest-1'];
  const quest = questData[id as keyof typeof questData] || defaultQuest;

  return {
    id,
    ...quest,
    launch_page: quest.questConfig.tweetUrl || quest.questConfig.quoteTweetUrl || 'https://x.com/monad_xyz/status/1942933687978365289',
    creator: {
      name: "ProofQuest Team",
      avatar: "",
      handle: "@proofquest",
      address: "0x1234567890123456789012345678901234567890"
    },
    status: 'Active',
    deadline: new Date(Date.now() + (7 + questId) * 24 * 60 * 60 * 1000),
    category: 'Social',
    createdAt: new Date(Date.now() - questId * 24 * 60 * 60 * 1000)
  };
};

const getMockParticipants = (): Participant[] => [
  {
    id: "1",
    address: "0xAbC1234567890123456789012345678901234567890",
    joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "completed"
  },
  {
    id: "2",
    address: "0xDeF1234567890123456789012345678901234567890",
    joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "submitted"
  },
  {
    id: "3",
    address: "0x1111234567890123456789012345678901234567890",
    joinedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: "joined"
  }
];

const QuestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

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
  const [quoteTweetUrl, setQuoteTweetUrl] = useState<string>('');
  const [quoteTweetUrlError, setQuoteTweetUrlError] = useState<string>('');

  // 初始化 Primus ZKTLS SDK
  useEffect(() => {
    const initializePrimus = async () => {
      try {
        setZkInitializing(true);
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
      } catch (error) {
        console.error("Failed to initialize Primus ZKTLS:", error);
        setZkInitialized(false);
      } finally {
        setZkInitializing(false);
      }
    };
    initializePrimus();
  }, []);

  // 监听钱包连接状态
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

  // 检查用户是否已经参与过当前活动
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

  // 通过接口获取 quest detail，字段映射
  useEffect(() => {
    const fetchQuestDetail = async () => {
      if (!id) return;
      try {
        const apiBase = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiBase}/api/quests/${id}`);
        const result = await res.json();
        if (!result.success) throw new Error('Quest not found');
        const data = result.data;
        // 字段映射
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
            type: "ETH",
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

  // 通过接口获取 participants，字段映射
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
    return `${quest.reward.amount.toFixed(quest.reward.type === 'ETH' ? 3 : 0)} ${quest.reward.type}`;
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
        title: "连接失败",
        description: "钱包连接失败，请重试。",
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
      setQuoteTweetUrlError('Please enter a valid Twitter/X URL (e.g., https://twitter.com/user/status/123)');
    } else {
      setQuoteTweetUrlError('');
    }
  };

  const handleStartProof = async () => {
    setCurrentStep('启动 ZK 证明中...');
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
          throw new Error('Please enter your quote tweet URL');
        }
        if (!validateQuoteTweetUrl(quoteTweetUrl)) {
          throw new Error('Please enter a valid Twitter/X URL');
        }
      }

      let attTemplateID = ""
      // 使用固定的 Template ID
      if (quest.questType == "twitter-interaction") {
        attTemplateID = "60ca2736-b331-4321-b78e-a2495956700c";
      } else {
        attTemplateID = "32b16b38-9eab-41e0-96b1-218dd63be7a5"
      }

      const userAddress = address;

      // 生成证明请求
      const request = primusZKTLS.generateRequestParams(attTemplateID, userAddress);

      // 设置额外参数 - 对于QuoteTweet使用用户的quote tweet URL，对于其他类型使用quest的launch_page
      const additionParams = {
        "launch_page": quest.questType === 'quote-tweet' ? quoteTweetUrl : quest.launch_page,
      };
      request.setAdditionParams(JSON.stringify(additionParams));

      // 转换请求为字符串
      const requestStr = request.toJsonString();

      // 发送给服务器签名
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
        title: "ZK 签名完成",
        description: "已获取 ZK 签名，开始生成证明。"
      });

      // 自动进入下一步
      setTimeout(() => handleGenerateProof(signedRequestStr), 1000);
    } catch (error) {
      toast({
        title: "签名失败",
        description: "ZK 签名失败，请重试。",
        variant: "destructive"
      });
      setIsLoading(false);
      setCurrentStep('');
    }
  };

  const handleGenerateProof = async (signedRequestStr: string) => {
    setCurrentStep('生成证明中...');
    try {
      if (!primusZKTLS) {
        throw new Error('Primus ZKTLS not initialized');
      }

      // 开始证明过程
      const attestation = await primusZKTLS.startAttestation(signedRequestStr);
      console.log("attestation=", attestation);

      setZkProofData(attestation);
      setUserProgress(prev => ({ ...prev, zkProofGenerated: true }));
      toast({
        title: "证明生成完成",
        description: "ZK 证明已生成，开始验证。"
      });

      // 自动进入下一步
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
        title: "生成失败",
        description: "证明生成失败，请重试。",
        variant: "destructive"
      });
      setIsLoading(false);
      setCurrentStep('');
    }
  };

  const handleVerifyProof = async (attestation: any) => {
    setCurrentStep('验证证明中...');
    try {
      if (!primusZKTLS) {
        throw new Error('Primus ZKTLS not initialized');
      }

      // 验证证明
      const verifyResult = await primusZKTLS.verifyAttestation(attestation);
      console.log("verifyResult=", verifyResult);

      if (!verifyResult) {
        throw new Error('Proof verification failed');
      }

      setUserProgress(prev => ({ ...prev, proofVerified: true }));
      toast({
        title: "证明验证通过",
        description: "证明验证成功，可以提交领取奖励。"
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
        title: "验证失败",
        description: "证明验证失败，请重试。",
        variant: "destructive"
      });
    }
    setIsLoading(false);
    setCurrentStep('');
  };

  const handleClaimReward = async () => {
    setCurrentStep('领取奖励中...');
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

      // 更新步骤状态为等待交易确认
      setCurrentStep('等待交易确认...');
      
      toast({
        title: "交易已提交",
        description: `交易已提交到区块链，等待确认中... 交易哈希: ${txHash.slice(0, 10)}...`,
        duration: 3000
      });

      // 等待交易被确认
      if (window.ethereum) {
        try {
          const receipt = await window.ethereum.request({
            method: 'eth_waitForTransactionReceipt',
            params: [txHash]
          });
          
          if (receipt && receipt.status === '0x1') {
            // 交易成功确认
            setUserProgress(prev => ({ ...prev, rewardClaimed: true }));
            toast({
              title: "奖励领取成功！",
              description: `恭喜！您已成功领取 ${formatReward()} 奖励。交易已确认！`,
              duration: 5000
            });
          } else {
            throw new Error('交易失败或被回滚');
          }
        } catch (waitError) {
          console.warn('等待交易确认时出错，使用轮询方式:', waitError);
          // 降级到轮询方式
          await waitForTransactionConfirmation(txHash);
        }
      } else {
        // 如果没有 window.ethereum 或不支持 eth_waitForTransactionReceipt，使用轮询方式
        await waitForTransactionConfirmation(txHash);
      }

      // 等待一段时间后重新获取数据
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('Claim reward error:', error);
      const errorMessage = parseContractError(error);
      toast({
        title: "领取失败",
        description: errorMessage,
        variant: "destructive"
      });
    }
    setIsLoading(false);
    setCurrentStep('');
  };

  // 解析合约错误信息
  const parseContractError = (error: any): string => {
    console.log('Parsing contract error:', error);
    
    // 检查错误消息中是否包含合约错误
    const errorMessage = error?.message || error?.reason || error?.data?.message || '';
    
    // 定义合约错误映射
    const contractErrors = {
      'QuestSystem__QuoteTweetAlreadyUsed': '该推特已被其他用户使用，请使用不同的推特链接',
      'QuestSystem__UserAlreadyParticipated': '您已经参与过此任务，无法重复参与',
      'QuestSystem__QuestNotActive': '任务当前不可用或已结束',
      'QuestSystem__QuestFull': '任务参与人数已满',
      'QuestSystem__InvalidProof': '证明无效，请重新生成证明',
      'QuestSystem__ProofExpired': '证明已过期，请重新生成证明',
      'QuestSystem__InvalidAttestation': '无效的证明数据',
      'QuestSystem__InsufficientFunds': '合约余额不足，请联系管理员',
      'QuestSystem__QuestEnded': '任务已结束，无法继续参与',
      'QuestSystem__InvalidQuestId': '无效的任务ID',
    };
    
    // 检查是否包含特定的合约错误
    for (const [contractError, userMessage] of Object.entries(contractErrors)) {
      if (errorMessage.includes(contractError)) {
        return userMessage;
      }
    }
    
    // 检查其他常见错误
    if (errorMessage.includes('User denied transaction') || errorMessage.includes('user rejected')) {
      return '用户取消了交易';
    }
    
    if (errorMessage.includes('insufficient funds')) {
      return '账户余额不足，请确保有足够的 ETH 支付 Gas 费用';
    }
    
    if (errorMessage.includes('gas')) {
      return 'Gas 费用不足或 Gas 限制过低';
    }
    
    if (errorMessage.includes('nonce')) {
      return '交易 nonce 错误，请重试';
    }
    
    if (errorMessage.includes('reverted')) {
      return '交易被回滚，请检查交易条件';
    }
    
    // 如果没有匹配的错误，返回通用错误信息
    return errorMessage || '奖励领取失败，请重试';
  };

  // 轮询等待交易确认的辅助函数
  const waitForTransactionConfirmation = async (txHash: string) => {
    const maxAttempts = 30; // 最多等待30次，每次3秒
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const receipt = await window.ethereum?.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash]
        });
        
        if (receipt) {
          if (receipt.status === '0x1') {
            // 交易成功确认
            setUserProgress(prev => ({ ...prev, rewardClaimed: true }));
            toast({
              title: "奖励领取成功！",
              description: `恭喜！您已成功领取 ${formatReward()} 奖励。交易已确认！`,
              duration: 5000
            });
            return;
          } else {
            throw new Error('交易失败或被回滚');
          }
        }
        
        // 等待3秒后重试
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;
        
        // 更新等待状态
        setCurrentStep(`等待交易确认... (${attempts}/${maxAttempts})`);
      } catch (error) {
        console.error('检查交易状态时出错:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // 如果超时仍未确认，显示警告但不算失败
    toast({
      title: "交易确认超时",
      description: "交易可能仍在处理中，请稍后检查您的余额。",
      variant: "destructive"
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Quest link copied to clipboard!"
    });
  };

  const getParticipantStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-[hsl(var(--vibrant-green))]/15 text-[hsl(var(--vibrant-green))]">Completed</Badge>;
      case 'submitted':
        return <Badge className="bg-[hsl(var(--vibrant-yellow))]/15 text-[hsl(var(--vibrant-yellow))]">Submitted</Badge>;
      default:
        return <Badge variant="outline">Joined</Badge>;
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
                Back to Quests
              </Button>
              <Button
                variant="ghost"
                onClick={handleShare}
                className="text-white hover:bg-white/20 border border-white/20"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
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
                  {quest.status}
                </Badge>
                <div className="text-white/80 text-sm">
                  {getTimeRemaining()} remaining
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
                Reward
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold mb-1">{formatReward()}</div>
              <div className="text-white/80 text-xs">{quest.reward.distribution}</div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Users className="h-4 w-4" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold mb-1">
                {quest.participants.current}/{quest.participants.max}
              </div>
              <Progress value={getProgressPercentage()} className="mb-1 bg-white/20 [&>div]:bg-white h-2" />
              <div className="text-white/80 text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getTimeRemaining()} left
              </div>
            </CardContent>
          </Card>

          {/* Quest Type Card */}
          <Card className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] text-white border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                {getQuestTypeIcon()}
                Type
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-base font-bold mb-1">{getQuestTypeLabel()}</div>
              <div className="text-white/80 text-xs">
                {quest.questType === 'twitter-interaction' ? 'Engage with tweet' : 'Share with quote'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quest Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {quest.fullDescription}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Quest Type</h4>
                        <div className="flex items-center gap-2">
                          {getQuestTypeIcon()}
                          <span className="text-sm">{getQuestTypeLabel()}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Category</h4>
                        <Badge variant="outline">{quest.category}</Badge>
                      </div>
                    </div>

                    {quest.questType === 'twitter-interaction' && (
                      <div>
                        <h4 className="font-semibold mb-2">Required Actions</h4>
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
                            <h5 className="font-medium mb-1 text-sm">Target Tweet</h5>
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
                        <h4 className="font-semibold mb-2">Quote Tweet Requirements</h4>
                        {quest.launch_page && (
                          <div className="mb-3">
                            <h5 className="font-medium mb-1 text-sm">Original Tweet to Quote</h5>
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
                            <span className="text-sm">Required hashtag: </span>
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
                    <CardTitle>Quest Participants ({participants.length})</CardTitle>
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
                                Joined {participant.joinedAt.toLocaleDateString()}
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
                <CardTitle>How to Participate</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* 已参与提示 */}
                  {hasAlreadyParticipated && (
                    <div className="text-center p-4 bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] text-white rounded-lg mb-4">
                      <div className="text-lg font-bold">✅ 您已参与此活动</div>
                      <div className="text-white/80 text-sm">奖励已成功领取</div>
                    </div>
                  )}

                  {/* 奖励信息 */}
                  <div className="text-center p-4 bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white rounded-lg">
                    <div className="text-xl font-bold">{formatReward()}</div>
                    <div className="text-white/80 text-sm">Reward per participant</div>
                  </div>

                  {/* 当前状态 */}
                  {isLoading && currentStep && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm font-medium">{currentStep}</div>
                    </div>
                  )}

                  {/* 如果已参与活动，隐藏所有步骤 */}
                  {!hasAlreadyParticipated && (
                    <>
                      {/* 步骤 1: 连接钱包 */}
                      <div className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${userProgress.walletConnected
                          ? 'bg-[hsl(var(--vibrant-green))] text-white'
                          : 'bg-muted text-muted-foreground'
                          }`}>
                          {userProgress.walletConnected ? <CheckCircle className="h-3 w-3" /> : '1'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">连接钱包</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            连接您的 Web3 钱包以开始参与任务
                          </p>
                          {!isConnected ? (
                            <Button onClick={handleConnectWallet} disabled={isLoading} size="sm" className="w-full">
                              <Wallet className="h-3 w-3 mr-1" />
                              连接钱包
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
                            <h4 className="font-semibold text-sm mb-1">Quote Tweet URL</h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              First, quote tweet the target tweet, then paste your quote tweet URL here
                            </p>
                            <div className="mb-2">
                              <a
                                href={quest.launch_page}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline block mb-2"
                              >
                                📝 Quote this tweet: {quest.launch_page}
                              </a>
                            </div>
                            <input
                              type="text"
                              placeholder="https://twitter.com/your_username/status/123..."
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

                      {/* 步骤 3: 开始证明 */}
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
                          <h4 className="font-semibold text-sm mb-1">开始证明</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            获取 ZK 签名并启动证明流程
                          </p>
                          {zkInitializing && (
                            <div className="text-xs text-blue-500 mb-2">
                              ⏳ ZKTLS 系统初始化中...
                            </div>
                          )}
                          {isConnected && !userProgress.zkProofStarted && (quest.questType !== 'quote-tweet' || (quoteTweetUrl && !quoteTweetUrlError)) ? (
                            <Button onClick={handleStartProof} disabled={isLoading || !zkInitialized} size="sm" className="w-full">
                              {isLoading && currentStep.includes('ZK') ? '启动中...' : !zkInitialized ? 'ZKTLS 初始化中...' : '开始证明'}
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      {/* 步骤 4: 生成证明 */}
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
                          <h4 className="font-semibold text-sm mb-1">生成证明</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            调用 Primus 生成 ZK 证明
                          </p>
                          {userProgress.zkProofStarted && !userProgress.zkProofGenerated && isLoading && (
                            <div className="text-xs text-muted-foreground">正在生成证明...</div>
                          )}
                        </div>
                      </div>

                      {/* 步骤 5: 验证证明 */}
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
                          <h4 className="font-semibold text-sm mb-1">验证证明</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            检查证明的有效性
                          </p>
                          {userProgress.zkProofGenerated && !userProgress.proofVerified && isLoading && (
                            <div className="text-xs text-muted-foreground">正在验证证明...</div>
                          )}
                        </div>
                      </div>

                      {/* 步骤 6: 提交奖励 */}
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
                          <h4 className="font-semibold text-sm mb-1">领取奖励</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            提交证明并领取任务奖励
                          </p>
                          {userProgress.proofVerified && !userProgress.rewardClaimed ? (
                            <Button onClick={handleClaimReward} disabled={isLoading} size="sm" className="w-full">
                              {isLoading ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Trophy className="h-3 w-3 mr-1" />
                              )}
                              {isLoading 
                                ? (currentStep.includes('等待交易确认') ? '等待确认...' : '领取中...') 
                                : '领取奖励'
                              }
                            </Button>
                          ) : userProgress.rewardClaimed ? (
                            <div className="text-xs text-[hsl(var(--vibrant-green))] font-medium">
                              🎉 奖励已成功领取！
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