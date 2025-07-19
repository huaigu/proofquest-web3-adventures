import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Filter, 
  SortDesc, 
  Twitter, 
  MessageSquare, 
  FileText,
  Clock,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Repeat2,
  Coins,
  RefreshCw,
  AlertCircle,
  Database,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuests } from "@/hooks/useQuests";
import type { QuestFilters, QuestListItem } from "@/types";
import { useTranslation } from 'react-i18next';

const QuestList = () => {
  const { t } = useTranslation(['quests', 'common']);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rewardTypeFilter, setRewardTypeFilter] = useState<string>("all");
  const [questTypeFilter, setQuestTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created-newest");
  const [rewardRange, setRewardRange] = useState<number[]>([0, 1]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const questsPerPage = 12;

  // Build filters for API call
  const apiFilters = useMemo((): QuestFilters => {
    const filters: QuestFilters = {};
    
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== "all") filters.status = [statusFilter as string];
    if (rewardTypeFilter !== "all") filters.rewardType = [rewardTypeFilter as string];
    if (questTypeFilter !== "all") filters.questType = [questTypeFilter as string];
    if (categoryFilter !== "all") filters.category = [categoryFilter];
    if (rewardRange[0] > 0 || rewardRange[1] < 1) {
      filters.rewardRange = [rewardRange[0], rewardRange[1]];
    }
    
    return filters;
  }, [searchQuery, statusFilter, rewardTypeFilter, questTypeFilter, categoryFilter, rewardRange]);

  // Fetch quests with backend integration
  const { 
    data: quests = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuests(apiFilters, {
    limit: questsPerPage * 5, // Load more for client-side pagination
    offset: 0,
    includeMockData: true
  });

  // Get active filters for display
  const activeFilters = useMemo(() => {
    const filters = [];
    if (statusFilter !== "all") filters.push({ key: "status", value: statusFilter });
    if (rewardTypeFilter !== "all") filters.push({ key: "rewardType", value: rewardTypeFilter });
    if (questTypeFilter !== "all") filters.push({ key: "questType", value: questTypeFilter });
    if (categoryFilter !== "all") filters.push({ key: "category", value: categoryFilter });
    if (rewardRange[0] > 0 || rewardRange[1] < 1) {
      filters.push({ key: "reward", value: `${rewardRange[0].toFixed(2)} - ${rewardRange[1].toFixed(2)} MON` });
    }
    return filters;
  }, [statusFilter, rewardTypeFilter, questTypeFilter, categoryFilter, rewardRange]);

  // Sort and paginate quests
  const sortedQuests = useMemo(() => {
    const sorted = [...quests];

    switch (sortBy) {
      case "created-newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "created-oldest":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "reward-highest":
        sorted.sort((a, b) => b.reward.amount - a.reward.amount);
        break;
      case "reward-lowest":
        sorted.sort((a, b) => a.reward.amount - b.reward.amount);
        break;
      case "participants-most":
        sorted.sort((a, b) => b.participants.current - a.participants.current);
        break;
      case "participants-least":
        sorted.sort((a, b) => a.participants.current - b.participants.current);
        break;
      default:
        break;
    }

    return sorted;
  }, [quests, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedQuests.length / questsPerPage);
  const paginatedQuests = sortedQuests.slice(
    (currentPage - 1) * questsPerPage,
    currentPage * questsPerPage
  );

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setRewardTypeFilter("all");
    setQuestTypeFilter("all");
    setCategoryFilter("all");
    setRewardRange([0, 1]);
    setCurrentPage(1);
  };

  const removeFilter = (filterKey: string) => {
    switch (filterKey) {
      case "status":
        setStatusFilter("all");
        break;
      case "rewardType":
        setRewardTypeFilter("all");
        break;
      case "questType":
        setQuestTypeFilter("all");
        break;
      case "category":
        setCategoryFilter("all");
        break;
      case "reward":
        setRewardRange([0, 1]);
        break;
    }
    setCurrentPage(1);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "claiming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "pending":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "ended":
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      case "cancelled":
      case "cancel":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getCardBackgroundStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-gradient-to-br from-green-500/5 to-green-500/10";
      case "claiming":
        return "bg-gradient-to-br from-blue-500/5 to-blue-500/10";
      case "pending":
        return "bg-gradient-to-br from-orange-500/5 to-orange-500/10";
      case "ended":
      case "completed":
        return "bg-gradient-to-br from-gray-500/5 to-gray-500/10";
      case "cancelled":
      case "cancel":
        return "bg-gradient-to-br from-red-500/5 to-red-500/10";
      case "paused":
        return "bg-gradient-to-br from-yellow-500/5 to-yellow-500/10";
      default:
        return "bg-gradient-to-br from-card/50 to-card/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return t('status.active');
      case "claiming":
        return t('status.claiming');
      case "pending":
        return t('status.pending');
      case "ended":
      case "completed":
        return t('status.ended');
      case "cancelled":
      case "cancel":
        return t('status.cancelled');
      case "paused":
        return t('status.paused');
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getQuestTypeText = (questType: string) => {
    switch (questType) {
      case "twitter-interaction":
      case "likeAndRetweet":
        return t('types.likeAndRetweet');
      case "quote-tweet":
      case "Quoted":
        return t('types.quoteTweet');
      case "send-tweet":
        return t('types.sendTweet');
      default:
        return questType;
    }
  };

  const getQuestTypeStyle = (questType: string) => {
    switch (questType) {
      case "twitter-interaction":
      case "likeAndRetweet":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      case "quote-tweet":
      case "Quoted":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50";
      case "send-tweet":
        return "bg-pink-500/20 text-pink-400 border-pink-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getQuestIcon = (questType: string) => {
    switch (questType) {
      case "twitter-interaction":
      case "likeAndRetweet":
        return <Twitter className="w-4 h-4" />;
      case "quote-tweet":
      case "Quoted":
        return <MessageSquare className="w-4 h-4" />;
      case "send-tweet":
        return <FileText className="w-4 h-4" />;
      default:
        return <Twitter className="w-4 h-4" />;
    }
  };

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case "MON":
        return <Coins className="w-4 h-4 text-blue-400" />;
      case "ERC20":
        return <Coins className="w-4 h-4 text-green-400" />;
      case "NFT":
        return <Coins className="w-4 h-4 text-purple-400" />;
      default:
        return <Coins className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] bg-clip-text text-transparent mb-2">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('description', { count: quests.length })}
            </p>
          </div>
          
          {/* Refresh Button */}
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t('common:refresh')}</span>
            </Button>
            {error && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{t('usingCachedData')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          {showSidebar && (
            <div className="lg:w-80 space-y-6">
              <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 border-border/50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {t('common:filter')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Search */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">{t('filters.search')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder={t('filters.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">{t('filters.status')}</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
                      <SelectItem value="active">{t('status.active')}</SelectItem>
                      <SelectItem value="claiming">{t('status.claiming')}</SelectItem>
                      <SelectItem value="pending">{t('status.pending')}</SelectItem>
                      <SelectItem value="ended">{t('status.ended')}</SelectItem>
                      <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
                      <SelectItem value="paused">{t('status.paused')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reward Type Filter */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">{t('filters.rewardType')}</label>
                  <Select value={rewardTypeFilter} onValueChange={setRewardTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                      <SelectItem value="MON">MON</SelectItem>
                      <SelectItem value="ERC20">ERC20 Tokens</SelectItem>
                      <SelectItem value="NFT">NFT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quest Type Filter */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">{t('filters.questType')}</label>
                  <Select value={questTypeFilter} onValueChange={setQuestTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                      <SelectItem value="twitter-interaction">{t('types.twitterInteraction')}</SelectItem>
                      <SelectItem value="likeAndRetweet">{t('types.likeAndRetweet')}</SelectItem>
                      <SelectItem value="quote-tweet">{t('types.quoteTweet')}</SelectItem>
                      <SelectItem value="Quoted">{t('types.quoteTweet')}</SelectItem>
                      <SelectItem value="send-tweet">{t('types.sendTweet')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">{t('filters.category')}</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filters.allCategories')}</SelectItem>
                      <SelectItem value="Social">{t('categories.social')}</SelectItem>
                      <SelectItem value="Content">{t('categories.content')}</SelectItem>
                      <SelectItem value="General">{t('categories.general')}</SelectItem>
                      <SelectItem value="DeFi">{t('categories.defi')}</SelectItem>
                      <SelectItem value="Gaming">{t('categories.gaming')}</SelectItem>
                      <SelectItem value="Education">{t('categories.education')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reward Range */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">
                    {t('filters.rewardRange')}: {rewardRange[0].toFixed(2)} - {rewardRange[1].toFixed(2)} MON
                  </label>
                  <Slider
                    value={rewardRange}
                    onValueChange={setRewardRange}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                {/* Clear Filters */}
                {activeFilters.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    {t('filters.clearAllFilters')}
                  </Button>
                )}
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                {!showSidebar && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSidebar(true)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {t('common:filter')}
                  </Button>
                )}
                
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px]">
                    <SortDesc className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created-newest">{t('sort.newestFirst')}</SelectItem>
                    <SelectItem value="created-oldest">{t('sort.oldestFirst')}</SelectItem>
                    <SelectItem value="reward-highest">{t('sort.highestReward')}</SelectItem>
                    <SelectItem value="reward-lowest">{t('sort.lowestReward')}</SelectItem>
                    <SelectItem value="participants-most">{t('sort.mostParticipants')}</SelectItem>
                    <SelectItem value="participants-least">{t('sort.leastParticipants')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {t('questsFound', { count: sortedQuests.length })}
                </span>
                {quests.some(q => (q as QuestListItem & { _source?: string })._source) && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                    <Database className="w-3 h-3 mr-1" />
                    {t('liveData')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground">{t('filters.activeFilters')}</span>
                {activeFilters.map((filter, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
                    onClick={() => removeFilter(filter.key)}
                  >
                    {filter.value}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && quests.length === 0 && (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-lg font-semibold mb-2">{t('connectionIssue')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('unableToLoadQuests')}
                </p>
                <Button onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('common:retry')}
                </Button>
              </Card>
            )}

            {/* Quest Grid */}
            {!isLoading && paginatedQuests.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                {paginatedQuests.map((quest) => {
                  const isMock = (quest as QuestListItem & { _source?: string })._source === 'mock';
                  
                  return (
                    <div key={quest.id} className="w-full max-w-lg mx-auto">
                      <div className="bg-gradient-to-br from-black-950 to-black-900 rounded-xl p-2 shadow-2xl border border-slate-850">
                        
                        {/* Bento Grid Layout */}
                        <div className="grid grid-cols-6 gap-2">
                          
                          {/* Title + Tags */}
                          <div className="col-span-6 bg-black rounded-xl p-3 border border-gray-800/50 text-white relative overflow-hidden">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${
                                quest.questType.includes('quote') ? 'bg-cyan-500/30 text-cyan-300 border-cyan-500/30' :
                                quest.questType.includes('like') ? 'bg-purple-500/30 text-purple-300 border-purple-500/30' :
                                'bg-pink-500/30 text-pink-300 border-pink-500/30'
                              }`}>
                                {getQuestTypeText(quest.questType)}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${
                                quest.status === 'active' ? 'bg-green-500/30 text-green-300 border-green-500/30' :
                                quest.status === 'claiming' ? 'bg-blue-500/30 text-blue-300 border-blue-500/30' :
                                quest.status === 'pending' ? 'bg-orange-500/30 text-orange-300 border-orange-500/30' :
                                quest.status === 'ended' || quest.status === 'completed' ? 'bg-gray-500/30 text-gray-300 border-gray-500/30' :
                                'bg-red-500/30 text-red-300 border-red-500/30'
                              }`}>
                                {getStatusText(quest.status)}
                              </span>
                            </div>
                            <h2 className="text-xl font-bold text-white leading-tight h-12 overflow-hidden">{quest.title}</h2>
                          </div>

                          {/* User Info */}
                          <div className="col-span-3 bg-black rounded-xl p-2.5 border border-gray-800/50 flex items-center gap-2.5">
                            <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {quest.creator.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1 text-white">
                              <div className="text-xs text-gray-400 mb-1 font-medium">{t('user')}</div>
                              <div className="text-sm font-medium truncate">{quest.creator.name}</div>
                            </div>
                          </div>

                          {/* Reward */}
                          <div className="col-span-3 bg-black rounded-xl p-2.5 border border-gray-800/50 flex flex-col justify-center items-end text-right">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Coins className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-400 font-medium">{t('reward')}</span>
                            </div>
                            <div className="text-lg font-bold text-white">{quest.reward.amount} {quest.reward.type}</div>
                          </div>

                          {/* Progress */}
                          <div className="col-span-4 bg-black rounded-xl p-3 border border-gray-800/50 flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-400">{t('progress')}</span>
                              <span className="text-lg font-bold text-white">
                                {quest.participants.max ? Math.round((quest.participants.current / quest.participants.max) * 100) : 0}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700/30 rounded-full h-2 mb-3">
                              <div 
                                className="bg-white h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${quest.participants.max ? Math.min((quest.participants.current / quest.participants.max) * 100, 100) : 0}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{quest.participants.current}{quest.participants.max && `/${quest.participants.max}`}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{quest.timeRemaining}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className={`col-span-2 ${isMock ? 'bg-gray-800/50 cursor-not-allowed border border-gray-700/50' : 'bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] cursor-pointer hover:scale-105'} rounded-lg p-1.5 flex flex-col items-center justify-center text-white transition-all duration-200 shadow-lg`}>
                            {isMock ? (
                              <>
                                <div className="w-1 h-1 bg-gray-400 rounded-full mb-0.5"></div>
                                <span className="text-xs font-medium text-center leading-tight text-gray-400">{t('mock')}</span>
                              </>
                            ) : (
                              <Link to={`/quest/${quest.id}`} className="flex items-center justify-center gap-1 h-full w-full">
                                <Eye className="w-3 h-3 text-white" />
                                <span className="text-sm font-medium text-white">{t('common:view')}</span>
                              </Link>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && paginatedQuests.length === 0 && !error && (
              <Card className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t('noQuestsFound')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('noQuestsMatchFilters')}
                </p>
                <Button onClick={clearFilters}>{t('clearFilters')}</Button>
              </Card>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('previous')}
                </Button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + Math.max(1, currentPage - 2);
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestList;