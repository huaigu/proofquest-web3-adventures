import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
  CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Twitter, 
  FileText, 
  Heart, 
  MessageCircle,
  Repeat2,
  Coins,
  Clock,
  TrendingUp,
  Eye,
  Calculator,
  AlertCircle,
  Save,
  Rocket,
  Shield,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCreateQuest } from "@/hooks/useQuests";
import { useAuthUI } from "@/hooks/useAuth";
import type { QuestFormData } from "@/types";
import { createLikeAndRetweetQuest } from "@/lib/questContract";
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';

// Form schema for validation (matching QuestFormData interface)
const questSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  launch_page: z.string().optional(), // Will be populated automatically from tweet URLs
  questType: z.enum(["twitter-interaction", "quote-tweet", "send-tweet"]),
  // Twitter interaction specific
  interactionType: z.enum(["like", "retweet", "comment", "follow"]).optional(),
  targetAccount: z.string().optional(),
  tweetUrl: z.string().optional(),
  // Quote tweet specific
  quoteTweetUrl: z.string().optional(),
  // Send tweet specific
  tweetContent: z.string().optional(),
  requiredHashtags: z.array(z.string()).optional(),
  // Smart contract integration
  requiredActions: z.array(z.string()).optional(),
  // Step 2 - Reward configuration
  rewardType: z.enum(["ETH", "ERC20", "NFT"]),
  totalRewardPool: z.number().min(0.001, "Reward pool must be greater than 0"),
  rewardPerParticipant: z.number().optional(),
  distributionMethod: z.enum(["immediate", "manual", "scheduled", "linear"]),
  linearPeriod: z.number().optional(),
  // Step 3 - Time and settings configuration
  startDate: z.date(),
  endDate: z.date(),
  rewardClaimDeadline: z.date(),
  maxParticipants: z.number().min(1, "Must allow at least 1 participant"),
  requireWhitelist: z.boolean(),
  autoApproveSubmissions: z.boolean(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to terms")
}).refine((data) => {
  return data.endDate > data.startDate;
}, {
  message: "Quest End Date must be after Quest Start Date",
  path: ["endDate"]
}).refine((data) => {
  // 验证Twitter Interaction类型需要Tweet URL
  if (data.questType === "twitter-interaction") {
    return data.tweetUrl && data.tweetUrl.trim().length > 0;
  }
  return true;
}, {
  message: "Tweet URL is required for Twitter Interaction quests",
  path: ["tweetUrl"]
}).refine((data) => {
  // 验证Quote Tweet类型需要Quote Tweet URL
  if (data.questType === "quote-tweet") {
    return data.quoteTweetUrl && data.quoteTweetUrl.trim().length > 0;
  }
  return true;
}, {
  message: "Original Tweet URL is required for Quote Tweet quests",
  path: ["quoteTweetUrl"]
});

const CreateQuest = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Backend integration
  const createQuestMutation = useCreateQuest();
  const authUI = useAuthUI();
  const { isAuthenticated } = authUI;
  const handleSignIn = authUI.authButtonState.action || (() => Promise.resolve(false));

  // Wallet integration for smart contract calls
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // State for smart contract deployment
  const [isDeploying, setIsDeploying] = useState(false);

  const { control, handleSubmit, watch, setValue, getValues, trigger, formState: { errors } } = useForm<QuestFormData>({
    resolver: zodResolver(questSchema),
    defaultValues: {
      title: "",
      description: "",
      launch_page: "",
      questType: "twitter-interaction",
      interactionType: undefined,
      targetAccount: "",
      tweetUrl: "",
      quoteTweetUrl: "",
      tweetContent: "",
      requiredHashtags: [],

      rewardType: "ETH",
      totalRewardPool: 0.1,
      rewardPerParticipant: undefined,
      distributionMethod: "immediate",

      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      rewardClaimDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      maxParticipants: 10,
      requireWhitelist: false,
      autoApproveSubmissions: true,
      agreeToTerms: false
    }
  });

  const formData = watch();
  const rewardPerParticipant = formData.totalRewardPool && formData.maxParticipants 
    ? Math.floor((formData.totalRewardPool / formData.maxParticipants) * 1000) / 1000 // Round to 3 decimal places
    : 0;

  // Save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('questDraft', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('questDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        Object.keys(draft).forEach(key => {
          if (draft[key] !== undefined) {
            setValue(key as keyof QuestFormData, draft[key]);
          }
        });
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [setValue]);

  // 同步相应的URL字段到launch_page
  useEffect(() => {
    const questType = formData.questType;
    if (questType === 'twitter-interaction' && formData.tweetUrl) {
      setValue('launch_page', formData.tweetUrl);
    } else if (questType === 'quote-tweet' && formData.quoteTweetUrl) {
      setValue('launch_page', formData.quoteTweetUrl);
    }
  }, [formData.questType, formData.tweetUrl, formData.quoteTweetUrl, setValue]);

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Handle smart contract deployment
  const handleDeployQuest = async (data: QuestFormData) => {
    console.log('🚀 Deploying quest to smart contract:', data);

    // Check wallet connection
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to deploy the quest.",
        variant: "destructive"
      });
      return;
    }

    // Check if on correct network (Sepolia for testing)
    const targetChainId = 11155111; // Sepolia
    if (chainId !== targetChainId) {
      try {
        await switchChain({ chainId: targetChainId });
      } catch (error) {
        toast({
          title: "Network Switch Required",
          description: "Please switch to Sepolia network to deploy the quest.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsDeploying(true);

    try {
      // Convert form data to contract parameters
      const now = Math.floor(Date.now() / 1000);
      const startTime = Math.floor(data.startDate.getTime() / 1000);
      const endTime = Math.floor(data.endDate.getTime() / 1000);
      const claimEndTime = Math.floor(data.rewardClaimDeadline.getTime() / 1000);

      // For LikeAndRetweet quest, we need to determine required actions
      // Default to both like and retweet for now
      const requireFavorite = true;
      const requireRetweet = true;

      const contractParams = {
        title: data.title,
        launch_page: data.launch_page,
        description: data.description,
        totalRewards: data.totalRewardPool.toString(),
        rewardPerUser: rewardPerParticipant.toString(),
        startTime,
        endTime,
        claimEndTime,
        requireFavorite,
        requireRetweet,
        isVesting: false, // Simplified for now
        vestingDuration: 0 // No vesting for now
      };

      console.log('📝 Contract parameters:', contractParams);

      // Call the smart contract
      const hash = await createLikeAndRetweetQuest(contractParams);

      console.log('✅ Quest deployed successfully! Transaction hash:', hash);

      toast({
        title: "Quest Deployed Successfully!",
        description: `Transaction hash: ${hash.slice(0, 10)}...`,
      });

      // Clear draft on success
      localStorage.removeItem('questDraft');

      // Navigate to quest detail page (we'll need to get the quest ID from events)
      // For now, just navigate to quests list
      navigate('/quests');

    } catch (error: any) {
      console.error('❌ Quest deployment failed:', error);
      toast({
        title: "Quest Deployment Failed",
        description: error.message || "Failed to deploy quest to blockchain",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const onSubmit = async (data: QuestFormData) => {
    console.log('🚀 Form submitted with data:', data);
    console.log('🔐 Authentication status:', isAuthenticated);


    // Check authentication first
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, requesting sign-in');
      toast({
        title: "Authentication Required",
        description: "Please sign in with your wallet to create a quest.",
        variant: "destructive"
      });
      await handleSignIn();
      return;
    }

    try {
      console.log('✅ Creating quest via backend API...');
      // Create quest via backend API
      const createdQuest = await createQuestMutation.mutateAsync(data);
      console.log('✅ Quest created successfully:', createdQuest);

      // Clear draft on success
      localStorage.removeItem('questDraft');

      // Navigate to the created quest
      navigate(`/quest/${createdQuest.id}`);

    } catch (error: any) {
      console.error('❌ Quest creation failed:', error);
      // Error handling is done in the mutation hook
    }
  };

  const saveDraft = () => {
    localStorage.setItem('questDraft', JSON.stringify(formData));
    toast({
      title: "Draft saved!",
      description: "Your quest draft has been saved locally.",
    });
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Basic Information";
      case 2: return "Task Type & Configuration";
      case 3: return "Threshold & Reward Configuration";
      case 4: return "Time Configuration";
      case 5: return "Review & Deploy";
      case 6: return "Success!";
      default: return "";
    }
  };

  const questTypeOptions = [
    {
      value: "twitter-interaction",
      title: "Twitter Interaction", 
      description: "Users interact with tweets (like, retweet, comment, follow)",
      icon: Heart
    },
    {
      value: "quote-tweet",
      title: "Quote Tweet",
      description: "Users quote tweet with specific requirements",
      icon: MessageCircle
    },
    {
      value: "send-tweet",
      title: "Send Tweet",
      description: "Users create and send original tweets",
      icon: FileText
    }
  ];

  const interactionTypeOptions = [
    { value: "like", label: "Like", icon: Heart },
    { value: "retweet", label: "Retweet", icon: Repeat2 },
    { value: "comment", label: "Comment", icon: MessageCircle },
    { value: "follow", label: "Follow", icon: Twitter }
  ];

  if (currentStep === 6) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 bg-[hsl(var(--vibrant-green))]/10 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-[hsl(var(--vibrant-green))]" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Quest Deployed!</h1>
            <p className="text-muted-foreground mb-6">
              Your quest "{formData.title}" is now live and accepting participants.
            </p>
            <div className="space-y-3">
              <Button className="w-full bg-[hsl(var(--vibrant-blue))] hover:bg-[hsl(var(--vibrant-blue))]/90">
                View Quest
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/create'}>
                Create Another Quest
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-blue))] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Create New Quest</h1>
              <p className="text-white/80">Set up a quest for the ProofQuest community</p>
            </div>
          </div>
        </div>

        {/* Authentication Notice */}
        {!isAuthenticated && (
          <div className="mb-6">
            <Card className="border-yellow-500/50 bg-yellow-500/10">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-400">Authentication Required</h3>
                    <p className="text-sm text-muted-foreground">
                      You need to sign in with your wallet to create quests. You can still preview the form, but authentication is required to deploy.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignIn}
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 relative">
            {[
              { num: 1, title: "Basic Info", color: "from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))]" },
              { num: 2, title: "Task Type", color: "from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))]" },
              { num: 3, title: "Rewards", color: "from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))]" },
              { num: 4, title: "Timing", color: "from-[hsl(var(--vibrant-pink))] to-[hsl(var(--vibrant-purple))]" },
              { num: 5, title: "Review", color: "from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))]" }
            ].map((step, index) => (
              <div key={step.num} className="flex flex-col items-center flex-1 relative">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold mb-3 transition-all duration-200 relative z-10",
                  step.num <= currentStep 
                    ? `bg-gradient-to-br ${step.color} text-white shadow-lg scale-105` 
                    : "bg-muted text-muted-foreground border-2 border-border"
                )}>
                  {step.num < currentStep ? <Check className="h-5 w-5" /> : step.num}
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    step.num === currentStep ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.num}. {step.title}
                  </div>
                  {step.num === currentStep && (
                    <div className="text-xs text-[hsl(var(--vibrant-blue))] font-medium">
                      {getStepTitle()}
                    </div>
                  )}
                </div>
                {/* Connection Line */}
                {index < 4 && (
                  <div className={cn(
                    "absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2 z-0",
                    step.num < currentStep 
                      ? `bg-gradient-to-r ${step.color}` 
                      : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="relative">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[hsl(var(--vibrant-blue))] via-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-pink))] transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[hsl(var(--vibrant-blue))]/10 via-[hsl(var(--vibrant-orange))]/10 to-[hsl(var(--vibrant-pink))]/10 rounded-full" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log('❌ Form validation errors:', errors);
          toast({
            title: "Form Validation Failed",
            description: "Please check the required fields and try again.",
            variant: "destructive"
          });
        })}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quest Details</CardTitle>
                    <CardDescription>Provide basic information about your quest</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quest Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Quest Title *</Label>
                      <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Enter quest title"
                            className={errors.title ? "border-destructive" : ""}
                          />
                        )}
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            placeholder="Describe what participants need to do"
                            rows={4}
                            className={errors.description ? "border-destructive" : ""}
                          />
                        )}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description.message}</p>
                      )}
                    </div>

                  </CardContent>
                </Card>
              )}

              {/* Step 2: Task Type & Configuration */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Task Type & Configuration</CardTitle>
                    <CardDescription>Choose the type of quest and configure its requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quest Type */}
                    <div className="space-y-4">
                      <Label>Quest Type *</Label>
                      <Controller
                        name="questType"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup value={field.value} onValueChange={field.onChange}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {questTypeOptions.filter(option => option.value !== "send-tweet").map((option) => {
                                const IconComponent = option.icon;
                                return (
                                  <Label
                                    key={option.value}
                                    htmlFor={option.value}
                                    className="cursor-pointer"
                                  >
                                    <RadioGroupItem
                                      value={option.value}
                                      id={option.value}
                                      className="sr-only"
                                    />
                                    <div className={cn(
                                      "border rounded-lg p-4 transition-all hover:border-[hsl(var(--vibrant-blue))]/50 h-full min-h-[100px] flex flex-col",
                                      field.value === option.value 
                                        ? "border-[hsl(var(--vibrant-blue))] bg-[hsl(var(--vibrant-blue))]/5" 
                                        : "border-border"
                                    )}>
                                      <div className="flex items-center gap-3 mb-2">
                                        <IconComponent className="h-5 w-5 text-[hsl(var(--vibrant-blue))]" />
                                        <h4 className="font-medium">{option.title}</h4>
                                      </div>
                                      <p className="text-sm text-muted-foreground flex-1">{option.description}</p>
                                    </div>
                                  </Label>
                                );
                              })}
                              
                              {/* Disabled Send Tweet Option */}
                              <div className="opacity-50 cursor-not-allowed">
                                <div className="border rounded-lg p-4 border-border bg-muted/30 h-full min-h-[100px] flex flex-col">
                                  <div className="flex items-center gap-3 mb-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <h4 className="font-medium text-muted-foreground">Send Tweet</h4>
                                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground flex-1">Users create and send original tweets</p>
                                </div>
                              </div>
                            </div>
                          </RadioGroup>
                        )}
                      />
                    </div>

                      {/* Twitter Interaction Configuration */}
                      {formData.questType === "twitter-interaction" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="tweetUrl">Tweet URL *</Label>
                            <Controller
                              name="tweetUrl"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="https://twitter.com/..."
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    // 同步到launch_page字段
                                    setValue('launch_page', e.target.value);
                                  }}
                                  className={errors.tweetUrl ? "border-destructive" : ""}
                                />
                              )}
                            />
                            {errors.tweetUrl && (
                              <p className="text-sm text-destructive">{errors.tweetUrl.message}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              This URL will be used as the launch page for participants to interact with
                            </p>
                          </div>
                          <div className="space-y-4">
                            <Label>Required Actions *</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { id: "like", label: "Like", icon: Heart },
                                { id: "retweet", label: "Retweet", icon: Repeat2 }
                              ].map((action) => {
                                const IconComponent = action.icon;
                                return (
                                  <Controller
                                    key={action.id}
                                    name="requiredActions"
                                    control={control}
                                    render={({ field }) => (
                                      <Label className="cursor-pointer">
                                        <div className="flex items-center space-x-2 border rounded-lg p-3">
                                          <Checkbox
                                            checked={(field.value || []).includes(action.id)}
                                            onCheckedChange={(checked) => {
                                              const currentActions = field.value || [];
                                              if (checked) {
                                                field.onChange([...currentActions, action.id]);
                                              } else {
                                                field.onChange(currentActions.filter(a => a !== action.id));
                                              }
                                            }}
                                          />
                                          <IconComponent className="h-4 w-4" />
                                          <span className="text-sm font-medium">{action.label}</span>
                                        </div>
                                      </Label>
                                    )}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Quote Tweet Configuration */}
                      {formData.questType === "quote-tweet" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="quoteTweetUrl">Original Tweet URL *</Label>
                            <Controller
                              name="quoteTweetUrl"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="https://twitter.com/..."
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    // 同步到launch_page字段
                                    setValue('launch_page', e.target.value);
                                  }}
                                  className={errors.quoteTweetUrl ? "border-destructive" : ""}
                                />
                              )}
                            />
                            {errors.quoteTweetUrl && (
                              <p className="text-sm text-destructive">{errors.quoteTweetUrl.message}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Enter the URL of the tweet you want participants to quote. This will be used as the launch page.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quoteRequirements">Required Hashtag</Label>
                            <Controller
                              name="quoteRequirements"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="Enter hashtag (e.g., #Web3, #DeFi, #ProofQuest)"
                                  value={field.value || ""}
                                />
                              )}
                            />
                            <p className="text-sm text-muted-foreground">
                              Optional: Enter one hashtag that must be included in the quote tweet
                            </p>
                          </div>
                        </>
                      )}

                  </CardContent>
                </Card>
              )}

              {/* Step 3: Threshold & Reward Configuration */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Threshold Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Threshold Configuration</CardTitle>
                      <CardDescription>Set participation limits</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="maxParticipants">Maximum Participants *</Label>
                        <Controller
                          name="maxParticipants"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              placeholder="100"
                              value={field.value?.toString() || ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              className={errors.maxParticipants ? "border-destructive" : ""}
                            />
                          )}
                        />
                        {errors.maxParticipants && (
                          <p className="text-sm text-destructive">{errors.maxParticipants.message}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Total number of participants allowed for this quest
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reward Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Reward Configuration</CardTitle>
                      <CardDescription>Set up rewards and distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Reward Type */}
                      <div className="space-y-4">
                        <Label>Reward Type *</Label>
                        <Controller
                          name="rewardType"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup value={field.value} onValueChange={field.onChange}>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* ETH Option - Enabled */}
                                <Label className="cursor-pointer">
                                  <RadioGroupItem value="ETH" className="sr-only" />
                                  <div className={cn(
                                    "border rounded-lg p-4 transition-all hover:border-[hsl(var(--vibrant-blue))]/50 h-full min-h-[80px] flex flex-col",
                                    field.value === "ETH" 
                                      ? "border-[hsl(var(--vibrant-blue))] bg-[hsl(var(--vibrant-blue))]/5" 
                                      : "border-border"
                                  )}>
                                    <div className="flex items-center gap-3 mb-2">
                                      <Coins className="h-5 w-5 text-[hsl(var(--vibrant-blue))]" />
                                      <h4 className="font-medium">ETH</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex-1">Native Ethereum token</p>
                                  </div>
                                </Label>

                                {/* ERC20 Option - Disabled */}
                                <div className="opacity-50 cursor-not-allowed">
                                  <div className="border rounded-lg p-4 border-border bg-muted/30 h-full min-h-[80px] flex flex-col">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Coins className="h-5 w-5 text-muted-foreground" />
                                      <h4 className="font-medium text-muted-foreground">ERC20 Token</h4>
                                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex-1">Custom ERC20 tokens</p>
                                  </div>
                                </div>

                                {/* NFT Option - Disabled */}
                                <div className="opacity-50 cursor-not-allowed">
                                  <div className="border rounded-lg p-4 border-border bg-muted/30 h-full min-h-[80px] flex flex-col">
                                    <div className="flex items-center gap-3 mb-2">
                                      <FileText className="h-5 w-5 text-muted-foreground" />
                                      <h4 className="font-medium text-muted-foreground">NFT</h4>
                                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground flex-1">Non-fungible token rewards</p>
                                  </div>
                                </div>
                              </div>
                            </RadioGroup>
                          )}
                        />
                      </div>


                      {/* Reward Amounts */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="totalRewardPool">Total Reward Pool *</Label>
                          <Controller
                            name="totalRewardPool"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="text"
                                inputMode="decimal"
                                placeholder="1.0"
                                value={field.value?.toString() || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Allow empty string, numbers, and decimal points
                                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                    field.onChange(value === "" ? undefined : Number(value) || undefined);
                                  }
                                }}
                                onBlur={(e) => {
                                  // Format the number on blur for better UX
                                  const value = e.target.value;
                                  if (value && !isNaN(Number(value))) {
                                    const formatted = Number(value);
                                    field.onChange(formatted);
                                  }
                                }}
                                className={errors.totalRewardPool ? "border-destructive" : ""}
                              />
                            )}
                          />
                          {errors.totalRewardPool && (
                            <p className="text-sm text-destructive">{errors.totalRewardPool.message}</p>
                          )}
                        </div>

                        {/* Calculated Reward per Participant Display */}
                        {rewardPerParticipant > 0 && (
                          <div className="bg-[hsl(var(--vibrant-green))]/5 border border-[hsl(var(--vibrant-green))]/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calculator className="h-4 w-4 text-[hsl(var(--vibrant-green))]" />
                              <span className="font-medium">Reward per Participant: {rewardPerParticipant} {formData.rewardType}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Calculated from Total Reward Pool ÷ Maximum Participants
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Distribution Method */}
                      <div className="space-y-4">
                        <Label>Distribution Method *</Label>
                        <Controller
                          name="distributionMethod"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup value={field.value} onValueChange={field.onChange}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Label className="cursor-pointer">
                                  <RadioGroupItem value="immediate" className="sr-only" />
                                  <div className={cn(
                                    "border rounded-lg p-3 transition-all h-full min-h-[90px] flex flex-col justify-center",
                                    field.value === "immediate" 
                                      ? "border-[hsl(var(--vibrant-blue))] bg-[hsl(var(--vibrant-blue))]/5" 
                                      : "border-border"
                                  )}>
                                    <div className="flex items-center gap-3">
                                      <Coins className="h-4 w-4 text-[hsl(var(--vibrant-green))]" />
                                      <div>
                                        <div className="font-medium">Immediate</div>
                                        <div className="text-sm text-muted-foreground">
                                          Rewards distributed instantly upon completion
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Label>
                                <Label className="cursor-pointer">
                                  <RadioGroupItem value="linear" className="sr-only" />
                                  <div className={cn(
                                    "border rounded-lg p-3 transition-all h-full min-h-[90px] flex flex-col justify-center",
                                    field.value === "linear" 
                                      ? "border-[hsl(var(--vibrant-blue))] bg-[hsl(var(--vibrant-blue))]/5" 
                                      : "border-border"
                                  )}>
                                    <div className="flex items-center gap-3">
                                      <TrendingUp className="h-4 w-4 text-[hsl(var(--vibrant-purple))]" />
                                      <div>
                                        <div className="font-medium">Linear Vesting</div>
                                        <div className="text-sm text-muted-foreground">
                                          Rewards are vested linearly over time
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                      </div>

                      {/* Linear Vesting Period */}
                      {formData.distributionMethod === "linear" && (
                        <div className="space-y-2">
                          <Label htmlFor="linearPeriod">Vesting Period (days)</Label>
                          <Controller
                            name="linearPeriod"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                placeholder="30"
                                value={field.value?.toString() || ""}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 4: Time Configuration */}
              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Time Configuration</CardTitle>
                    <CardDescription>Set up quest timing and deadlines</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quest Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quest Start Date *</Label>
                        <Controller
                          name="startDate"
                          control={control}
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Quest End Date *</Label>
                        <Controller
                          name="endDate"
                          control={control}
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                    errors.endDate && "border-destructive"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        {errors.endDate && (
                          <p className="text-sm text-destructive">{errors.endDate.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Reward Claim Deadline */}
                    <div className="space-y-2">
                      <Label>Reward Claim Deadline *</Label>
                      <Controller
                        name="rewardClaimDeadline"
                        control={control}
                        render={({ field }) => (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                      <p className="text-sm text-muted-foreground">
                        Participants must claim their rewards before this date
                      </p>
                    </div>
                    
                    {/* Unlock Time for Linear Vesting */}
                    {formData.distributionMethod === "linear" && (
                      <div className="space-y-2">
                        <Label>Unlock Start Time</Label>
                        <Controller
                          name="unlockTime"
                          control={control}
                          render={({ field }) => (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        <p className="text-sm text-muted-foreground">
                          When linear vesting should begin
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 5: Review & Deploy */}
              {currentStep === 5 && (
                <div className="space-y-6">

                  {/* Quest Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quest Details</CardTitle>
                      <CardDescription>Basic information and task requirements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                          <p className="font-medium">{formData.title}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Task Type</Label>
                          <p className="font-medium">
                            {questTypeOptions.find(opt => opt.value === formData.questType)?.title}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                          <p className="font-medium">{format(formData.startDate, "PPP")}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                          <p className="font-medium">{format(formData.endDate, "PPP")}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Claim Deadline</Label>
                          <p className="font-medium">{format(formData.rewardClaimDeadline, "PPP")}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                        <p className="text-sm">{formData.description}</p>
                      </div>
                      {formData.launch_page && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Launch Page URL</Label>
                          <p className="text-sm text-[hsl(var(--vibrant-blue))] break-all">{formData.launch_page}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quest Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quest Configuration</CardTitle>
                      <CardDescription>Task-specific requirements and conditions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Twitter Interaction Configuration */}
                      {formData.questType === "twitter-interaction" && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Interaction Type</Label>
                            <p className="font-medium capitalize">
                              {interactionTypeOptions.find(opt => opt.value === formData.interactionType)?.label || formData.interactionType}
                            </p>
                          </div>
                          {formData.interactionType === "follow" && formData.targetAccount && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Target Account</Label>
                              <p className="font-medium">{formData.targetAccount}</p>
                            </div>
                          )}
                          {formData.interactionType !== "follow" && formData.tweetUrl && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Tweet URL</Label>
                              <p className="font-medium text-[hsl(var(--vibrant-blue))] break-all">{formData.tweetUrl}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quote Tweet Configuration */}
                      {formData.questType === "quote-tweet" && (
                        <div className="space-y-3">
                          {formData.quoteTweetUrl && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Original Tweet URL</Label>
                              <p className="font-medium text-[hsl(var(--vibrant-blue))] break-all">{formData.quoteTweetUrl}</p>
                            </div>
                          )}
                          {formData.quoteRequirements && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Quote Requirements</Label>
                              <p className="text-sm">{formData.quoteRequirements}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Send Tweet Configuration */}
                      {formData.questType === "send-tweet" && formData.contentRequirements && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Content Requirements</Label>
                          <p className="text-sm">{formData.contentRequirements}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Threshold Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Threshold Configuration</CardTitle>
                      <CardDescription>Participant requirements and quest activation conditions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Minimum Participants</Label>
                          <p className="font-medium">
                            {formData.participantThreshold || "No minimum set"}
                            {formData.participantThreshold && (
                              <span className="text-sm text-muted-foreground ml-2">
                                (Quest activates when reached)
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Maximum Participants</Label>
                          <p className="font-medium">{formData.maxParticipants}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reward Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Reward Configuration</CardTitle>
                      <CardDescription>Reward details and distribution method</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Reward Type</Label>
                          <p className="font-medium">{formData.rewardType}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Distribution Method</Label>
                          <p className="font-medium capitalize">{formData.distributionMethod}</p>
                        </div>
                        {formData.rewardType === "ERC20" && (
                          <>
                            {formData.tokenAddress && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Token Address</Label>
                                <p className="font-medium text-xs break-all">{formData.tokenAddress}</p>
                              </div>
                            )}
                            {formData.tokenSymbol && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Token Symbol</Label>
                                <p className="font-medium">{formData.tokenSymbol}</p>
                              </div>
                            )}
                          </>
                        )}
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Total Reward Pool</Label>
                          <p className="font-medium text-[hsl(var(--vibrant-green))]">
                            {formData.totalRewardPool} {formData.rewardType}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Reward per Participant</Label>
                          <p className="font-medium">
                            {rewardPerParticipant} {formData.rewardType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            (Calculated: {formData.totalRewardPool} ÷ {formData.maxParticipants})
                          </p>
                        </div>
                        {formData.distributionMethod === "linear" && formData.linearPeriod && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Vesting Period</Label>
                            <p className="font-medium">{formData.linearPeriod} days</p>
                          </div>
                        )}
                        {formData.distributionMethod === "linear" && formData.unlockTime && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Unlock Start</Label>
                            <p className="font-medium">{format(formData.unlockTime, "PPP")}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cost Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cost Breakdown</CardTitle>
                      <CardDescription>Estimated costs for quest deployment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Reward Pool</span>
                          <span className="font-medium">
                            {formData.totalRewardPool} {formData.rewardType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Gas Fee</span>
                          <span className="font-medium">0.005 ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee (2%)</span>
                          <span className="font-medium">
                            {((formData.totalRewardPool || 0) * 0.02).toFixed(4)} {formData.rewardType}
                          </span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between font-bold">
                            <span>Total Cost</span>
                            <span className="text-[hsl(var(--vibrant-blue))]">
                              {((formData.totalRewardPool || 0) * 1.02).toFixed(4)} {formData.rewardType} + 0.005 ETH
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Terms Agreement */}
                  <Card>
                    <CardContent className="pt-6">
                      <Controller
                        name="agreeToTerms"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className={errors.agreeToTerms ? "border-destructive" : ""}
                            />
                            <div className="text-sm">
                              <p>
                                I agree to the{" "}
                                <a href="#" className="text-[hsl(var(--vibrant-blue))] hover:underline">
                                  Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="#" className="text-[hsl(var(--vibrant-blue))] hover:underline">
                                  Quest Creation Guidelines
                                </a>
                              </p>
                              {errors.agreeToTerms && (
                                <p className="text-destructive mt-1">{errors.agreeToTerms.message}</p>
                              )}
                            </div>
                          </div>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {/* Save Draft Button - Center */}
            <Button 
              type="button" 
              variant="ghost" 
              onClick={saveDraft}
              className="text-muted-foreground hover:text-foreground"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>

            <div className="flex gap-3">
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-[hsl(var(--vibrant-blue))] hover:bg-[hsl(var(--vibrant-blue))]/90"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isDeploying || !isConnected}
                  className="bg-[hsl(var(--vibrant-green))] hover:bg-[hsl(var(--vibrant-green))]/90"
                  onClick={async (e) => {
                    e.preventDefault();
                    console.log('🖱️ Deploy Quest button clicked!');

                    // Get current form data
                    const formData = getValues();
                    console.log('📋 Form data:', formData);

                    // For now, skip validation and use default values for testing
                    const testData = {
                      ...formData,
                      totalRewardPool: formData.totalRewardPool || 0.1,
                      rewardPerParticipant: rewardPerParticipant || 0.01,
                      startDate: formData.startDate || new Date(),
                      endDate: formData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                      rewardClaimDeadline: formData.rewardClaimDeadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                    };

                    console.log('📋 Test data:', testData);

                    // Deploy to smart contract
                    await handleDeployQuest(testData);
                  }}
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deploying to Blockchain...
                    </>
                  ) : !isConnected ? (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Connect Wallet to Deploy
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Deploy Quest
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuest;