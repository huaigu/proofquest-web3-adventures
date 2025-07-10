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

          {/* Features Cards - Enhanced with SVG graphics */}
          <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-red))] rounded-xl p-3 text-white shadow-lg relative overflow-hidden">
              <svg className="absolute top-0 right-0 w-16 h-16 text-white/10 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40"/>
                <circle cx="30" cy="30" r="15"/>
                <circle cx="70" cy="70" r="10"/>
              </svg>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4" />
                  <span className="text-xs font-semibold">Auto Rewards</span>
                </div>
                <p className="text-xs text-white/90">Smart contract verification</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] rounded-xl p-3 text-white shadow-lg relative overflow-hidden">
              <svg className="absolute top-0 right-0 w-16 h-16 text-white/10 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 100 100">
                <polygon points="50,10 90,90 10,90"/>
                <polygon points="30,20 70,20 50,60"/>
              </svg>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs font-semibold">Transparent</span>
                </div>
                <p className="text-xs text-white/90">Blockchain verifiable</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] rounded-xl p-3 text-white shadow-lg relative overflow-hidden">
              <svg className="absolute top-0 right-0 w-16 h-16 text-white/10 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 100 100">
                <rect x="20" y="20" width="60" height="60" rx="8"/>
                <rect x="35" y="35" width="30" height="30" rx="4"/>
                <circle cx="50" cy="50" r="8"/>
              </svg>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-semibold">Private</span>
                </div>
                <p className="text-xs text-white/90">Zero-knowledge proofs</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))] rounded-xl p-3 text-white shadow-lg relative overflow-hidden">
              <svg className="absolute top-0 right-0 w-16 h-16 text-white/10 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 100 100">
                <rect x="10" y="30" width="25" height="40" rx="3"/>
                <rect x="40" y="20" width="25" height="50" rx="3"/>
                <rect x="70" y="25" width="25" height="45" rx="3"/>
              </svg>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4" />
                  <span className="text-xs font-semibold">Multi-Task</span>
                </div>
                <p className="text-xs text-white/90">Web2 integrations</p>
              </div>
            </div>
          </div>

          {/* Trending Quests - Better integrated background */}
          <div className="col-span-12 md:col-span-5 bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 shadow-lg border border-gray-200/50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[hsl(var(--vibrant-yellow))]" />
                <h3 className="font-semibold text-gray-800">Trending Quests</h3>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-gray-600 hover:text-gray-800">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[hsl(var(--vibrant-blue))]/8 to-[hsl(var(--vibrant-purple))]/8 rounded-xl border border-[hsl(var(--vibrant-blue))]/25 hover:border-[hsl(var(--vibrant-blue))]/40 transition-colors">
                <Avatar className="h-10 w-10 border-2 border-[hsl(var(--vibrant-blue))]/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white text-xs font-bold">
                    DF
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-800">DeFi Protocol Quest</h4>
                    <Badge className="bg-[hsl(var(--vibrant-blue))]/15 text-[hsl(var(--vibrant-blue))] text-xs font-medium border-[hsl(var(--vibrant-blue))]/25">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                    Follow @DeFiProtocol and retweet their latest announcement about governance updates
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[hsl(var(--vibrant-blue))] font-bold">0.1 ETH</span>
                    <span className="text-xs text-gray-500">245/500 participants</span>
                  </div>
                  <div className="w-full bg-gray-200/70 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] h-1.5 rounded-full" style={{ width: "49%" }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[hsl(var(--vibrant-green))]/8 to-[hsl(var(--vibrant-yellow))]/8 rounded-xl border border-[hsl(var(--vibrant-green))]/25 hover:border-[hsl(var(--vibrant-green))]/40 transition-colors">
                <Avatar className="h-10 w-10 border-2 border-[hsl(var(--vibrant-green))]/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-yellow))] text-white text-xs font-bold">
                    ZK
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-800">ZK Education Thread</h4>
                    <Badge className="bg-[hsl(var(--vibrant-green))]/15 text-[hsl(var(--vibrant-green))] text-xs font-medium border-[hsl(var(--vibrant-green))]/25">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                    Create an educational Twitter thread explaining zero-knowledge proofs in simple terms
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[hsl(var(--vibrant-green))] font-bold">50 USDC</span>
                    <span className="text-xs text-gray-500">89/100 participants</span>
                  </div>
                  <div className="w-full bg-gray-200/70 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-yellow))] h-1.5 rounded-full" style={{ width: "89%" }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[hsl(var(--vibrant-red))]/8 to-[hsl(var(--vibrant-pink))]/8 rounded-xl border border-[hsl(var(--vibrant-red))]/25">
                <Avatar className="h-10 w-10 border-2 border-[hsl(var(--vibrant-red))]/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-red))] to-[hsl(var(--vibrant-pink))] text-white text-xs font-bold">
                    DC
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-800">Discord Community</h4>
                    <Badge className="bg-gray-100/80 text-gray-600 text-xs border border-gray-300/50">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                    Join the official Discord server and complete the verification process
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[hsl(var(--vibrant-red))] font-bold">NFT Badge</span>
                    <span className="text-xs text-gray-500">1,000/1,000 completed</span>
                  </div>
                  <div className="w-full bg-gray-200/70 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-[hsl(var(--vibrant-red))] to-[hsl(var(--vibrant-pink))] h-1.5 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Earners - Enhanced Bento Style */}
          <div className="col-span-12 md:col-span-3 space-y-4">
            {/* Header Card */}
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-5 w-5" />
                <h3 className="font-bold text-white">Top Earners</h3>
              </div>
              <div className="text-2xl font-bold">$125K+</div>
              <div className="text-xs text-white/80">Total Distributed</div>
            </div>

            {/* Top 3 Bento Cards */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gradient-to-r from-[hsl(var(--vibrant-yellow))]/10 to-[hsl(var(--vibrant-orange))]/10 rounded-xl p-4 border border-[hsl(var(--vibrant-yellow))]/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-3 border-[hsl(var(--vibrant-yellow))]/50">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))] text-white text-sm font-bold">
                        A1
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[hsl(var(--vibrant-yellow))] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">0x1234...5678</p>
                    <p className="text-lg font-bold text-[hsl(var(--vibrant-orange))]">2.5 ETH</p>
                    <p className="text-xs text-gray-600">12 quests completed</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[hsl(var(--vibrant-blue))]/10 to-[hsl(var(--vibrant-purple))]/10 rounded-xl p-3 border border-[hsl(var(--vibrant-blue))]/20">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-[hsl(var(--vibrant-blue))]/30">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white text-xs font-bold">
                      B2
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">0xabcd...efgh</p>
                    <p className="text-sm font-bold text-[hsl(var(--vibrant-blue))]">1.8 ETH</p>
                  </div>
                  <div className="text-xs font-semibold text-gray-500">#2</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[hsl(var(--vibrant-green))]/10 to-[hsl(var(--vibrant-blue))]/10 rounded-xl p-3 border border-[hsl(var(--vibrant-green))]/20">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-[hsl(var(--vibrant-green))]/30">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] text-white text-xs font-bold">
                      C3
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">0x9876...4321</p>
                    <p className="text-sm font-bold text-[hsl(var(--vibrant-green))]">1.2 ETH</p>
                  </div>
                  <div className="text-xs font-semibold text-gray-500">#3</div>
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