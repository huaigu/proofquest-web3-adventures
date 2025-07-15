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
  Hash
} from "lucide-react";

// Mock quest data type
interface QuestDetail {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
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
  
  const [quest, setQuest] = useState<QuestDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userProgress, setUserProgress] = useState({
    walletConnected: false,
    eligibilityChecked: false,
    tasksCompleted: false,
    proofSubmitted: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setQuest(getMockQuest(id));
      setParticipants(getMockParticipants());
    }
  }, [id]);

  if (!quest) {
    return <div>Loading...</div>;
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

  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsWalletConnected(true);
      setUserProgress(prev => ({ ...prev, walletConnected: true }));
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected."
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleEligibilityCheck = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUserProgress(prev => ({ ...prev, eligibilityChecked: true }));
      toast({
        title: "Eligibility Verified",
        description: "You meet all requirements for this quest!"
      });
    } catch (error) {
      toast({
        title: "Eligibility Check Failed", 
        description: "Unable to verify eligibility. Please try again.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleSubmitProof = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUserProgress(prev => ({ ...prev, proofSubmitted: true }));
      toast({
        title: "Proof Submitted",
        description: "Your proof has been submitted for review!"
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit proof. Please try again.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
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
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="participate">Participate</TabsTrigger>
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
                        {quest.questConfig.tweetUrl && (
                          <div className="mt-3">
                            <h5 className="font-medium mb-1 text-sm">Target Tweet</h5>
                            <a 
                              href={quest.questConfig.tweetUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-sm break-all"
                            >
                              {quest.questConfig.tweetUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {quest.questType === 'quote-tweet' && (
                      <div>
                        <h4 className="font-semibold mb-2">Quote Tweet Requirements</h4>
                        {quest.questConfig.quoteTweetUrl && (
                          <div className="mb-3">
                            <h5 className="font-medium mb-1 text-sm">Original Tweet to Quote</h5>
                            <a 
                              href={quest.questConfig.quoteTweetUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-sm break-all"
                            >
                              {quest.questConfig.quoteTweetUrl}
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

              <TabsContent value="participate" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Participation Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Step 1: Connect Wallet */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        userProgress.walletConnected 
                          ? 'bg-[hsl(var(--vibrant-green))] text-white' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {userProgress.walletConnected ? <CheckCircle className="h-4 w-4" /> : '1'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Connect Wallet</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Connect your Web3 wallet to verify your identity and track your progress.
                        </p>
                        {!userProgress.walletConnected && (
                          <Button onClick={handleConnectWallet} disabled={isLoading} size="sm">
                            <Wallet className="h-4 w-4 mr-2" />
                            {isLoading ? 'Connecting...' : 'Connect Wallet'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Step 2: Verify Eligibility */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        userProgress.eligibilityChecked 
                          ? 'bg-[hsl(var(--vibrant-green))] text-white' 
                          : userProgress.walletConnected 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {userProgress.eligibilityChecked ? <CheckCircle className="h-4 w-4" /> : '2'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Verify Eligibility</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          We'll check if you meet the quest requirements.
                        </p>
                        {userProgress.walletConnected && !userProgress.eligibilityChecked && (
                          <Button onClick={handleEligibilityCheck} disabled={isLoading} size="sm">
                            {isLoading ? 'Checking...' : 'Check Eligibility'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Step 3: Complete Tasks */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        userProgress.tasksCompleted 
                          ? 'bg-[hsl(var(--vibrant-green))] text-white' 
                          : userProgress.eligibilityChecked 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {userProgress.tasksCompleted ? <CheckCircle className="h-4 w-4" /> : '3'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Complete Tasks</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Follow the task requirements and create your educational thread.
                        </p>
                        {userProgress.eligibilityChecked && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              {getQuestTypeIcon()}
                              <span>
                                {quest.questType === 'twitter-interaction' 
                                  ? 'Complete the required Twitter interactions'
                                  : 'Create and publish your quote tweet'
                                }
                              </span>
                              <ExternalLink className="h-3 w-3" />
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setUserProgress(prev => ({ ...prev, tasksCompleted: true }))}
                            >
                              Mark as Completed
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 4: Submit Proof */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        userProgress.proofSubmitted 
                          ? 'bg-[hsl(var(--vibrant-green))] text-white' 
                          : userProgress.tasksCompleted 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {userProgress.proofSubmitted ? <CheckCircle className="h-4 w-4" /> : '4'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Submit Proof</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {quest.questType === 'twitter-interaction' 
                            ? 'Verify that you completed all required interactions.'
                            : 'Submit the link to your quote tweet for verification.'
                          }
                        </p>
                        {userProgress.tasksCompleted && !userProgress.proofSubmitted && (
                          <Button onClick={handleSubmitProof} disabled={isLoading} size="sm">
                            <Upload className="h-4 w-4 mr-2" />
                            {isLoading ? 'Submitting...' : 'Submit Proof'}
                          </Button>
                        )}
                      </div>
                    </div>
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

          {/* Action Section - Sidebar on desktop, sticky on mobile */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white border-0">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{formatReward()}</div>
                    <div className="text-white/80 text-sm">Reward per participant</div>
                  </div>
                  <Separator className="bg-white/20" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/80">Participants:</span>
                      <span>{quest.participants.current}/{quest.participants.max}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">Time left:</span>
                      <span>{getTimeRemaining()}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-white text-[hsl(var(--vibrant-blue))] hover:bg-white/90"
                    size="lg"
                    disabled={isLoading || quest.status !== 'Active'}
                  >
                    {userProgress.proofSubmitted 
                      ? 'Proof Submitted' 
                      : userProgress.walletConnected 
                        ? 'Continue Quest' 
                        : 'Start Quest'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile Sticky Action Button */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-background/80 backdrop-blur-lg border-t z-50">
          <Button 
            className="w-full bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white border-0 h-12 text-lg font-semibold shadow-xl"
            disabled={isLoading || quest.status !== 'Active'}
            onClick={() => {
              if (!userProgress.walletConnected) {
                handleConnectWallet();
              } else if (!userProgress.eligibilityChecked) {
                handleEligibilityCheck();
              } else if (!userProgress.proofSubmitted) {
                handleSubmitProof();
              }
            }}
          >
            {userProgress.proofSubmitted 
              ? 'Proof Submitted ✓' 
              : userProgress.tasksCompleted
                ? 'Submit Proof'
                : userProgress.eligibilityChecked
                  ? 'Complete Tasks'
                  : userProgress.walletConnected 
                    ? 'Check Eligibility' 
                    : 'Start Quest'
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestDetail;