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
  Database
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuests } from "@/hooks/useQuests";
import type { QuestFilters, QuestListItem } from "@/types";

const QuestList = () => {
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
    if (statusFilter !== "all") filters.status = [statusFilter as any];
    if (rewardTypeFilter !== "all") filters.rewardType = [rewardTypeFilter as any];
    if (questTypeFilter !== "all") filters.questType = [questTypeFilter as any];
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
      filters.push({ key: "reward", value: `${rewardRange[0].toFixed(2)} - ${rewardRange[1].toFixed(2)} ETH` });
    }
    return filters;
  }, [statusFilter, rewardTypeFilter, questTypeFilter, categoryFilter, rewardRange]);

  // Sort and paginate quests
  const sortedQuests = useMemo(() => {
    let sorted = [...quests];

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
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/50";
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
      case "ETH":
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
              Explore Quests
            </h1>
            <p className="text-muted-foreground">
              Complete Web2 tasks, earn Web3 rewards. {quests.length} quests available.
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
              <span>Refresh</span>
            </Button>
            {error && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Using cached data</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          {showSidebar && (
            <div className="lg:w-80 space-y-6">
              <Card className="p-6 bg-gradient-to-br from-card/50 to-card/30 border-border/50 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
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
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search quests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="claiming">Claiming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reward Type Filter */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Reward Type</label>
                  <Select value={rewardTypeFilter} onValueChange={setRewardTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="ERC20">ERC20 Tokens</SelectItem>
                      <SelectItem value="NFT">NFT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quest Type Filter */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Quest Type</label>
                  <Select value={questTypeFilter} onValueChange={setQuestTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="twitter-interaction">Twitter Interaction</SelectItem>
                      <SelectItem value="likeAndRetweet">Like & Retweet</SelectItem>
                      <SelectItem value="quote-tweet">Quote Tweet</SelectItem>
                      <SelectItem value="Quoted">Quoted</SelectItem>
                      <SelectItem value="send-tweet">Send Tweet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Content">Content</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="DeFi">DeFi</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reward Range */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm font-medium">
                    Reward Range: {rewardRange[0].toFixed(2)} - {rewardRange[1].toFixed(2)} ETH
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
                    Clear All Filters
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
                    Filters
                  </Button>
                )}
                
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px]">
                    <SortDesc className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created-newest">Newest First</SelectItem>
                    <SelectItem value="created-oldest">Oldest First</SelectItem>
                    <SelectItem value="reward-highest">Highest Reward</SelectItem>
                    <SelectItem value="reward-lowest">Lowest Reward</SelectItem>
                    <SelectItem value="participants-most">Most Participants</SelectItem>
                    <SelectItem value="participants-least">Least Participants</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {sortedQuests.length} quests found
                </span>
                {quests.some(q => (q as any)._source) && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                    <Database className="w-3 h-3 mr-1" />
                    Live Data
                  </Badge>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Active filters:</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                <h3 className="text-lg font-semibold mb-2">Connection Issue</h3>
                <p className="text-muted-foreground mb-4">
                  Unable to load quests from the server. Please check your connection and try again.
                </p>
                <Button onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </Card>
            )}

            {/* Quest Grid */}
            {!isLoading && paginatedQuests.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedQuests.map((quest) => {
                  const isMock = (quest as any)._source === 'mock';
                  
                  if (isMock) {
                    return (
                      <div key={quest.id}>
                        <Card className="h-full transition-all duration-200 bg-gradient-to-br from-card/50 to-card/30 border-border/50 backdrop-blur group opacity-75 cursor-not-allowed">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2 transition-colors line-clamp-2 text-muted-foreground">
                                {quest.title}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={quest.creator.avatar} />
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white">
                                    {quest.creator.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{quest.creator.name}</span>
                                <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/50">
                                  Mock
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Badge variant="outline" className={getStatusBadgeStyle(quest.status)}>
                                {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
                              </Badge>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                {getQuestIcon(quest.questType)}
                                <span>{quest.category}</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="py-3">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getRewardIcon(quest.reward.type)}
                              <span className="font-semibold text-[hsl(var(--vibrant-blue))]">
                                {quest.reward.amount} {quest.reward.type}
                              </span>
                              {quest.reward.type !== 'ETH' && (
                                <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                                  Coming Soon
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>
                                {quest.participants.current}
                                {quest.participants.max && `/${quest.participants.max}`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{quest.timeRemaining}</span>
                            </div>
                          </div>

                          {quest.participants.max && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{Math.round((quest.participants.current / quest.participants.max) * 100)}%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min((quest.participants.current / quest.participants.max) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="pt-3">
                          <Button 
                            className="w-full text-white bg-gray-500 cursor-not-allowed"
                            disabled={true}
                          >
                            Mock Data
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  );
                } else {
                  return (
                    <Link key={quest.id} to={`/quest/${quest.id}`}>
                      <Card className="h-full transition-all duration-200 bg-gradient-to-br from-card/50 to-card/30 border-border/50 backdrop-blur group hover:scale-[1.02] hover:shadow-xl cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2 transition-colors line-clamp-2 group-hover:text-[hsl(var(--vibrant-blue))]">
                                {quest.title}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={quest.creator.avatar} />
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white">
                                    {quest.creator.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{quest.creator.name}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Badge variant="outline" className={getStatusBadgeStyle(quest.status)}>
                                {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
                              </Badge>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                {getQuestIcon(quest.questType)}
                                <span>{quest.category}</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="py-3">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getRewardIcon(quest.reward.type)}
                              <span className="font-semibold text-[hsl(var(--vibrant-blue))]">
                                {quest.reward.amount} {quest.reward.type}
                              </span>
                              {quest.reward.type !== 'ETH' && (
                                <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                                  Coming Soon
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>
                                {quest.participants.current}
                                {quest.participants.max && `/${quest.participants.max}`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{quest.timeRemaining}</span>
                            </div>
                          </div>

                          {quest.participants.max && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>{Math.round((quest.participants.current / quest.participants.max) * 100)}%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min((quest.participants.current / quest.participants.max) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="pt-3">
                          <Button className="w-full text-white bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] hover:from-[hsl(var(--vibrant-blue))]/90 hover:to-[hsl(var(--vibrant-purple))]/90">
                            View Quest
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  );
                }
              })}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && paginatedQuests.length === 0 && !error && (
              <Card className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Quests Found</h3>
                <p className="text-muted-foreground mb-4">
                  No quests match your current filters. Try adjusting your search criteria.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
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
                  Previous
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
                  Next
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