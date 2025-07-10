import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Shield, Layers, Activity, Users, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const stats = [
    { label: "Total Quests", value: "1,234", icon: Activity },
    { label: "Total Rewards", value: "$125K", icon: Trophy },
    { label: "Active Users", value: "8,547", icon: Users },
    { label: "Completed Tasks", value: "15,632", icon: Zap },
  ];

  const popularQuests = [
    {
      id: "1",
      title: "Follow @DeFiProtocol & RT announcement",
      reward: "0.1 ETH",
      participants: "245/500",
      status: "active" as const,
    },
    {
      id: "2", 
      title: "Create educational thread about ZK proofs",
      reward: "50 USDC",
      participants: "89/100",
      status: "active" as const,
    },
    {
      id: "3",
      title: "Join community Discord & verify",
      reward: "NFT Badge",
      participants: "1,000/1,000",
      status: "completed" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Bento Style */}
      <section className="relative overflow-hidden px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
            {/* Main Title Card */}
            <div className="md:col-span-8 bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                  ProofQuest
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
                  Zero-Knowledge Quest Platform - Complete Web2 tasks, Get Web3 rewards
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/quests">
                    <Button size="lg" className="bg-white text-[hsl(var(--vibrant-blue))] hover:bg-white/90 px-8">
                      Explore Quests
                    </Button>
                  </Link>
                  <Link to="/create">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 px-8">
                      Create Quest
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="md:col-span-4 grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold">1,234</div>
                <div className="text-white/80 text-sm">Total Quests</div>
                <Activity className="h-8 w-8 text-white/60 mt-2" />
              </div>
              <div className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold">$125K</div>
                <div className="text-white/80 text-sm">Total Rewards</div>
                <Trophy className="h-8 w-8 text-white/60 mt-2" />
              </div>
              <div className="bg-gradient-to-br from-[hsl(var(--vibrant-pink))] to-[hsl(var(--vibrant-red))] rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold">8,547</div>
                <div className="text-white/80 text-sm">Active Users</div>
                <Users className="h-8 w-8 text-white/60 mt-2" />
              </div>
              <div className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold">15,632</div>
                <div className="text-white/80 text-sm">Completed</div>
                <Zap className="h-8 w-8 text-white/60 mt-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Bento Style */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-3xl font-bold">Why ProofQuest?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-red))] rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">Automated Rewards</h3>
                <p className="text-white/90 leading-relaxed">
                  Smart contracts automatically verify task completion and distribute rewards without manual intervention.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">On-chain Transparency</h3>
                <p className="text-white/90 leading-relaxed">
                  All quest executions and reward distributions are publicly verifiable on the blockchain.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">Privacy Protected</h3>
                <p className="text-white/90 leading-relaxed">
                  Zero-knowledge proofs protect your sensitive information while proving task completion.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))] rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Layers className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">Multiple Task Types</h3>
                <p className="text-white/90 leading-relaxed">
                  Support for Twitter interactions, content creation, and various Web2 platform integrations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Quests Preview - Bento Style */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Trending Quests</h2>
            <p className="text-muted-foreground">
              Join thousands of users completing quests and earning rewards
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-semibold line-clamp-2">Follow @DeFiProtocol & RT announcement</h3>
                  <Badge className="ml-2 shrink-0 bg-white/20 text-white border-white/30">
                    active
                  </Badge>
                </div>
                
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-2xl font-bold">0.1 ETH</div>
                  <div className="text-sm text-white/80">245/500</div>
                </div>
                
                <div className="mb-4 h-2 rounded-full bg-white/20">
                  <div className="h-2 rounded-full bg-white" style={{ width: "49%" }} />
                </div>
                
                <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                  View Quest
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-yellow))] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-semibold line-clamp-2">Create educational thread about ZK proofs</h3>
                  <Badge className="ml-2 shrink-0 bg-white/20 text-white border-white/30">
                    active
                  </Badge>
                </div>
                
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-2xl font-bold">50 USDC</div>
                  <div className="text-sm text-white/80">89/100</div>
                </div>
                
                <div className="mb-4 h-2 rounded-full bg-white/20">
                  <div className="h-2 rounded-full bg-white" style={{ width: "89%" }} />
                </div>
                
                <Button variant="outline" className="w-full border-white text-white hover:bg-white/10">
                  View Quest
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-red))] to-[hsl(var(--vibrant-pink))] rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-semibold line-clamp-2">Join community Discord & verify</h3>
                  <Badge className="ml-2 shrink-0 bg-white/40 text-white border-white/50">
                    completed
                  </Badge>
                </div>
                
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-2xl font-bold">NFT Badge</div>
                  <div className="text-sm text-white/80">1,000/1,000</div>
                </div>
                
                <div className="mb-4 h-2 rounded-full bg-white/20">
                  <div className="h-2 rounded-full bg-white" style={{ width: "100%" }} />
                </div>
                
                <Button variant="outline" className="w-full border-white/50 text-white/70" disabled>
                  Completed
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/quests">
              <Button size="lg" className="bg-[hsl(var(--vibrant-blue))] hover:bg-[hsl(var(--vibrant-blue))]/90 px-8">
                View All Quests
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
