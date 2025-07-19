import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Users, 
  Wallet, 
  Search, 
  CheckCircle, 
  Trophy, 
  Shield, 
  Zap, 
  Target, 
  Settings, 
  Eye,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Bot,
  Activity,
  Layers,
  Twitter,
  Mail
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Guide = () => {
  const [activeTab, setActiveTab] = useState("sponsors");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const sponsorSteps = [
    {
      icon: Wallet,
      title: "Connect Your Wallet",
      description: "Connect your Web3 wallet to the Monad testnet to get started with quest creation.",
      details: ["Ensure you have a Web3 wallet installed", "Switch to Monad testnet", "Connect your wallet to ProofQuest"],
      gradient: "from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))]"
    },
    {
      icon: Target,
      title: "Define Your Quest",
      description: "Create engaging quests with clear objectives and attractive rewards.",
      details: ["Choose quest type (Twitter, GitHub, Custom)", "Set clear completion criteria", "Define reward amount and distribution"],
      gradient: "from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))]"
    },
    {
      icon: Settings,
      title: "Configure Parameters",
      description: "Set up quest parameters including duration, participant limits, and verification rules.",
      details: ["Set maximum participants", "Choose quest duration", "Configure verification requirements"],
      gradient: "from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-teal))]"
    },
    {
      icon: Eye,
      title: "Monitor & Verify",
      description: "Track quest progress and verify participant submissions for reward distribution.",
      details: ["Monitor real-time participation", "Review submission proofs", "Approve verified completions"],
      gradient: "from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))]"
    }
  ];

  const userSteps = [
    {
      icon: Wallet,
      title: "Connect Your Wallet",
      description: "Connect your Web3 wallet to start participating in quests and earning rewards.",
      details: ["Install a Web3 wallet", "Add Monad testnet configuration", "Connect to ProofQuest platform"],
      gradient: "from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))]"
    },
    {
      icon: Search,
      title: "Discover Quests",
      description: "Browse available quests and find ones that match your interests and skills.",
      details: ["Filter quests by reward amount", "Check quest requirements", "View completion deadlines"],
      gradient: "from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))]"
    },
    {
      icon: CheckCircle,
      title: "Complete Tasks",
      description: "Follow quest instructions and complete the required tasks to earn rewards.",
      details: ["Read quest requirements carefully", "Complete tasks on external platforms", "Generate necessary proofs"],
      gradient: "from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-red))]"
    },
    {
      icon: Trophy,
      title: "Claim Rewards",
      description: "Once verified, automatically receive your rewards directly to your wallet.",
      details: ["Wait for automatic verification", "Receive rewards in your wallet", "Track your earning history"],
      gradient: "from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))]"
    }
  ];

  const features = [
    {
      icon: Bot,
      title: "Automated Verification",
      description: "Smart contracts automatically verify quest completion and distribute rewards",
      gradient: "from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-red))]"
    },
    {
      icon: Shield,
      title: "Zero-Knowledge Privacy",
      description: "Protect your privacy while proving task completion with advanced cryptography",
      gradient: "from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))]"
    },
    {
      icon: Activity,
      title: "Transparent & Verifiable",
      description: "All transactions and verifications are recorded on the blockchain for transparency",
      gradient: "from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))]"
    },
    {
      icon: Layers,
      title: "Multi-Platform Integration",
      description: "Complete tasks across various Web2 platforms and earn Web3 rewards",
      gradient: "from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))]"
    }
  ];

  const faqs = [
    {
      question: "What is ProofQuest?",
      answer: "ProofQuest is a Web3 quest platform that allows you to complete Web2 tasks and earn cryptocurrency rewards. Using zero-knowledge proof technology, you can prove task completion while maintaining privacy."
    },
    {
      question: "How do I get started?",
      answer: "Simply connect your Web3 wallet to the Monad testnet, browse available quests, and start completing tasks. You'll automatically receive rewards upon verification."
    },
    {
      question: "What types of quests are available?",
      answer: "Quests include social media tasks (Twitter engagement), development tasks (GitHub contributions), content creation, community participation, and custom challenges created by sponsors."
    },
    {
      question: "How are rewards distributed?",
      answer: "Rewards are automatically distributed to your wallet once quest completion is verified through our smart contract system. No manual claiming required!"
    },
    {
      question: "Is my data private?",
      answer: "Yes! We use zero-knowledge proofs to verify task completion without exposing your personal data or sensitive information to the blockchain."
    },
    {
      question: "What is Monad testnet?",
      answer: "Monad is a high-performance blockchain that we use for fast and cost-effective transactions. The testnet allows you to interact with the platform without real cryptocurrency costs."
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
        
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8" />
              <Sparkles className="h-6 w-6 text-white/80" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              How ProofQuest Works
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Complete Web2 tasks, earn Web3 rewards with zero-knowledge proof verification
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-[hsl(var(--vibrant-blue))] hover:bg-white/90 font-semibold"
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-5 w-5 mr-2" />
                I want to earn rewards
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 text-white hover:bg-white/20 border-white/30 font-semibold"
                onClick={() => setActiveTab("sponsors")}
              >
                <Target className="h-5 w-5 mr-2" />
                I want to create quests
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Role-based Guide Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl h-auto">
            <TabsTrigger 
              value="sponsors" 
              className="text-lg py-4 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--vibrant-orange))] data-[state=active]:to-[hsl(var(--vibrant-yellow))] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
            >
              <Target className="h-5 w-5 mr-2" />
              For Sponsors
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="text-lg py-4 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--vibrant-blue))] data-[state=active]:to-[hsl(var(--vibrant-purple))] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
            >
              <Users className="h-5 w-5 mr-2" />
              For Users
            </TabsTrigger>
          </TabsList>

          {/* Sponsors Guide */}
          <TabsContent value="sponsors" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Create Engaging Quests</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Learn how to create compelling quests that drive community engagement and achieve your goals
              </p>
            </div>

            <div className="grid gap-8 md:gap-12">
              {sponsorSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="border-0 shadow-lg bg-gradient-to-r from-background to-muted/50">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="outline" className="text-sm font-medium">
                              Step {index + 1}
                            </Badge>
                            <h3 className="text-2xl font-bold">{step.title}</h3>
                          </div>
                          <p className="text-lg text-muted-foreground mb-4">{step.description}</p>
                          <ul className="space-y-2">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-foreground">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Link to="/create">
                <Button size="lg" className="bg-gradient-to-r from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] text-white font-semibold">
                  Start Creating Quests
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Users Guide */}
          <TabsContent value="users" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Start Earning Rewards</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Follow these simple steps to start participating in quests and earning cryptocurrency rewards
              </p>
            </div>

            <div className="grid gap-8 md:gap-12">
              {userSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="border-0 shadow-lg bg-gradient-to-r from-background to-muted/50">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-lg`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="outline" className="text-sm font-medium">
                              Step {index + 1}
                            </Badge>
                            <h3 className="text-2xl font-bold">{step.title}</h3>
                          </div>
                          <p className="text-lg text-muted-foreground mb-4">{step.description}</p>
                          <ul className="space-y-2">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-foreground">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Link to="/quests">
                <Button size="lg" className="bg-gradient-to-r from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))] text-white font-semibold">
                  Explore Available Quests
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        {/* Key Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose ProofQuest?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced features that make quest completion secure, private, and rewarding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white inline-block mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Got questions? We've got answers to help you get started
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border shadow-sm">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-[hsl(var(--vibrant-blue))]" />
                      <span className="font-semibold text-lg">{faq.question}</span>
                    </div>
                    {openFAQ === index ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-6">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <Card className="border-0 bg-gradient-to-br from-[hsl(var(--vibrant-blue))]/10 to-[hsl(var(--vibrant-purple))]/10 border-[hsl(var(--vibrant-blue))]/20">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the ProofQuest community and start earning rewards for completing tasks you already do
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/quests">
                  <Button size="lg" className="bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white font-semibold">
                    Browse Quests
                    <Zap className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/create">
                  <Button size="lg" variant="outline" className="font-semibold">
                    Create a Quest
                    <Target className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Section */}
        <div className="mt-20 text-center">
          <Card className="border-0 bg-gradient-to-br from-muted/50 to-background">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-6">
                Have questions or feedback? Feel free to reach out!
              </p>
              <div className="flex justify-center">
                <a 
                  href="https://x.com/coder_chao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Twitter className="h-5 w-5" />
                  Follow @coder_chao
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Guide;