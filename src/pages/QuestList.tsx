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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200/50">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
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
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Page Header - Bento Style */}
        <div className="grid grid-cols-12 gap-4 mb-8">
          {/* Main Title Card */}
          <div className="col-span-12 lg:col-span-6 bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative z-10">
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Explore Quests</h1>
              <p className="text-white/90 mb-4 text-sm">
                Discover and participate in exciting Web3 quests
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <span className="text-white/80">{filteredQuests.length} Active Quests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[hsl(var(--vibrant-yellow))] rounded-full"></div>
                  <span className="text-white/80">Total Rewards: 12.5 ETH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div className="col-span-12 lg:col-span-6 bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
            <div className="relative z-10 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
                <Input
                  placeholder="Search quests or creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-0 bg-white/20 placeholder:text-white/60 text-white focus:bg-white/30 transition-colors backdrop-blur-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1 border-0 bg-white/20 text-white focus:bg-white/30 [&>svg]:text-white/70">
                    <Filter className="h-4 w-4 mr-2 text-white/70" />
                    <SelectValue placeholder="Status" className="text-white" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="claiming">Claiming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 border-0 bg-white/20 text-white focus:bg-white/30 [&>svg]:text-white/70">
                    <SortDesc className="h-4 w-4 mr-2 text-white/70" />
                    <SelectValue placeholder="Sort" className="text-white" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="highest-reward">Highest Reward</SelectItem>
                    <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters - Bento Style */}
        {activeFilters.length > 0 && (
          <div className="bg-gradient-to-r from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] rounded-xl p-4 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10" />
            <div className="relative z-10 flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-white">Active filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  className="bg-white/90 text-gray-700 border-0 cursor-pointer hover:bg-white hover:text-[hsl(var(--vibrant-red))] transition-colors"
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
                className="h-6 px-2 text-xs text-white/90 hover:text-white hover:bg-white/20"
              >
                Clear all
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Bento Style */}
          {showSidebar && (
            <aside className="col-span-12 lg:col-span-3">
              <div className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] rounded-2xl p-6 shadow-lg sticky top-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5" />
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-6 text-white">Filters</h3>
                  <div className="space-y-6">
                    {/* Categories */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <label className="text-sm font-semibold mb-3 block text-white">Category</label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="border-0 bg-white/20 text-white focus:bg-white/30 [&>svg]:text-white/70">
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
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <label className="text-sm font-semibold mb-3 block text-white">Reward Type</label>
                      <Select value={rewardTypeFilter} onValueChange={setRewardTypeFilter}>
                        <SelectTrigger className="border-0 bg-white/20 text-white focus:bg-white/30 [&>svg]:text-white/70">
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
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <label className="text-sm font-semibold mb-3 block text-white">Quest Type</label>
                      <Select value={questTypeFilter} onValueChange={setQuestTypeFilter}>
                        <SelectTrigger className="border-0 bg-white/20 text-white focus:bg-white/30 [&>svg]:text-white/70">
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
                    <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <label className="text-sm font-semibold mb-3 block text-white">
                        Reward Range (ETH): {rewardRange[0].toFixed(2)} - {rewardRange[1].toFixed(2)}
                      </label>
                      <Slider
                        value={rewardRange}
                        onValueChange={setRewardRange}
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full [&_[role=slider]]:bg-white [&_[role=slider]]:border-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className={`${showSidebar ? 'col-span-12 lg:col-span-9' : 'col-span-12'}`}>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Results Summary - Bento Style */}
                <div className="bg-gradient-to-r from-[hsl(var(--vibrant-green))]/20 to-[hsl(var(--vibrant-blue))]/20 rounded-xl p-4 mb-6 border border-[hsl(var(--vibrant-green))]/30 backdrop-blur-sm">
                  <p className="text-sm font-medium text-foreground">
                    Showing {paginatedQuests.length} of {filteredQuests.length} quests
                  </p>
                </div>

                {/* Quest Grid - Enhanced Bento Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {paginatedQuests.map((quest, index) => {
                    const gradients = [
                      'from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))]',
                      'from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))]',
                      'from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-red))]',
                      'from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))]',
                      'from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))]'
                    ];
                    const gradient = gradients[index % gradients.length];
                    
                    return (
                      <Link key={quest.id} to={`/quest/${quest.id}`}>
                        <Card className={`h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer group bg-gradient-to-br ${gradient} border-0 overflow-hidden text-white relative`}>
                          {/* Background Pattern */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                          
                          <CardHeader className="pb-3 relative z-10">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Avatar className="h-12 w-12 shrink-0 ring-2 ring-white/30">
                                  <AvatarImage src={quest.creator.avatar} />
                                  <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white text-sm font-bold border border-white/30">
                                    {quest.creator.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm truncate text-white">{quest.creator.name}</p>
                                  <p className="text-xs text-white/70 truncate">{quest.creator.handle}</p>
                                </div>
                              </div>
                              <Badge className={`shrink-0 text-xs font-medium bg-white/20 border border-white/30 text-white backdrop-blur-sm`}>
                                {quest.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pb-4 relative z-10">
                            <h3 className="font-bold mb-4 line-clamp-2 group-hover:text-white/90 transition-colors text-white leading-tight">
                              {quest.title}
                            </h3>
                            
                            <div className="flex items-center justify-between mb-4 p-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30">
                                  {getTaskIcon(quest.taskType)}
                                </div>
                                <div>
                                  <span className="text-sm font-bold text-white">
                                    {formatReward(quest.reward)}
                                  </span>
                                  <p className="text-xs text-white/70">{quest.category}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-xs text-white/70 mb-1">
                                  <Clock className="h-3 w-3" />
                                  {quest.timeRemaining}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between text-xs text-white/80">
                                <span className="font-medium">{quest.participants.current}/{quest.participants.max} participants</span>
                                <span className="font-bold">{Math.round((quest.participants.current / quest.participants.max) * 100)}%</span>
                              </div>
                              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                                <div 
                                  className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
                                  style={{ 
                                    width: `${(quest.participants.current / quest.participants.max) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>

                {/* Empty State - Bento Style */}
                {filteredQuests.length === 0 && (
                  <div className="text-center py-16 bg-gradient-to-br from-[hsl(var(--vibrant-purple))]/10 to-[hsl(var(--vibrant-pink))]/10 rounded-2xl border border-[hsl(var(--vibrant-purple))]/20 backdrop-blur-sm">
                    <div className="mb-6">
                      <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-xl font-bold mb-2 text-foreground">No quests found</h3>
                      <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                    </div>
                    <Button 
                      onClick={clearAllFilters} 
                      className="bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white border-0 hover:shadow-lg"
                    >
                      Clear all filters
                    </Button>
                  </div>
                )}

                {/* Pagination - Bento Style */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 bg-gradient-to-r from-[hsl(var(--vibrant-yellow))]/10 to-[hsl(var(--vibrant-orange))]/10 rounded-xl p-6 border border-[hsl(var(--vibrant-yellow))]/20 backdrop-blur-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="border-[hsl(var(--vibrant-blue))]/30 hover:bg-[hsl(var(--vibrant-blue))]/10 hover:border-[hsl(var(--vibrant-blue))]/50"
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
                          className={`w-10 ${currentPage === page 
                            ? 'bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white border-0' 
                            : 'border-[hsl(var(--vibrant-blue))]/30 hover:bg-[hsl(var(--vibrant-blue))]/10 hover:border-[hsl(var(--vibrant-blue))]/50'
                          }`}
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
                      className="border-[hsl(var(--vibrant-blue))]/30 hover:bg-[hsl(var(--vibrant-blue))]/10 hover:border-[hsl(var(--vibrant-blue))]/50"
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