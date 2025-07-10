import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Copy, 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Plus, 
  List, 
  LogOut,
  DollarSign,
  Calendar,
  ExternalLink,
  Gift,
  Activity,
  Eye,
  User,
  Settings,
  Wallet
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-quests");
  const [questTab, setQuestTab] = useState("active");

  const walletAddress = "0x1234567890123456789012345678901234567890";
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address copied!",
      description: "Wallet address has been copied to clipboard.",
    });
  };

  const mockStats = {
    totalEarned: "2.45 ETH",
    questsCompleted: 42,
    questsCreated: 8,
    successRate: 95.2
  };

  const mockActiveQuests = [
    {
      id: 1,
      title: "DeFi Protocol Quest",
      description: "Follow @DeFiProtocol and retweet their latest announcement",
      reward: "0.1 ETH",
      participants: "245/500",
      progress: 49,
      status: "active",
      timeLeft: "3 days left"
    },
    {
      id: 2,
      title: "ZK Education Thread",
      description: "Create an educational Twitter thread explaining zero-knowledge proofs",
      reward: "50 USDC",
      participants: "89/100",
      progress: 89,
      status: "active",
      timeLeft: "1 day left"
    }
  ];

  const mockCompletedQuests = [
    {
      id: 3,
      title: "Discord Community",
      description: "Join the official Discord server and complete verification",
      reward: "NFT Badge",
      completedDate: "2024-01-15",
      status: "completed"
    },
    {
      id: 4,
      title: "Web3 Tutorial Series",
      description: "Complete the 5-part Web3 tutorial series",
      reward: "0.05 ETH",
      completedDate: "2024-01-10",
      status: "completed"
    }
  ];

  const mockCreatedQuests = [
    {
      id: 5,
      title: "My Custom Quest",
      description: "Share knowledge about blockchain development",
      reward: "100 USDC",
      participants: "67/200",
      progress: 33.5,
      status: "active"
    }
  ];

  const mockPendingRewards = [
    {
      id: 1,
      quest: "DeFi Protocol Quest",
      amount: "0.1 ETH",
      type: "ETH",
      claimable: true
    },
    {
      id: 2,
      quest: "ZK Education Thread",
      amount: "50 USDC",
      type: "USDC",
      claimable: true
    }
  ];

  const mockRewardHistory = [
    {
      id: 1,
      quest: "Discord Community",
      amount: "NFT Badge",
      type: "NFT",
      date: "2024-01-15",
      txHash: "0xabcd...1234"
    },
    {
      id: 2,
      quest: "Web3 Tutorial Series",
      amount: "0.05 ETH",
      type: "ETH",
      date: "2024-01-10",
      txHash: "0xefgh...5678"
    }
  ];

  const mockVestingRewards = [
    {
      id: 1,
      quest: "Long-term Staking Quest",
      totalAmount: "1.0 ETH",
      vestedAmount: "0.3 ETH",
      claimableAmount: "0.1 ETH",
      vestingProgress: 30,
      timeRemaining: "45 days"
    }
  ];

  const mockActivityFeed = [
    {
      id: 1,
      type: "quest_completed",
      description: "Completed 'Discord Community' quest",
      timestamp: "2 hours ago",
      icon: CheckCircle2
    },
    {
      id: 2,
      type: "reward_claimed",
      description: "Claimed 0.05 ETH reward",
      timestamp: "1 day ago",
      icon: DollarSign
    },
    {
      id: 3,
      type: "quest_joined",
      description: "Joined 'ZK Education Thread' quest",
      timestamp: "3 days ago",
      icon: Star
    }
  ];

  const claimReward = (rewardId: number) => {
    toast({
      title: "Reward claimed!",
      description: "Your reward has been successfully claimed.",
    });
  };

  const claimAllRewards = () => {
    toast({
      title: "All rewards claimed!",
      description: "All pending rewards have been successfully claimed.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Profile Header */}
        <div className="mb-8">
          {/* Wallet & Avatar Section */}
          <div className="bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl mb-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
            <div className="relative z-10 flex items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-white/20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                  {shortAddress.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">My Profile</h1>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyAddress}
                    className="bg-white/10 text-white hover:bg-white/20 border border-white/30"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {shortAddress}
                  </Button>
                </div>
                <p className="text-white/80 text-sm">ProofQuest Member since January 2024</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">{mockStats.totalEarned}</div>
                  <div className="text-xs text-white/80">Total Earned</div>
                </div>
                <DollarSign className="h-5 w-5 text-white/60" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">{mockStats.questsCompleted}</div>
                  <div className="text-xs text-white/80">Completed</div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-white/60" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">{mockStats.questsCreated}</div>
                  <div className="text-xs text-white/80">Created</div>
                </div>
                <Plus className="h-5 w-5 text-white/60" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-red))] to-[hsl(var(--vibrant-pink))] rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">{mockStats.successRate}%</div>
                  <div className="text-xs text-white/80">Success Rate</div>
                </div>
                <TrendingUp className="h-5 w-5 text-white/60" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="my-quests">My Quests</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* My Quests Tab */}
              <TabsContent value="my-quests">
                <Card>
                  <CardHeader>
                    <CardTitle>My Quests</CardTitle>
                    <CardDescription>Track your quest participation and progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={questTab} onValueChange={setQuestTab}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="active">Active ({mockActiveQuests.length})</TabsTrigger>
                        <TabsTrigger value="completed">Completed ({mockCompletedQuests.length})</TabsTrigger>
                        <TabsTrigger value="created">Created ({mockCreatedQuests.length})</TabsTrigger>
                      </TabsList>

                      <TabsContent value="active" className="space-y-4">
                        {mockActiveQuests.map((quest) => (
                          <div key={quest.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{quest.title}</h4>
                                <p className="text-sm text-muted-foreground">{quest.description}</p>
                              </div>
                              <Badge className="bg-[hsl(var(--vibrant-blue))]/15 text-[hsl(var(--vibrant-blue))]">
                                Active
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-[hsl(var(--vibrant-green))]">{quest.reward}</span>
                              <span className="text-muted-foreground">{quest.participants}</span>
                              <span className="text-muted-foreground">{quest.timeLeft}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] h-2 rounded-full transition-all"
                                style={{ width: `${quest.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="completed" className="space-y-4">
                        {mockCompletedQuests.map((quest) => (
                          <div key={quest.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{quest.title}</h4>
                                <p className="text-sm text-muted-foreground">{quest.description}</p>
                              </div>
                              <Badge className="bg-[hsl(var(--vibrant-green))]/15 text-[hsl(var(--vibrant-green))]">
                                Completed
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-[hsl(var(--vibrant-green))]">{quest.reward}</span>
                              <span className="text-muted-foreground">Completed on {quest.completedDate}</span>
                            </div>
                          </div>
                        ))}
                      </TabsContent>

                      <TabsContent value="created" className="space-y-4">
                        {mockCreatedQuests.map((quest) => (
                          <div key={quest.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{quest.title}</h4>
                                <p className="text-sm text-muted-foreground">{quest.description}</p>
                              </div>
                              <Badge className="bg-[hsl(var(--vibrant-orange))]/15 text-[hsl(var(--vibrant-orange))]">
                                Created
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-[hsl(var(--vibrant-green))]">{quest.reward}</span>
                              <span className="text-muted-foreground">{quest.participants}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] h-2 rounded-full transition-all"
                                style={{ width: `${quest.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rewards Tab */}
              <TabsContent value="rewards" className="space-y-6">
                {/* Pending Rewards */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Pending Rewards</CardTitle>
                      <CardDescription>Claimable rewards from completed quests</CardDescription>
                    </div>
                    <Button onClick={claimAllRewards} className="bg-[hsl(var(--vibrant-green))] hover:bg-[hsl(var(--vibrant-green))]/90">
                      <Gift className="h-4 w-4 mr-2" />
                      Claim All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockPendingRewards.map((reward) => (
                        <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{reward.quest}</div>
                            <div className="text-sm text-muted-foreground">{reward.amount}</div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => claimReward(reward.id)}
                            className="bg-[hsl(var(--vibrant-blue))] hover:bg-[hsl(var(--vibrant-blue))]/90"
                          >
                            Claim
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Vesting Rewards */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vesting Rewards</CardTitle>
                    <CardDescription>Long-term rewards with linear vesting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockVestingRewards.map((vesting) => (
                        <div key={vesting.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{vesting.quest}</div>
                              <div className="text-sm text-muted-foreground">
                                {vesting.vestedAmount} / {vesting.totalAmount} vested
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-[hsl(var(--vibrant-green))]">
                                {vesting.claimableAmount} claimable
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vesting.timeRemaining} remaining
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] h-2 rounded-full transition-all"
                              style={{ width: `${vesting.vestingProgress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Reward History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Reward History</CardTitle>
                    <CardDescription>Previous rewards and transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockRewardHistory.map((reward) => (
                        <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{reward.quest}</div>
                            <div className="text-sm text-muted-foreground">{reward.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{reward.amount}</div>
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-[hsl(var(--vibrant-blue))]">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {reward.txHash}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Timeline</CardTitle>
                    <CardDescription>Your recent activity on ProofQuest</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockActivityFeed.map((activity) => {
                        const IconComponent = activity.icon;
                        return (
                          <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="p-2 bg-[hsl(var(--vibrant-blue))]/10 rounded-full">
                              <IconComponent className="h-4 w-4 text-[hsl(var(--vibrant-blue))]" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{activity.description}</div>
                              <div className="text-sm text-muted-foreground">{activity.timestamp}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Quick Actions Panel */}
          <div className="col-span-12 lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/create">
                  <Button className="w-full bg-[hsl(var(--vibrant-green))] hover:bg-[hsl(var(--vibrant-green))]/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Quest
                  </Button>
                </Link>
                <Link to="/quests">
                  <Button variant="outline" className="w-full">
                    <List className="h-4 w-4 mr-2" />
                    View All Quests
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;