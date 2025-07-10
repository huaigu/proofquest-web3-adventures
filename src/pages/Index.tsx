import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Shield, Layers, Activity, Users, Trophy, Zap, ArrowRight, Sparkles, Star, Wallet } from "lucide-react";
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

          {/* Trending Quests - Enhanced with avatars and descriptions */}
          <div className="col-span-12 md:col-span-4 bg-[hsl(var(--surface-elevated))] rounded-xl p-5 shadow-lg border">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[hsl(var(--vibrant-yellow))]" />
                <h3 className="font-semibold text-foreground">Trending Quests</h3>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-foreground">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border/50 hover:border-[hsl(var(--vibrant-blue))]/30 transition-colors">
                <Avatar className="h-10 w-10 border-2 border-[hsl(var(--vibrant-blue))]/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white text-xs font-bold">
                    DF
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-foreground">DeFi Protocol Quest</h4>
                    <Badge className="bg-[hsl(var(--vibrant-blue))]/10 text-[hsl(var(--vibrant-blue))] text-xs font-medium">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    Follow @DeFiProtocol and retweet their latest announcement about governance updates
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[hsl(var(--vibrant-blue))] font-bold">0.1 ETH</span>
                    <span className="text-xs text-muted-foreground">245/500 participants</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] h-1.5 rounded-full" style={{ width: "49%" }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border/50 hover:border-[hsl(var(--vibrant-green))]/30 transition-colors">
                <Avatar className="h-10 w-10 border-2 border-[hsl(var(--vibrant-green))]/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-yellow))] text-white text-xs font-bold">
                    ZK
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-foreground">ZK Education Thread</h4>
                    <Badge className="bg-[hsl(var(--vibrant-green))]/10 text-[hsl(var(--vibrant-green))] text-xs font-medium">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    Create an educational Twitter thread explaining zero-knowledge proofs in simple terms
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[hsl(var(--vibrant-green))] font-bold">50 USDC</span>
                    <span className="text-xs text-muted-foreground">89/100 participants</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-yellow))] h-1.5 rounded-full" style={{ width: "89%" }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border/50">
                <Avatar className="h-10 w-10 border-2 border-[hsl(var(--vibrant-red))]/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-red))] to-[hsl(var(--vibrant-pink))] text-white text-xs font-bold">
                    DC
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-foreground">Discord Community</h4>
                    <Badge variant="outline" className="text-xs">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                    Join the official Discord server and complete the verification process
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[hsl(var(--vibrant-red))] font-bold">NFT Badge</span>
                    <span className="text-xs text-muted-foreground">1,000/1,000 completed</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-[hsl(var(--vibrant-red))] to-[hsl(var(--vibrant-pink))] h-1.5 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Earners - New section */}
          <div className="col-span-12 md:col-span-2 bg-[hsl(var(--surface-elevated))] rounded-xl p-5 shadow-lg border">
            <div className="flex items-center gap-2 mb-5">
              <Wallet className="h-4 w-4 text-[hsl(var(--vibrant-orange))]" />
              <h3 className="font-semibold text-foreground">Top Earners</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-[hsl(var(--vibrant-yellow))]/50">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))] text-white text-xs font-bold">
                      A1
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(var(--vibrant-yellow))] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">0x1234...5678</p>
                  <p className="text-xs text-[hsl(var(--vibrant-orange))] font-semibold">2.5 ETH</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-muted">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white text-xs font-bold">
                      B2
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-foreground text-xs font-bold">2</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">0xabcd...efgh</p>
                  <p className="text-xs text-[hsl(var(--vibrant-blue))] font-semibold">1.8 ETH</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8 border-2 border-muted">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] text-white text-xs font-bold">
                      C3
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-foreground text-xs font-bold">3</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">0x9876...4321</p>
                  <p className="text-xs text-[hsl(var(--vibrant-green))] font-semibold">1.2 ETH</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border-2 border-muted">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-pink))] to-[hsl(var(--vibrant-red))] text-white text-xs font-bold">
                    D4
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">0xdef0...1234</p>
                  <p className="text-xs text-[hsl(var(--vibrant-purple))] font-semibold">0.9 ETH</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border-2 border-muted">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] text-white text-xs font-bold">
                    E5
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">0x5678...9abc</p>
                  <p className="text-xs text-[hsl(var(--vibrant-red))] font-semibold">0.7 ETH</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Index;