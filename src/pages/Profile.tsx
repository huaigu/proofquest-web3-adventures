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
import { useAccount } from "wagmi";
import { useProfile, formatEthAmount, formatUserAddress, formatDate, formatTimeAgo, getActivityIcon } from "@/hooks/useProfile";
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation('profile');
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-quests");
  const [questTab, setQuestTab] = useState("active");
  
  const { address, isConnected } = useAccount();
  const { data: profileData, isLoading, error } = useProfile(address);
  
  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('wallet.connectPrompt')}</h2>
          <p className="text-muted-foreground mb-4">{t('wallet.connectDescription')}</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--vibrant-blue))] mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loading.profile')}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{t('error.failedToLoad')}</p>
          <Button onClick={() => window.location.reload()}>{t('error.retry')}</Button>
        </div>
      </div>
    );
  }

  const walletAddress = address!;
  const shortAddress = formatUserAddress(walletAddress);
  const profile = profileData?.profile;
  const quests = profileData?.quests;
  const rewards = profileData?.rewards;
  const activity = profileData?.activity;

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: t('notifications.addressCopied'),
      description: t('notifications.addressCopiedDescription'),
    });
  };


  const claimReward = (rewardId: number) => {
    toast({
      title: t('notifications.rewardClaimed'),
      description: t('notifications.rewardClaimedDescription'),
    });
  };

  const claimAllRewards = () => {
    toast({
      title: t('notifications.allRewardsClaimed'),
      description: t('notifications.allRewardsClaimedDescription'),
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
                  <h1 className="text-2xl font-bold">{t('header.title')}</h1>
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
                <p className="text-white/80 text-sm">{t('header.memberSince', { date: profile?.joinDate ? formatDate(profile.joinDate) : 'Unknown' })}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">{profile?.totalEarned ? formatEthAmount(profile.totalEarned) : '0 MON'}</div>
                  <div className="text-xs text-white/80">{t('stats.totalEarned')}</div>
                </div>
                <DollarSign className="h-5 w-5 text-white/60" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">{profile?.questsCompleted || 0}</div>
                  <div className="text-xs text-white/80">{t('stats.completed')}</div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-white/60" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">{profile?.questsCreated || 0}</div>
                  <div className="text-xs text-white/80">{t('stats.created')}</div>
                </div>
                <Plus className="h-5 w-5 text-white/60" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-red))] to-[hsl(var(--vibrant-pink))] rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">{profile?.successRate ? `${profile.successRate}%` : '0%'}</div>
                  <div className="text-xs text-white/80">{t('stats.successRate')}</div>
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
                <TabsTrigger value="my-quests">{t('tabs.myQuests')}</TabsTrigger>
                <TabsTrigger value="rewards">{t('tabs.rewards')}</TabsTrigger>
                <TabsTrigger value="activity">{t('tabs.activity')}</TabsTrigger>
              </TabsList>

              {/* My Quests Tab */}
              <TabsContent value="my-quests">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('quests.title')}</CardTitle>
                    <CardDescription>{t('quests.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={questTab} onValueChange={setQuestTab}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="active">{t('quests.tabs.active')} ({quests?.active?.length || 0})</TabsTrigger>
                        <TabsTrigger value="completed">{t('quests.tabs.completed')} ({quests?.completed?.length || 0})</TabsTrigger>
                        <TabsTrigger value="created">{t('quests.tabs.created')} ({quests?.created?.length || 0})</TabsTrigger>
                      </TabsList>

                      <TabsContent value="active" className="space-y-4">
                        {quests?.active && quests.active.length > 0 ? quests.active.map((quest) => (
                          <Link key={quest.id} to={`/quest/${quest.id}`}>
                            <div className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors cursor-pointer">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{quest.title}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{quest.description}</p>
                                </div>
                                <Badge className="bg-[hsl(var(--vibrant-blue))]/15 text-[hsl(var(--vibrant-blue))]">
                                  {quest.status === 'active' ? t('quests.status.active') : quest.status}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-[hsl(var(--vibrant-green))]">{formatEthAmount(quest.rewardPerUser)}</span>
                                <span className="text-muted-foreground">{quest.participantCount}/{quest.maxParticipants}</span>
                                <span className="text-muted-foreground">{quest.timeRemaining}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] h-2 rounded-full transition-all"
                                  style={{ width: `${quest.participationPercentage}%` }}
                                />
                              </div>
                            </div>
                          </Link>
                        )) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>{t('quests.noActive')}</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="completed" className="space-y-4">
                        {quests?.completed && quests.completed.length > 0 ? quests.completed.map((quest) => (
                          <Link key={quest.id} to={`/quest/${quest.id}`}>
                            <div className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors cursor-pointer">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{quest.title}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{quest.description}</p>
                                </div>
                                <Badge className="bg-[hsl(var(--vibrant-green))]/15 text-[hsl(var(--vibrant-green))]">
                                  {t('quests.status.completed')}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-[hsl(var(--vibrant-green))]">{formatEthAmount(quest.rewardEarned)}</span>
                                <span className="text-muted-foreground">{t('quests.completedOn', { date: formatDate(quest.completedDate) })}</span>
                              </div>
                            </div>
                          </Link>
                        )) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>{t('quests.noCompleted')}</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="created" className="space-y-4">
                        {quests?.created && quests.created.length > 0 ? quests.created.map((quest) => (
                          <Link key={quest.id} to={`/quest/${quest.id}`}>
                            <div className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors cursor-pointer">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{quest.title}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{quest.description}</p>
                                </div>
                                <Badge className="bg-[hsl(var(--vibrant-orange))]/15 text-[hsl(var(--vibrant-orange))]">
                                  {quest.status}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-[hsl(var(--vibrant-green))]">{formatEthAmount(quest.totalRewards)}</span>
                                <span className="text-muted-foreground">{quest.participantCount}/{quest.maxParticipants} {t('quests.participants')}</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] h-2 rounded-full transition-all"
                                  style={{ width: `${quest.participationPercentage}%` }}
                                />
                              </div>
                            </div>
                          </Link>
                        )) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>{t('quests.noCreated')}</p>
                          </div>
                        )}
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
                      <CardTitle>{t('rewards.pending.title')}</CardTitle>
                      <CardDescription>{t('rewards.pending.description')}</CardDescription>
                    </div>
                    <Button onClick={claimAllRewards} className="bg-[hsl(var(--vibrant-green))] hover:bg-[hsl(var(--vibrant-green))]/90">
                      <Gift className="h-4 w-4 mr-2" />
                      {t('rewards.pending.claimAll')}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rewards?.pending && rewards.pending.length > 0 ? rewards.pending.map((reward, index) => (
                        <div key={`${reward.questId}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{reward.questTitle}</div>
                            <div className="text-sm text-muted-foreground">{formatEthAmount(reward.amount)}</div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => claimReward(parseInt(reward.questId))}
                            disabled={!reward.claimable}
                            className="bg-[hsl(var(--vibrant-blue))] hover:bg-[hsl(var(--vibrant-blue))]/90 disabled:opacity-50"
                          >
                            {reward.claimable ? t('rewards.pending.claim') : t('rewards.pending.pending')}
                          </Button>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>{t('rewards.pending.noPending')}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Vesting Rewards */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('rewards.vesting.title')}</CardTitle>
                    <CardDescription>{t('rewards.vesting.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {rewards?.vesting && rewards.vesting.length > 0 ? rewards.vesting.map((vesting, index) => (
                        <div key={`${vesting.questId}-${index}`} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{vesting.questTitle}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatEthAmount(vesting.vestedAmount)} / {formatEthAmount(vesting.totalAmount)} {t('rewards.vesting.vested')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-[hsl(var(--vibrant-green))]">
                                {formatEthAmount(vesting.claimableAmount)} {t('rewards.vesting.claimable')}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vesting.timeRemaining} {t('rewards.vesting.remaining')}
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
                      )) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>{t('rewards.vesting.noVesting')}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Reward History */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('rewards.history.title')}</CardTitle>
                    <CardDescription>{t('rewards.history.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rewards?.history && rewards.history.length > 0 ? rewards.history.map((reward, index) => (
                        <div key={`${reward.questId}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{reward.questTitle}</div>
                            <div className="text-sm text-muted-foreground">{formatDate(reward.date)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatEthAmount(reward.amount)}</div>
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-[hsl(var(--vibrant-blue))]">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {reward.txHash.slice(0, 8)}...{reward.txHash.slice(-6)}
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>{t('rewards.history.noHistory')}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('activity.title')}</CardTitle>
                    <CardDescription>{t('activity.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activity && activity.length > 0 ? activity.map((activityItem, index) => {
                        const iconName = getActivityIcon(activityItem.type);
                        const IconComponent = iconName === 'CheckCircle2' ? CheckCircle2 : iconName === 'Plus' ? Plus : Activity;
                        return (
                          <div key={`${activityItem.type}-${index}`} className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="p-2 bg-[hsl(var(--vibrant-blue))]/10 rounded-full">
                              <IconComponent className="h-4 w-4 text-[hsl(var(--vibrant-blue))]" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{activityItem.description}</div>
                              <div className="text-sm text-muted-foreground">{formatTimeAgo(activityItem.timestamp)}</div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>{t('activity.noActivity')}</p>
                        </div>
                      )}
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
                <CardTitle>{t('quickActions.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/create">
                  <Button className="w-full bg-[hsl(var(--vibrant-green))] hover:bg-[hsl(var(--vibrant-green))]/90">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('quickActions.createQuest')}
                  </Button>
                </Link>
                <Link to="/quests">
                  <Button variant="outline" className="w-full">
                    <List className="h-4 w-4 mr-2" />
                    {t('quickActions.viewAllQuests')}
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('quickActions.accountSettings')}
                </Button>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('quickActions.disconnectWallet')}
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