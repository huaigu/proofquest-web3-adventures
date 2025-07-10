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
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

// Types
interface Quest {
  id: string;
  title: string;
  creator: {
    name: string;
    avatar: string;
    handle: string;
  };
  reward: {
    amount: number;
    type: 'ETH' | 'USDC' | 'NFT';
  };
  status: 'Active' | 'Claiming' | 'Cancelled' | 'Paused' | 'Completed';
  participants: {
    current: number;
    max: number;
  };
  timeRemaining: string;
  taskType: 'twitter' | 'discord' | 'content';
  category: 'Social' | 'Content' | 'DeFi' | 'Gaming' | 'Education';
  createdAt: Date;
}

// Mock data
const generateMockQuests = (): Quest[] => {
  const creators = [
    { name: "DeFi Protocol", avatar: "", handle: "@defiprotocol", initial: "DF" },
    { name: "ZK Research", avatar: "", handle: "@zkresearch", initial: "ZK" },
    { name: "Web3 Builder", avatar: "", handle: "@web3builder", initial: "WB" },
    { name: "Crypto Edu", avatar: "", handle: "@cryptoedu", initial: "CE" },
    { name: "NFT Project", avatar: "", handle: "@nftproject", initial: "NP" },
  ];

  const titles = [
    "Follow and retweet our latest announcement",
    "Create educational thread about ZK proofs",
    "Join Discord and complete verification",
    "Share your DeFi experience story",
    "Review our documentation and provide feedback",
    "Create a tutorial video",
    "Join our community AMA session",
    "Test our new beta features",
    "Write a blog post about Web3",
    "Participate in governance voting",
    "Share project on social media",
    "Complete our user survey",
    "Translate content to your language",
    "Create meme about our protocol",
    "Join our weekly discussion"
  ];

  const statuses: Quest['status'][] = ['Active', 'Claiming', 'Cancelled', 'Paused', 'Completed'];
  const taskTypes: Quest['taskType'][] = ['twitter', 'discord', 'content'];
  const categories: Quest['category'][] = ['Social', 'Content', 'DeFi', 'Gaming', 'Education'];
  const rewardTypes: Quest['reward']['type'][] = ['ETH', 'USDC', 'NFT'];

  return Array.from({ length: 15 }, (_, i) => {
    const creator = creators[i % creators.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const maxParticipants = Math.floor(Math.random() * 900) + 100;
    const currentParticipants = status === 'Completed' 
      ? maxParticipants 
      : Math.floor(Math.random() * maxParticipants);

    return {
      id: `quest-${i + 1}`,
      title: titles[i % titles.length],
      creator: {
        name: creator.name,
        avatar: creator.avatar,
        handle: creator.handle,
      },
      reward: {
        amount: Math.random() * 0.99 + 0.01,
        type: rewardTypes[Math.floor(Math.random() * rewardTypes.length)],
      },
      status,
      participants: {
        current: currentParticipants,
        max: maxParticipants,
      },
      timeRemaining: status === 'Completed' ? 'Ended' : `${Math.floor(Math.random() * 30) + 1}d`,
      taskType: taskTypes[Math.floor(Math.random() * taskTypes.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    };
  });
};

const QuestList = () => {
  const [quests] = useState<Quest[]>(generateMockQuests());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rewardTypeFilter, setRewardTypeFilter] = useState<string>("all");
  const [questTypeFilter, setQuestTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [rewardRange, setRewardRange] = useState<number[]>([0, 1]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const questsPerPage = 12;

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

  // Filter and sort quests
  const filteredQuests = useMemo(() => {
    let filtered = quests.filter(quest => {
      // Search filter
      if (searchQuery && !quest.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !quest.creator.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && quest.status.toLowerCase() !== statusFilter) {
        return false;
      }

      // Reward type filter
      if (rewardTypeFilter !== "all" && quest.reward.type.toLowerCase() !== rewardTypeFilter) {
        return false;
      }

      // Quest type filter
      if (questTypeFilter !== "all" && quest.taskType !== questTypeFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && quest.category.toLowerCase() !== categoryFilter) {
        return false;
      }

      // Reward range filter (convert to ETH equivalent for comparison)
      const questRewardInETH = quest.reward.type === 'ETH' ? quest.reward.amount :
                               quest.reward.type === 'USDC' ? quest.reward.amount / 2000 : 0.05; // Assume NFT = 0.05 ETH
      if (questRewardInETH < rewardRange[0] || questRewardInETH > rewardRange[1]) {
        return false;
      }

      return true;
    });

    // Sort quests
    switch (sortBy) {
      case "highest-reward":
        filtered.sort((a, b) => {
          const aReward = a.reward.type === 'ETH' ? a.reward.amount :
                         a.reward.type === 'USDC' ? a.reward.amount / 2000 : 0.05;
          const bReward = b.reward.type === 'ETH' ? b.reward.amount :
                         b.reward.type === 'USDC' ? b.reward.amount / 2000 : 0.05;
          return bReward - aReward;
        });
        break;
      case "ending-soon":
        filtered.sort((a, b) => {
          if (a.timeRemaining === 'Ended') return 1;
          if (b.timeRemaining === 'Ended') return -1;
          return parseInt(a.timeRemaining) - parseInt(b.timeRemaining);
        });
        break;
      default: // newest
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return filtered;
  }, [quests, searchQuery, statusFilter, rewardTypeFilter, questTypeFilter, categoryFilter, rewardRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredQuests.length / questsPerPage);
  const paginatedQuests = filteredQuests.slice(
    (currentPage - 1) * questsPerPage,
    currentPage * questsPerPage
  );

  const clearAllFilters = () => {
    setStatusFilter("all");
    setRewardTypeFilter("all");
    setQuestTypeFilter("all");
    setCategoryFilter("all");
    setRewardRange([0, 1]);
    setSearchQuery("");
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

  const getStatusBadgeColor = (status: Quest['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-[hsl(var(--vibrant-green))]/15 text-[hsl(var(--vibrant-green))] border-[hsl(var(--vibrant-green))]/25';
      case 'Claiming':
        return 'bg-[hsl(var(--vibrant-yellow))]/15 text-[hsl(var(--vibrant-yellow))] border-[hsl(var(--vibrant-yellow))]/25';
      case 'Cancelled':
        return 'bg-[hsl(var(--vibrant-red))]/15 text-[hsl(var(--vibrant-red))] border-[hsl(var(--vibrant-red))]/25';
      case 'Paused':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'Completed':
        return 'bg-[hsl(var(--vibrant-blue))]/15 text-[hsl(var(--vibrant-blue))] border-[hsl(var(--vibrant-blue))]/25';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getTaskIcon = (taskType: Quest['taskType']) => {
    switch (taskType) {
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'discord':
        return <MessageSquare className="h-4 w-4" />;
      case 'content':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatReward = (reward: Quest['reward']) => {
    if (reward.type === 'NFT') return 'NFT Badge';
    return `${reward.amount.toFixed(reward.type === 'ETH' ? 3 : 0)} ${reward.type}`;
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-5 w-full mb-4" />
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-2 w-full mb-2" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Explore Quests</h1>
              <p className="text-muted-foreground mt-1">
                Discover and participate in exciting Web3 quests
              </p>
            </div>
            
            {/* Mobile filter toggle */}
            <Button 
              variant="outline" 
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Search and Quick Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search quests or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="claiming">Claiming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SortDesc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="highest-reward">Highest Reward</SelectItem>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeFilter(filter.key)}
                >
                  {filter.value}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          {showSidebar && (
            <aside className="w-80 shrink-0 lg:block hidden">
              <Card className="sticky top-24">
                <CardHeader>
                  <h3 className="font-semibold">Filters</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Categories */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="defi">DeFi</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reward Type */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Reward Type</label>
                    <Select value={rewardTypeFilter} onValueChange={setRewardTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="eth">ETH</SelectItem>
                        <SelectItem value="usdc">USDC</SelectItem>
                        <SelectItem value="nft">NFT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quest Type */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Quest Type</label>
                    <Select value={questTypeFilter} onValueChange={setQuestTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="discord">Discord</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reward Range */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Reward Range (ETH): {rewardRange[0].toFixed(2)} - {rewardRange[1].toFixed(2)}
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
                </CardContent>
              </Card>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Results Summary */}
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {paginatedQuests.length} of {filteredQuests.length} quests
                  </p>
                </div>

                {/* Quest Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedQuests.map((quest) => (
                    <Link key={quest.id} to={`/quest/${quest.id}`}>
                      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={quest.creator.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-bold">
                                  {quest.creator.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{quest.creator.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{quest.creator.handle}</p>
                              </div>
                            </div>
                            <Badge className={`shrink-0 text-xs ${getStatusBadgeColor(quest.status)}`}>
                              {quest.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pb-3">
                          <h3 className="font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                            {quest.title}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              {getTaskIcon(quest.taskType)}
                              <span className="text-sm font-bold text-primary">
                                {formatReward(quest.reward)}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {quest.category}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{quest.participants.current}/{quest.participants.max} participants</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {quest.timeRemaining}
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(quest.participants.current / quest.participants.max) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Empty State */}
                {filteredQuests.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No quests found</h3>
                      <p>Try adjusting your filters or search terms</p>
                    </div>
                    <Button onClick={clearAllFilters} variant="outline">
                      Clear all filters
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default QuestList;