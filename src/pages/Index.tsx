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
                <Link to="/quests">
                  <Button size="sm" className="bg-white text-[hsl(var(--vibrant-blue))] hover:bg-white/90 text-xs font-medium">
                    Explore Quests
                  </Button>
                </Link>
                <Link to="/create">
                  <Button size="sm" className="bg-white/10 text-white hover:bg-white/20 border border-white/30 text-xs font-medium">
                    Create Quest
                  </Button>
                </Link>
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

          {/* Features Cards - Enhanced with full-space SVG graphics */}
          <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-red))] rounded-xl p-3 text-white shadow-lg relative overflow-hidden">
              <svg className="absolute top-0 right-0 w-16 h-16 text-white/10 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40"/>
                <circle cx="30" cy="30" r="15"/>
                <circle cx="70" cy="70" r="10"/>
              </svg>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4" />
                  <span className="text-xs font-semibold">Auto Rewards</span>
                </div>
                <p className="text-xs text-white/90 mb-2">Smart contract verification</p>
                {/* Auto Rewards SVG - Robot/Automation theme */}
                <div className="flex-1 p-3">
                  <svg className="w-full h-full text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {/* Robot head */}
                    <rect x="8" y="4" width="8" height="8" rx="2" strokeWidth={1.5}/>
                    {/* Robot eyes */}
                    <circle cx="10" cy="7" r="0.5" fill="currentColor"/>
                    <circle cx="14" cy="7" r="0.5" fill="currentColor"/>
                    {/* Robot mouth */}
                    <path d="M10 10h4" strokeWidth={1.5} strokeLinecap="round"/>
                    {/* Robot body */}
                    <rect x="7" y="12" width="10" height="8" rx="1" strokeWidth={1.5}/>
                    {/* Control panel */}
                    <rect x="9" y="14" width="6" height="4" rx="0.5" strokeWidth={1}/>
                    {/* Buttons */}
                    <circle cx="11" cy="16" r="0.5" fill="currentColor"/>
                    <circle cx="13" cy="16" r="0.5" fill="currentColor"/>
                    {/* Arms */}
                    <path d="M7 14h-2v4" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M17 14h2v4" strokeWidth={1.5} strokeLinecap="round"/>
                    {/* Legs */}
                    <path d="M9 20v2" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M15 20v2" strokeWidth={1.5} strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] rounded-xl p-3 text-white shadow-lg relative overflow-hidden">
              <svg className="absolute top-0 right-0 w-16 h-16 text-white/10 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 100 100">
                <polygon points="50,10 90,90 10,90"/>
                <polygon points="30,20 70,20 50,60"/>
              </svg>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs font-semibold">Transparent</span>
                </div>
                <p className="text-xs text-white/90 mb-2">Blockchain verifiable</p>
                {/* Transparency SVG - Blockchain/transparency theme */}
                <div className="flex-1 p-3">
                  <svg className="w-full h-full text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {/* Blockchain blocks */}
                    <rect x="2" y="2" width="6" height="6" rx="1" strokeWidth={1.5}/>
                    <rect x="16" y="2" width="6" height="6" rx="1" strokeWidth={1.5}/>
                    <rect x="2" y="16" width="6" height="6" rx="1" strokeWidth={1.5}/>
                    <rect x="16" y="16" width="6" height="6" rx="1" strokeWidth={1.5}/>
                    <rect x="9" y="9" width="6" height="6" rx="1" strokeWidth={1.5}/>
                    {/* Connecting lines */}
                    <path d="M8 5h8" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M8 19h8" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M5 8v8" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M19 8v8" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M8 12h1" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M15 12h1" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M12 9v1" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M12 14v1" strokeWidth={1.5} strokeLinecap="round"/>
                    {/* Block content indicators */}
                    <circle cx="5" cy="5" r="0.5" fill="currentColor"/>
                    <circle cx="19" cy="5" r="0.5" fill="currentColor"/>
                    <circle cx="5" cy="19" r="0.5" fill="currentColor"/>
                    <circle cx="19" cy="19" r="0.5" fill="currentColor"/>
                    <circle cx="12" cy="12" r="0.5" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))] rounded-xl p-3 text-white shadow-lg relative overflow-hidden">
              <svg className="absolute top-0 right-0 w-16 h-16 text-white/10 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 100 100">
                <rect x="20" y="20" width="60" height="60" rx="8"/>
                <rect x="35" y="35" width="30" height="30" rx="4"/>
                <circle cx="50" cy="50" r="8"/>
              </svg>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-semibold">Private</span>
                </div>
                <p className="text-xs text-white/90 mb-2">Zero-knowledge proofs</p>
                {/* Privacy SVG - Zero-knowledge/privacy theme */}
                <div className="flex-1 p-3">
                  <svg className="w-full h-full text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {/* Main shield */}
                    <path d="M12 2l8 3v6c0 5.5-3.5 10.5-8 12-4.5-1.5-8-6.5-8-12V5l8-3z" strokeWidth={1.5}/>
                    {/* ZK symbol - question mark representing unknown/private */}
                    <path d="M9 8a3 3 0 0 1 6 0c0 2-3 3-3 3" strokeWidth={1.5} strokeLinecap="round"/>
                    <circle cx="12" cy="14" r="0.5" fill="currentColor"/>
                    {/* Privacy dots pattern */}
                    <circle cx="8" cy="6" r="0.5" fill="currentColor" opacity="0.6"/>
                    <circle cx="16" cy="6" r="0.5" fill="currentColor" opacity="0.6"/>
                    <circle cx="7" cy="11" r="0.5" fill="currentColor" opacity="0.4"/>
                    <circle cx="17" cy="11" r="0.5" fill="currentColor" opacity="0.4"/>
                    <circle cx="8" cy="15" r="0.5" fill="currentColor" opacity="0.3"/>
                    <circle cx="16" cy="15" r="0.5" fill="currentColor" opacity="0.3"/>
                    {/* Lock indicator - moved to bottom */}
                    <rect x="10" y="18" width="4" height="2" rx="0.5" strokeWidth={1}/>
                    <path d="M11 18v-1a1 1 0 0 1 2 0v1" strokeWidth={1}/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))] rounded-xl p-3 text-white shadow-lg relative overflow-hidden">
              <svg className="absolute top-0 right-0 w-16 h-16 text-white/10 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 100 100">
                <rect x="10" y="30" width="25" height="40" rx="3"/>
                <rect x="40" y="20" width="25" height="50" rx="3"/>
                <rect x="70" y="25" width="25" height="45" rx="3"/>
              </svg>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4" />
                  <span className="text-xs font-semibold">Multi-Task</span>
                </div>
                <p className="text-xs text-white/90 mb-2">Web2 integrations</p>
                {/* Multi-Task SVG - Web2 integrations theme */}
                <div className="flex-1 p-3">
                  <svg className="w-full h-full text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {/* Central hub */}
                    <circle cx="12" cy="12" r="3" strokeWidth={1.5}/>
                    <circle cx="12" cy="12" r="1" fill="currentColor"/>
                    {/* Connected platforms */}
                    <rect x="2" y="2" width="5" height="4" rx="1" strokeWidth={1.5}/>
                    <rect x="17" y="2" width="5" height="4" rx="1" strokeWidth={1.5}/>
                    <rect x="2" y="18" width="5" height="4" rx="1" strokeWidth={1.5}/>
                    <rect x="17" y="18" width="5" height="4" rx="1" strokeWidth={1.5}/>
                    {/* Platform icons */}
                    <path d="M3 3h3v2H3z" fill="currentColor" opacity="0.5"/>
                    <path d="M18 3h3v2h-3z" fill="currentColor" opacity="0.5"/>
                    <path d="M3 19h3v2H3z" fill="currentColor" opacity="0.5"/>
                    <path d="M18 19h3v2h-3z" fill="currentColor" opacity="0.5"/>
                    {/* Connection lines */}
                    <path d="M7 4l4 4" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M17 4l-4 4" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M7 20l4-4" strokeWidth={1.5} strokeLinecap="round"/>
                    <path d="M17 20l-4-4" strokeWidth={1.5} strokeLinecap="round"/>
                    {/* Data flow indicators */}
                    <circle cx="8" cy="6" r="0.5" fill="currentColor" opacity="0.7"/>
                    <circle cx="16" cy="6" r="0.5" fill="currentColor" opacity="0.7"/>
                    <circle cx="8" cy="18" r="0.5" fill="currentColor" opacity="0.7"/>
                    <circle cx="16" cy="18" r="0.5" fill="currentColor" opacity="0.7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Quests - Bright background with vibrant contrast */}
          <div className="col-span-12 md:col-span-5 bg-gradient-to-br from-[hsl(var(--vibrant-pink))]/15 to-[hsl(var(--vibrant-red))]/10 rounded-xl p-5 shadow-lg border border-[hsl(var(--vibrant-pink))]/25">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[hsl(var(--vibrant-yellow))]" />
                <h3 className="font-semibold tex-white-600">Trending Quests</h3>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-gray-600 hover:text-white-500">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[hsl(var(--vibrant-orange))]/90 to-[hsl(var(--vibrant-yellow))]/90 rounded-xl border border-[hsl(var(--vibrant-orange))]/60 hover:border-[hsl(var(--vibrant-orange))]/80 transition-colors text-white">
                <Avatar className="h-10 w-10 border-2 border-white/30">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-red))] to-[hsl(var(--vibrant-pink))] text-white text-xs font-bold">
                    DF
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white">DeFi Protocol Quest</h4>
                    <Badge className="bg-white/20 text-white text-xs font-medium border-white/30">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-white/90 mb-2 leading-relaxed">
                    Follow @DeFiProtocol and retweet their latest announcement about governance updates
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-bold">0.1 ETH</span>
                    <span className="text-xs text-white/80">245/500 participants</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: "49%" }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[hsl(var(--vibrant-purple))]/90 to-[hsl(var(--vibrant-blue))]/90 rounded-xl border border-[hsl(var(--vibrant-purple))]/60 hover:border-[hsl(var(--vibrant-purple))]/80 transition-colors text-white">
                <Avatar className="h-10 w-10 border-2 border-white/30">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-yellow))] text-white text-xs font-bold">
                    ZK
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white">ZK Education Thread</h4>
                    <Badge className="bg-white/20 text-white text-xs font-medium border-white/30">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-white/90 mb-2 leading-relaxed">
                    Create an educational Twitter thread explaining zero-knowledge proofs in simple terms
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-bold">50 USDC</span>
                    <span className="text-xs text-white/80">89/100 participants</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: "89%" }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[hsl(var(--vibrant-green))]/90 to-[hsl(var(--vibrant-blue))]/90 rounded-xl border border-[hsl(var(--vibrant-green))]/60 text-white">
                <Avatar className="h-10 w-10 border-2 border-white/30">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] text-white text-xs font-bold">
                    DC
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white">Discord Community</h4>
                    <Badge className="bg-white/20 text-white text-xs border border-white/30">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-xs text-white/90 mb-2 leading-relaxed">
                    Join the official Discord server and complete the verification process
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-bold">NFT Badge</span>
                    <span className="text-xs text-white/80">1,000/1,000 completed</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-1.5">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: "100%" }}></div>
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