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
  Twitter
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
    type: 'ETH' | 'USDC' | 'NFT';
    distribution: 'Pool' | 'Per participant';
  };
  status: 'Active' | 'Claiming' | 'Cancelled' | 'Paused' | 'Completed';
  participants: {
    current: number;
    max: number;
  };
  deadline: Date;
  requirements: string[];
  taskSteps: string[];
  taskType: 'twitter' | 'discord' | 'content';
  category: 'Social' | 'Content' | 'DeFi' | 'Gaming' | 'Education';
  createdAt: Date;
}

interface Participant {
  id: string;
  address: string;
  joinedAt: Date;
  status: 'joined' | 'submitted' | 'completed';
}

// Mock data
const getMockQuest = (id: string): QuestDetail => ({
  id,
  title: "Create educational thread about ZK proofs",
  description: "Share your knowledge about Zero-Knowledge proofs with the community through an engaging Twitter thread.",
  fullDescription: "We're looking for passionate community members to create educational content about Zero-Knowledge proofs. This quest aims to spread awareness and understanding of ZK technology through accessible Twitter threads. Your thread should explain complex concepts in simple terms and engage your audience with examples and analogies.",
  creator: {
    name: "ZK Research",
    avatar: "",
    handle: "@zkresearch",
    address: "0x1234567890123456789012345678901234567890"
  },
  reward: {
    amount: 0.25,
    type: 'ETH',
    distribution: 'Per participant'
  },
  status: 'Active',
  participants: {
    current: 47,
    max: 100
  },
  deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
  requirements: [
    "Have at least 100 Twitter followers",
    "Thread must contain minimum 8 tweets",
    "Include @zkresearch mention",
    "Use hashtag #ZKEducation",
    "Original content only"
  ],
  taskSteps: [
    "Connect your wallet to verify eligibility",
    "Plan your ZK proof educational thread (8+ tweets)",
    "Create and publish the thread on Twitter",
    "Submit your thread link for verification"
  ],
  taskType: 'twitter',
  category: 'Education',
  createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
});

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

  const getTaskIcon = () => {
    switch (quest.taskType) {
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'discord':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
          <div className="px-6 py-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <h1 className="text-4xl font-bold text-white mb-4">{quest.title}</h1>
                <p className="text-white/90 text-lg mb-6">{quest.description}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12 border-2 border-white/20">
                    <AvatarImage src={quest.creator.avatar} />
                    <AvatarFallback className="bg-white/20 text-white">
                      {quest.creator.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-semibold">{quest.creator.name}</div>
                    <div className="text-white/70 text-sm">{quest.creator.handle}</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <Badge className={`text-sm ${getStatusBadgeColor(quest.status)} mb-4`}>
                  {quest.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        {/* Overview Cards - Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Reward Card */}
          <Card className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5" />
                Reward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{formatReward()}</div>
              <div className="text-white/80 text-sm">{quest.reward.distribution}</div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {quest.participants.current}/{quest.participants.max}
              </div>
              <Progress value={getProgressPercentage()} className="mb-2 bg-white/20 [&>div]:bg-white" />
              <div className="text-white/80 text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getTimeRemaining()} left
              </div>
            </CardContent>
          </Card>

          {/* Requirements Card */}
          <Card className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{quest.requirements.length}</div>
              <div className="text-white/80 text-sm">Criteria to meet</div>
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

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Full Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {quest.fullDescription}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Task Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quest.taskSteps.map((step, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="text-muted-foreground">{step}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quest.requirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-[hsl(var(--vibrant-green))]" />
                          <span className="text-sm">{req}</span>
                        </div>
                      ))}
                    </div>
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
                              {getTaskIcon()}
                              <span>Create and publish your Twitter thread</span>
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
                          Submit the link to your Twitter thread for verification.
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