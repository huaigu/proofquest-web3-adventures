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
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Form schema for validation
const questSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  questType: z.enum(["twitter-interaction", "quote-tweet", "send-tweet"]),
  // Twitter interaction specific
  interactionType: z.enum(["like", "retweet", "comment", "follow"]).optional(),
  targetAccount: z.string().optional(),
  tweetUrl: z.string().optional(),
  // Quote tweet specific
  quoteTweetUrl: z.string().optional(),
  quoteRequirements: z.string().optional(),
  // Send tweet specific
  contentRequirements: z.string().optional(),
  // Step 2 - Threshold configuration
  participantThreshold: z.number().min(1, "Participant threshold must be at least 1").optional(),
  // Step 2 - Reward configuration
  rewardType: z.enum(["ETH", "ERC20", "NFT"]),
  tokenAddress: z.string().optional(),
  tokenSymbol: z.string().optional(),
  totalRewardPool: z.number().min(0.001, "Reward pool must be greater than 0"),
  rewardPerParticipant: z.number().min(0.001, "Reward per participant must be greater than 0"),
  distributionMethod: z.enum(["immediate", "linear"]),
  linearPeriod: z.number().optional(),
  unlockTime: z.date().optional(),
  // Step 3 - Time configuration
  startDate: z.date(),
  endDate: z.date(),
  rewardClaimDeadline: z.date(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to terms")
});

type QuestFormData = z.infer<typeof questSchema>;

const CreateQuest = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<QuestFormData>({
    resolver: zodResolver(questSchema),
    defaultValues: {
      questType: "twitter-interaction",
      rewardType: "ETH",
      distributionMethod: "immediate",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      rewardClaimDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      agreeToTerms: false
    }
  });

  const formData = watch();
  const maxParticipants = formData.totalRewardPool && formData.rewardPerParticipant 
    ? Math.floor(formData.totalRewardPool / formData.rewardPerParticipant) 
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

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: QuestFormData) => {
    setIsDeploying(true);
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast({
      title: "Quest deployed successfully!",
      description: "Your quest is now live and accepting participants.",
    });
    
    // Clear draft
    localStorage.removeItem('questDraft');
    setIsDeploying(false);
    setCurrentStep(6); // Success step
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

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6 relative">
            {[
              { num: 1, title: "Basic Info", color: "from-[hsl(var(--vibrant-blue))] to-[hsl(var(--vibrant-purple))]" },
              { num: 2, title: "Task Type", color: "from-[hsl(var(--vibrant-orange))] to-[hsl(var(--vibrant-yellow))]" },
              { num: 3, title: "Rewards", color: "from-[hsl(var(--vibrant-green))] to-[hsl(var(--vibrant-blue))]" },
              { num: 4, title: "Timing", color: "from-[hsl(var(--vibrant-pink))] to-[hsl(var(--vibrant-purple))]" },
              { num: 5, title: "Review", color: "from-[hsl(var(--vibrant-cyan))] to-[hsl(var(--vibrant-blue))]" }
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
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-w-6xl mx-auto">
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
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-4">
                            <Label>Required Actions *</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {[
                                { id: "like", label: "Like", icon: Heart },
                                { id: "retweet", label: "Retweet", icon: Repeat2 },
                                { id: "quote", label: "Quote Tweet", icon: MessageCircle }
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
                          {formData.requiredActions?.includes("quote") && (
                            <div className="space-y-2">
                              <Label htmlFor="quoteContent">Quote Content Requirements</Label>
                              <Controller
                                name="quoteContent"
                                control={control}
                                render={({ field }) => (
                                  <Textarea
                                    {...field}
                                    placeholder="Describe what the quote tweet should contain"
                                    rows={3}
                                    value={field.value || ""}
                                  />
                                )}
                              />
                            </div>
                          )}
                        </>
                      )}

                      {/* Content Creation Configuration */}
                      {formData.questType === "content-creation" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="contentTopic">Content Topic/Theme *</Label>
                            <Controller
                              name="contentTopic"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="e.g., DeFi, NFTs, Web3"
                                  value={field.value || ""}
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="minWordCount">Minimum Word Count</Label>
                            <Controller
                              name="minWordCount"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  {...field}
                                  placeholder="500"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="requiredKeywords">Required Keywords (comma-separated)</Label>
                            <Controller
                              name="requiredKeywords"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="blockchain, cryptocurrency, DeFi"
                                  value={field.value || ""}
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="aiCriteria">AI Judgment Criteria</Label>
                            <Controller
                              name="aiCriteria"
                              control={control}
                              render={({ field }) => (
                                <Textarea
                                  {...field}
                                  placeholder="Describe how AI should evaluate the content quality"
                                  rows={3}
                                  value={field.value || ""}
                                />
                              )}
                            />
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
                        <Label htmlFor="participantThreshold">Maximum Participants</Label>
                        <Controller
                          name="participantThreshold"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              {...field}
                              placeholder="100"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                            />
                          )}
                        />
                        <p className="text-sm text-muted-foreground">
                          Leave empty for unlimited participants
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="totalRewardPool">Total Reward Pool *</Label>
                          <Controller
                            name="totalRewardPool"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.001"
                                {...field}
                                placeholder="1.0"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                                className={errors.totalRewardPool ? "border-destructive" : ""}
                              />
                            )}
                          />
                          {errors.totalRewardPool && (
                            <p className="text-sm text-destructive">{errors.totalRewardPool.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rewardPerParticipant">Reward per Participant *</Label>
                          <Controller
                            name="rewardPerParticipant"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.001"
                                {...field}
                                placeholder="0.01"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                                className={errors.rewardPerParticipant ? "border-destructive" : ""}
                              />
                            )}
                          />
                          {errors.rewardPerParticipant && (
                            <p className="text-sm text-destructive">{errors.rewardPerParticipant.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Max Participants Display */}
                      {maxParticipants > 0 && (
                        <div className="bg-[hsl(var(--vibrant-blue))]/5 border border-[hsl(var(--vibrant-blue))]/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calculator className="h-4 w-4 text-[hsl(var(--vibrant-blue))]" />
                            <span className="font-medium">Maximum Participants: {maxParticipants}</span>
                          </div>
                        </div>
                      )}

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
                                {...field}
                                placeholder="30"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
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
                          <p className="font-medium">
                            {maxParticipants > 0 ? maxParticipants : "Unlimited"}
                            {maxParticipants > 0 && (
                              <span className="text-sm text-muted-foreground ml-2">
                                (Based on reward pool)
                              </span>
                            )}
                          </p>
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
                            {formData.rewardPerParticipant} {formData.rewardType}
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

          </div>

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
                  type="submit"
                  disabled={isDeploying}
                  className="bg-[hsl(var(--vibrant-green))] hover:bg-[hsl(var(--vibrant-green))]/90"
                >
                  {isDeploying ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Deploying...
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