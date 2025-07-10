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
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:24px_24px]" />
        </div>
        
        <div className="relative mx-auto max-w-7xl text-center">
          <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-8xl">
            ProofQuest
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Zero-Knowledge Quest Platform - Complete Web2 tasks, Get Web3 rewards
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/quests">
              <Button size="lg" className="px-8">
                Explore Quests
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="outline" size="lg" className="px-8">
                Create Quest
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-3xl font-bold">Why ProofQuest?</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Automated Rewards</h3>
                <p className="text-muted-foreground">
                  Smart contracts automatically verify task completion and distribute rewards without manual intervention.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">On-chain Transparency</h3>
                <p className="text-muted-foreground">
                  All quest executions and reward distributions are publicly verifiable on the blockchain.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Privacy Protected</h3>
                <p className="text-muted-foreground">
                  Zero-knowledge proofs protect your sensitive information while proving task completion.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Multiple Task Types</h3>
                <p className="text-muted-foreground">
                  Support for Twitter interactions, content creation, and various Web2 platform integrations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-24 bg-muted/20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Quests Preview */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Trending Quests</h2>
            <p className="text-muted-foreground">
              Join thousands of users completing quests and earning rewards
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {popularQuests.map((quest) => (
              <Card key={quest.id} className="transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <h3 className="text-lg font-semibold line-clamp-2">{quest.title}</h3>
                    <Badge 
                      variant={quest.status === "active" ? "default" : "secondary"}
                      className="ml-2 shrink-0"
                    >
                      {quest.status}
                    </Badge>
                  </div>
                  
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">{quest.reward}</div>
                    <div className="text-sm text-muted-foreground">{quest.participants}</div>
                  </div>
                  
                  <div className="mb-4 h-2 rounded-full bg-muted">
                    <div 
                      className="h-2 rounded-full bg-primary"
                      style={{ 
                        width: `${(parseInt(quest.participants.split('/')[0]) / parseInt(quest.participants.split('/')[1])) * 100}%` 
                      }}
                    />
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={quest.status === "completed"}
                  >
                    {quest.status === "completed" ? "Completed" : "View Quest"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/quests">
              <Button variant="outline" size="lg">
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
