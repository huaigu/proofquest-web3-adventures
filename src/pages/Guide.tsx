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
  Mail,
  Download,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

const Guide = () => {
  const { t } = useTranslation('guide');
  const [activeTab, setActiveTab] = useState("sponsors");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const sponsorSteps = [
    {
      icon: Wallet,
      title: t('sponsors.steps.connectWallet.title'),
      description: t('sponsors.steps.connectWallet.description'),
      details: t('sponsors.steps.connectWallet.details', { returnObjects: true }) as string[],
      gradient: "from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))]"
    },
    {
      icon: Target,
      title: t('sponsors.steps.defineQuest.title'),
      description: t('sponsors.steps.defineQuest.description'),
      details: t('sponsors.steps.defineQuest.details', { returnObjects: true }) as string[],
      gradient: "from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))]"
    },
    {
      icon: Settings,
      title: t('sponsors.steps.configureParameters.title'),
      description: t('sponsors.steps.configureParameters.description'),
      details: t('sponsors.steps.configureParameters.details', { returnObjects: true }) as string[],
      gradient: "from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-teal))]"
    },
    {
      icon: Eye,
      title: t('sponsors.steps.monitorVerify.title'),
      description: t('sponsors.steps.monitorVerify.description'),
      details: t('sponsors.steps.monitorVerify.details', { returnObjects: true }) as string[],
      gradient: "from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))]"
    }
  ];

  const userSteps = [
    {
      icon: Wallet,
      title: t('users.steps.connectWallet.title'),
      description: t('users.steps.connectWallet.description'),
      details: t('users.steps.connectWallet.details', { returnObjects: true }) as string[],
      gradient: "from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))]"
    },
    {
      icon: Search,
      title: t('users.steps.discoverQuests.title'),
      description: t('users.steps.discoverQuests.description'),
      details: t('users.steps.discoverQuests.details', { returnObjects: true }) as string[],
      gradient: "from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))]"
    },
    {
      icon: CheckCircle,
      title: t('users.steps.completeTasks.title'),
      description: t('users.steps.completeTasks.description'),
      details: t('users.steps.completeTasks.details', { returnObjects: true }) as string[],
      gradient: "from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-red))]"
    },
    {
      icon: Trophy,
      title: t('users.steps.claimRewards.title'),
      description: t('users.steps.claimRewards.description'),
      details: t('users.steps.claimRewards.details', { returnObjects: true }) as string[],
      gradient: "from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))]"
    }
  ];

  const features = [
    {
      icon: Bot,
      title: t('features.items.automatedVerification.title'),
      description: t('features.items.automatedVerification.description'),
      gradient: "from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-red))]"
    },
    {
      icon: Shield,
      title: t('features.items.zeroKnowledgePrivacy.title'),
      description: t('features.items.zeroKnowledgePrivacy.description'),
      gradient: "from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-pink))]"
    },
    {
      icon: Activity,
      title: t('features.items.transparentVerifiable.title'),
      description: t('features.items.transparentVerifiable.description'),
      gradient: "from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))]"
    },
    {
      icon: Layers,
      title: t('features.items.multiPlatformIntegration.title'),
      description: t('features.items.multiPlatformIntegration.description'),
      gradient: "from-[hsl(var(--vibrant-yellow))] to-[hsl(var(--vibrant-orange))]"
    }
  ];

  const faqs = [
    {
      question: t('faq.items.whatIsProofQuest.question'),
      answer: t('faq.items.whatIsProofQuest.answer')
    },
    {
      question: t('faq.items.howToGetStarted.question'),
      answer: t('faq.items.howToGetStarted.answer')
    },
    {
      question: t('faq.items.questTypes.question'),
      answer: t('faq.items.questTypes.answer')
    },
    {
      question: t('faq.items.rewardDistribution.question'),
      answer: t('faq.items.rewardDistribution.answer')
    },
    {
      question: t('faq.items.dataPrivacy.question'),
      answer: t('faq.items.dataPrivacy.answer')
    },
    {
      question: t('faq.items.monadTestnet.question'),
      answer: t('faq.items.monadTestnet.answer')
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
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 text-white hover:bg-white/20 border-white/30 font-semibold"
                onClick={() => setActiveTab("sponsors")}
              >
                <Target className="h-5 w-5 mr-2" />
                {t('hero.sponsorButton')}
              </Button>
              <Button 
                size="lg" 
                className="bg-white text-[hsl(var(--vibrant-blue))] hover:bg-white/90 font-semibold"
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-5 w-5 mr-2" />
                {t('hero.userButton')}
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
              {t('sponsors.title')}
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="text-lg py-4 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--vibrant-blue))] data-[state=active]:to-[hsl(var(--vibrant-purple))] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-medium"
            >
              <Users className="h-5 w-5 mr-2" />
              {t('users.title')}
            </TabsTrigger>
          </TabsList>

          {/* Sponsors Guide */}
          <TabsContent value="sponsors" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('sponsors.title')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('sponsors.subtitle')}
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
                              {t('common.stepLabel')} {index + 1}
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
                  {t('sponsors.cta')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Users Guide */}
          <TabsContent value="users" className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('users.title')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('users.subtitle')}
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
                              {t('common.stepLabel')} {index + 1}
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
                          {/* Add Primus extension button for Complete Tasks step */}
                          {index === 2 && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-[hsl(var(--vibrant-blue))]/10 to-[hsl(var(--vibrant-purple))]/10 border border-[hsl(var(--vibrant-blue))]/20 rounded-lg">
                              <p className="text-sm text-muted-foreground mb-3">
                                {t('users.steps.completeTasks.primusNote')}
                              </p>
                              <a 
                                href={t('primus.chromeStoreUrl')}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-sm"
                              >
                                <Download className="h-4 w-4" />
                                {t('primus.installButton')}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
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
                  {t('users.cta')}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        {/* Key Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features.subtitle')}
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

        {/* Platform Partners Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('partners.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('partners.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Primus Section */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-[hsl(var(--vibrant-blue))]/5 to-[hsl(var(--vibrant-purple))]/5">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white">
                    <Bot className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Primus Labs</h3>
                    <p className="text-muted-foreground">{t('partners.primus.tagline')}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-foreground leading-relaxed">
                    {t('partners.primus.description')}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-lg">{t('partners.primus.keyFeatures')}</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[hsl(var(--vibrant-blue))]" />
                      <span>{t('partners.primus.feature1')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[hsl(var(--vibrant-blue))]" />
                      <span>{t('partners.primus.feature2')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[hsl(var(--vibrant-blue))]" />
                      <span>{t('partners.primus.feature3')}</span>
                    </li>
                  </ul>
                </div>

                <a 
                  href="https://primuslabs.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('partners.primus.visitWebsite')}
                </a>
              </CardContent>
            </Card>

            {/* Monad Section */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-[hsl(var(--vibrant-green))]/5 to-[hsl(var(--vibrant-teal))]/5">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-teal))] text-white">
                    <Layers className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Monad</h3>
                    <p className="text-muted-foreground">{t('partners.monad.tagline')}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-foreground leading-relaxed">
                    {t('partners.monad.description')}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-lg">{t('partners.monad.keyFeatures')}</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[hsl(var(--vibrant-green))]" />
                      <span>{t('partners.monad.feature1')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-[hsl(var(--vibrant-green))]" />
                      <span>{t('partners.monad.feature2')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[hsl(var(--vibrant-green))]" />
                      <span>{t('partners.monad.feature3')}</span>
                    </li>
                  </ul>
                </div>

                <a 
                  href="https://www.monad.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('partners.monad.visitWebsite')}
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Dependency Note */}
          <Card className="border-0 bg-gradient-to-r from-[hsl(var(--vibrant-orange))]/10 to-[hsl(var(--vibrant-yellow))]/10 border-[hsl(var(--vibrant-orange))]/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))] text-white">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">{t('partners.dependency.title')}</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('partners.dependency.description')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('faq.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('faq.subtitle')}
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
              <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/quests">
                  <Button size="lg" className="bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white font-semibold">
                    {t('cta.browseQuests')}
                    <Zap className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/create">
                  <Button size="lg" variant="outline" className="font-semibold">
                    {t('cta.createQuest')}
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
              <h2 className="text-2xl font-bold mb-4">{t('contact.title')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('contact.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://x.com/coder_chao" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Twitter className="h-5 w-5" />
                  @coder_chao
                </a>
                <a 
                  href="https://x.com/Miles082510" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-teal))] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                >
                  <Twitter className="h-5 w-5" />
                  @Miles082510
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