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
  questType: z.enum(["twitter-follow", "twitter-interaction", "content-creation"]),
  startDate: z.date(),
  endDate: z.date(),
  // Step 2 fields - conditional validation
  targetAccount: z.string().optional(),
  followerThreshold: z.number().optional(),
  tweetUrl: z.string().optional(),
  requiredActions: z.array(z.string()).optional(),
  quoteContent: z.string().optional(),
  contentTopic: z.string().optional(),
  minWordCount: z.number().optional(),
  requiredKeywords: z.string().optional(),
  aiCriteria: z.string().optional(),
  rewardType: z.enum(["ETH", "ERC20", "NFT"]),
  tokenAddress: z.string().optional(),
  tokenSymbol: z.string().optional(),
  totalRewardPool: z.number().min(0.001, "Reward pool must be greater than 0"),
  rewardPerParticipant: z.number().min(0.001, "Reward per participant must be greater than 0"),
  distributionMethod: z.enum(["immediate", "delayed", "linear"]),
  delayDays: z.number().optional(),
  linearPeriod: z.number().optional(),
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
      questType: "twitter-follow",
      rewardType: "ETH",
      distributionMethod: "immediate",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      requiredActions: [],
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
    if (currentStep < 3) setCurrentStep(currentStep + 1);
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
    setCurrentStep(4); // Success step
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
      case 2: return "Configuration";
      case 3: return "Review & Deploy";
      case 4: return "Success!";
      default: return "";
    }
  };

  const questTypeOptions = [
    {
      value: "twitter-follow",
      title: "Twitter Follow",
      description: "Users follow a specific Twitter account",
      icon: Twitter
    },
    {
      value: "twitter-interaction",
      title: "Twitter Interaction", 
      description: "Users interact with a specific tweet",
      icon: Heart
    },
    {
      value: "content-creation",
      title: "Content Creation",
      description: "Users create original content",
      icon: FileText
    }
  ];

  if (currentStep === 4) {
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
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                  step <= currentStep 
                    ? "bg-[hsl(var(--vibrant-blue))] text-white" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {step < currentStep ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={cn(
                    "flex-1 h-1 mx-4",
                    step < currentStep ? "bg-[hsl(var(--vibrant-blue))]" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{getStepTitle()}</h2>
            <Progress value={(currentStep / 3) * 100} className="w-full mt-2" />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-6">
            {/* Main Content */}
            <div className="col-span-12 lg:col-span-8">
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

                    {/* Quest Type */}
                    <div className="space-y-4">
                      <Label>Quest Type *</Label>
                      <Controller
                        name="questType"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup value={field.value} onValueChange={field.onChange}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {questTypeOptions.map((option) => {
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
                                      "border rounded-lg p-4 transition-all hover:border-[hsl(var(--vibrant-blue))]/50",
                                      field.value === option.value 
                                        ? "border-[hsl(var(--vibrant-blue))] bg-[hsl(var(--vibrant-blue))]/5" 
                                        : "border-border"
                                    )}>
                                      <div className="flex items-center gap-3 mb-2">
                                        <IconComponent className="h-5 w-5 text-[hsl(var(--vibrant-blue))]" />
                                        <h4 className="font-medium">{option.title}</h4>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{option.description}</p>
                                    </div>
                                  </Label>
                                );
                              })}
                            </div>
                          </RadioGroup>
                        )}
                      />
                    </div>

                    {/* Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date *</Label>
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
                        <Label>End Date *</Label>
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
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Configuration */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Quest-specific Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quest Configuration</CardTitle>
                      <CardDescription>Configure quest-specific requirements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Twitter Follow Configuration */}
                      {formData.questType === "twitter-follow" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="targetAccount">Target Account *</Label>
                            <Controller
                              name="targetAccount"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="@username"
                                  value={field.value || ""}
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="followerThreshold">Minimum Followers (Optional)</Label>
                            <Controller
                              name="followerThreshold"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  {...field}
                                  placeholder="1000"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                                />
                              )}
                            />
                          </div>
                        </>
                      )}

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

                  {/* Reward Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Reward Configuration</CardTitle>
                      <CardDescription>Set up rewards and distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Reward Type */}
                      <div className="space-y-2">
                        <Label>Reward Type *</Label>
                        <Controller
                          name="rewardType"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reward type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ETH">ETH</SelectItem>
                                <SelectItem value="ERC20">ERC20 Token</SelectItem>
                                <SelectItem value="NFT">NFT</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      {/* ERC20 Token Details */}
                      {formData.rewardType === "ERC20" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tokenAddress">Token Contract Address *</Label>
                            <Controller
                              name="tokenAddress"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="0x..."
                                  value={field.value || ""}
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tokenSymbol">Token Symbol *</Label>
                            <Controller
                              name="tokenSymbol"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder="USDC"
                                  value={field.value || ""}
                                />
                              )}
                            />
                          </div>
                        </div>
                      )}

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
                                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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
                                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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
                              <div className="space-y-3">
                                <Label className="cursor-pointer">
                                  <RadioGroupItem value="immediate" className="sr-only" />
                                  <div className={cn(
                                    "border rounded-lg p-3 transition-all",
                                    field.value === "immediate" 
                                      ? "border-[hsl(var(--vibrant-blue))] bg-[hsl(var(--vibrant-blue))]/5" 
                                      : "border-border"
                                  )}>
                                    <div className="flex items-center gap-3">
                                      <Coins className="h-4 w-4 text-[hsl(var(--vibrant-green))]" />
                                      <div>
                                        <div className="font-medium">Immediate</div>
                                        <div className="text-sm text-muted-foreground">
                                          Rewards are distributed immediately after quest completion
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Label>

                                <Label className="cursor-pointer">
                                  <RadioGroupItem value="delayed" className="sr-only" />
                                  <div className={cn(
                                    "border rounded-lg p-3 transition-all",
                                    field.value === "delayed" 
                                      ? "border-[hsl(var(--vibrant-blue))] bg-[hsl(var(--vibrant-blue))]/5" 
                                      : "border-border"
                                  )}>
                                    <div className="flex items-center gap-3">
                                      <Clock className="h-4 w-4 text-[hsl(var(--vibrant-orange))]" />
                                      <div>
                                        <div className="font-medium">Delayed</div>
                                        <div className="text-sm text-muted-foreground">
                                          Rewards are distributed after a delay period
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Label>

                                <Label className="cursor-pointer">
                                  <RadioGroupItem value="linear" className="sr-only" />
                                  <div className={cn(
                                    "border rounded-lg p-3 transition-all",
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

                      {/* Delay/Vesting Period Inputs */}
                      {formData.distributionMethod === "delayed" && (
                        <div className="space-y-2">
                          <Label htmlFor="delayDays">Delay Period (days)</Label>
                          <Controller
                            name="delayDays"
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                placeholder="7"
                                value={field.value || ""}
                                onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                              />
                            )}
                          />
                        </div>
                      )}

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

              {/* Step 3: Review & Deploy */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Quest Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quest Summary</CardTitle>
                      <CardDescription>Review your quest details before deployment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                          <p className="font-medium">{formData.title}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                          <p className="font-medium">
                            {questTypeOptions.find(opt => opt.value === formData.questType)?.title}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                          <p className="font-medium">
                            {format(formData.startDate, "PPP")} - {format(formData.endDate, "PPP")}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Reward Type</Label>
                          <p className="font-medium">{formData.rewardType}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Total Pool</Label>
                          <p className="font-medium text-[hsl(var(--vibrant-green))]">
                            {formData.totalRewardPool} {formData.rewardType}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Per Participant</Label>
                          <p className="font-medium">
                            {formData.rewardPerParticipant} {formData.rewardType}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                        <p className="text-sm">{formData.description}</p>
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

            {/* Preview Panel */}
            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.title && (
                      <div>
                        <h3 className="font-semibold">{formData.title}</h3>
                        <Badge className="mt-1 bg-[hsl(var(--vibrant-blue))]/15 text-[hsl(var(--vibrant-blue))]">
                          {questTypeOptions.find(opt => opt.value === formData.questType)?.title}
                        </Badge>
                      </div>
                    )}

                    {formData.description && (
                      <p className="text-sm text-muted-foreground">
                        {formData.description}
                      </p>
                    )}

                    {formData.totalRewardPool && formData.rewardPerParticipant && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Reward Pool:</span>
                          <span className="font-medium text-[hsl(var(--vibrant-green))]">
                            {formData.totalRewardPool} {formData.rewardType}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Per Participant:</span>
                          <span className="font-medium">
                            {formData.rewardPerParticipant} {formData.rewardType}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Max Participants:</span>
                          <span className="font-medium">{maxParticipants}</span>
                        </div>
                      </div>
                    )}

                    {formData.startDate && formData.endDate && (
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>
                            {format(formData.startDate, "MMM d")} - {format(formData.endDate, "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Save Draft Button */}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={saveDraft}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-3">
              {currentStep < 3 ? (
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