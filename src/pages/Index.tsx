import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Shield, Layers, Activity, Users, Trophy, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-12 gap-4 h-screen max-h-[900px]">
          
          {/* Main Title Card - Large */}
          <div className="col-span-12 md:col-span-5 bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium text-white/80">Web3 Quest Platform</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                  ProofQuest
                </h1>
                <p className="text-sm text-white/90 mb-6 leading-relaxed">
                  Complete Web2 tasks, earn Web3 rewards with zero-knowledge proof verification
                </p>
              </div>
              <div className="flex gap-3">
                <Button size="sm" className="bg-white text-[hsl(var(--vibrant-blue))] hover:bg-white/90 text-xs font-medium">
                  Explore Quests
                </Button>
                <Button size="sm" className="bg-white/10 text-white hover:bg-white/20 border border-white/30 text-xs font-medium">
                  Create Quest
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid - Compact */}
          <div className="col-span-6 md:col-span-3 grid grid-cols-1 gap-4">
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">1,234</div>
                  <div className="text-xs text-white/80">Total Quests</div>
                </div>
                <Activity className="h-4 w-4 text-white/60" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">$125K</div>
                  <div className="text-xs text-white/80">Rewards</div>
                </div>
                <Trophy className="h-4 w-4 text-white/60" />
              </div>
            </div>
          </div>

          <div className="col-span-6 md:col-span-2 grid grid-cols-1 gap-4">
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-pink))] to-[hsl(var(--vibrant-red))] rounded-xl p-4 text-white shadow-lg">
              <div className="text-lg font-bold">8,547</div>
              <div className="text-xs text-white/80">Users</div>
              <Users className="h-4 w-4 text-white/60 mt-1" />
            </div>
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] rounded-xl p-4 text-white shadow-lg">
              <div className="text-lg font-bold">15.6K</div>
              <div className="text-xs text-white/80">Complete</div>
              <Zap className="h-4 w-4 text-white/60 mt-1" />
            </div>
          </div>

          <div className="col-span-6 md:col-span-2 bg-gradient-to-br from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))] rounded-xl p-4 text-white shadow-lg">
            <div className="h-full flex flex-col justify-center text-center">
              <div className="text-2xl font-bold mb-1">99.2%</div>
              <div className="text-xs text-white/80">Success Rate</div>
              <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                <div className="bg-white h-1 rounded-full" style={{ width: "99%" }}></div>
              </div>
            </div>
          </div>

          {/* Features Cards - Compact Grid */}
          <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-red))] rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Bot className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">Auto Rewards</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Smart contracts verify and distribute rewards automatically
              </p>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Activity className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">Transparent</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                All executions are publicly verifiable on blockchain
              </p>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">Private</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Zero-knowledge proofs protect your data
              </p>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))] rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Layers className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">Multi-Task</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Twitter, content creation, and Web2 integrations
              </p>
            </div>
          </div>

          {/* Trending Quests - Compact List */}
          <div className="col-span-12 md:col-span-6 bg-[hsl(var(--surface-elevated))] rounded-xl p-4 shadow-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Trending Quests</h3>
              <Button size="sm" variant="ghost" className="text-xs">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[hsl(var(--vibrant-blue))]/10 to-[hsl(var(--vibrant-purple))]/10 rounded-lg border border-[hsl(var(--vibrant-blue))]/20">
                <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Follow @DeFiProtocol & RT announcement
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[hsl(var(--vibrant-blue))] font-semibold">0.1 ETH</span>
                    <span className="text-xs text-muted-foreground">245/500</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 mt-1">
                    <div className="bg-[hsl(var(--vibrant-blue))] h-1 rounded-full" style={{ width: "49%" }}></div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">Active</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[hsl(var(--vibrant-green))]/10 to-[hsl(var(--vibrant-yellow))]/10 rounded-lg border border-[hsl(var(--vibrant-green))]/20">
                <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-yellow))] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Create educational thread about ZK proofs
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[hsl(var(--vibrant-green))] font-semibold">50 USDC</span>
                    <span className="text-xs text-muted-foreground">89/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 mt-1">
                    <div className="bg-[hsl(var(--vibrant-green))] h-1 rounded-full" style={{ width: "89%" }}></div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">Active</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[hsl(var(--vibrant-red))]/10 to-[hsl(var(--vibrant-pink))]/10 rounded-lg border border-[hsl(var(--vibrant-red))]/20">
                <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--vibrant-red))] to-[hsl(var(--vibrant-pink))] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Join community Discord & verify
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[hsl(var(--vibrant-red))] font-semibold">NFT Badge</span>
                    <span className="text-xs text-muted-foreground">1,000/1,000</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 mt-1">
                    <div className="bg-[hsl(var(--vibrant-red))] h-1 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Complete</Badge>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Index;