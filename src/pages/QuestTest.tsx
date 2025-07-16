import { useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
// Conditional import to avoid initialization issues
import { useZKTLS } from '@/hooks/useZKTLS';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Heart,
  Repeat2,
  Trophy,
  Clock,
  ExternalLink,
  Shield,
  Zap
} from 'lucide-react';
import { 
  createLikeAndRetweetQuest,
  getQuest,
  getNextQuestId,
  claimReward,
  claimRewardWithAttestation,
  getAllQuests,
  hasUserQualified,
  QUEST_SYSTEM_ADDRESS,
  MOCK_ATTESTATION
} from '@/lib/questContract';

const QuestTest = () => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Safe initialization of ZKTLS hook
  let zktlsHook;
  try {
    zktlsHook = useZKTLS();
  } catch (error) {
    console.error('Failed to initialize useZKTLS:', error);
    zktlsHook = {
      isGenerating: false,
      attestation: null,
      error: 'ZKTLS initialization failed',
      generateProof: async () => null,
      validateProof: async () => false,
      clearAttestation: () => {},
      formatForContract: (att: any) => att
    };
  }

  const {
    isGenerating: isGeneratingProof,
    attestation,
    error: zktlsError,
    generateProof,
    validateProof,
    clearAttestation,
    formatForContract
  } = zktlsHook;

  // Form state
  const [formData, setFormData] = useState({
    totalRewards: '0.1',
    rewardPerUser: '0.01',
    requireFavorite: true,
    requireRetweet: true,
    isVesting: false,
    vestingDuration: 0
  });

  // Quest state
  const [questId, setQuestId] = useState<bigint | null>(null);
  const [questData, setQuestData] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Quest selection state
  const [allQuests, setAllQuests] = useState<any[]>([]);
  const [selectedQuestId, setSelectedQuestId] = useState<string>('');
  const [selectedQuestData, setSelectedQuestData] = useState<any>(null);
  const [isLoadingQuests, setIsLoadingQuests] = useState(false);
  const [userQualificationStatus, setUserQualificationStatus] = useState<{[key: string]: boolean}>({});
  
  // ZKTLS state
  const [enableZKTLS, setEnableZKTLS] = useState(false);
  const [proofGenerated, setProofGenerated] = useState(false);

  // Check if we're on Sepolia
  const isOnSepolia = chainId === 11155111;

  const handleSwitchToSepolia = async () => {
    try {
      await switchChain({ chainId: 11155111 });
    } catch (error) {
      console.error('Failed to switch to Sepolia:', error);
      toast({
        title: "Network Switch Failed",
        description: "Please manually switch to Sepolia network in your wallet.",
        variant: "destructive"
      });
    }
  };

  const handleCreateQuest = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive"
      });
      return;
    }

    if (!isOnSepolia) {
      toast({
        title: "Wrong network",
        description: "Please switch to Sepolia network.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now;
      const endTime = now + 7 * 24 * 60 * 60; // 7 days
      const claimEndTime = now + 14 * 24 * 60 * 60; // 14 days

      const hash = await createLikeAndRetweetQuest({
        totalRewards: formData.totalRewards,
        rewardPerUser: formData.rewardPerUser,
        startTime,
        endTime,
        claimEndTime,
        requireFavorite: formData.requireFavorite,
        requireRetweet: formData.requireRetweet,
        isVesting: formData.isVesting,
        vestingDuration: formData.vestingDuration
      });

      toast({
        title: "Quest Created!",
        description: `Transaction hash: ${hash}`,
      });

      // Get the quest ID (should be the next available ID)
      const nextId = await getNextQuestId();
      const createdQuestId = nextId - 1n; // The ID that was just created
      setQuestId(createdQuestId);

      // Fetch quest data
      await fetchQuestData(createdQuestId);

    } catch (error: any) {
      console.error('Quest creation failed:', error);
      toast({
        title: "Quest Creation Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const fetchQuestData = async (id: bigint) => {
    setIsLoading(true);
    try {
      const quest = await getQuest(id);
      setQuestData(quest);
    } catch (error) {
      console.error('Failed to fetch quest data:', error);
      toast({
        title: "Failed to fetch quest data",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async () => {
    if (!questId || !address) return;

    setIsClaiming(true);
    try {
      const hash = await claimReward(questId, address);

      toast({
        title: "Reward Claimed!",
        description: `Transaction hash: ${hash}`,
      });

      // Refresh quest data
      await fetchQuestData(questId);

    } catch (error: any) {
      console.error('Reward claim failed:', error);
      toast({
        title: "Reward Claim Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsClaiming(false);
    }
  };

  // Load all quests
  const loadAllQuests = async () => {
    setIsLoadingQuests(true);
    try {
      const { quests, totalCount } = await getAllQuests(50);
      setAllQuests(quests);
      
      // Check user qualification status for each quest
      if (address && quests.length > 0) {
        const qualificationStatus: {[key: string]: boolean} = {};
        
        for (const quest of quests) {
          try {
            const hasQualified = await hasUserQualified(quest.id, address);
            qualificationStatus[quest.id.toString()] = hasQualified;
          } catch (error) {
            console.error(`Error checking qualification for quest ${quest.id}:`, error);
            qualificationStatus[quest.id.toString()] = false;
          }
        }
        
        setUserQualificationStatus(qualificationStatus);
      }

      toast({
        title: "Quests Loaded",
        description: `Found ${quests.length} quests`,
      });

    } catch (error: any) {
      console.error('Failed to load quests:', error);
      toast({
        title: "Failed to Load Quests",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoadingQuests(false);
    }
  };

  // Handle quest selection
  const handleQuestSelection = async (questIdString: string) => {
    setSelectedQuestId(questIdString);
    
    if (questIdString) {
      const questId = BigInt(questIdString);
      await fetchQuestData(questId);
      setSelectedQuestData(questData);
    } else {
      setSelectedQuestData(null);
    }
  };

  // Claim reward for selected quest
  const handleClaimSelectedReward = async () => {
    if (!selectedQuestId || !address) return;

    const questId = BigInt(selectedQuestId);
    setIsClaiming(true);
    try {
      const hash = await claimReward(questId, address);

      toast({
        title: "Reward Claimed!",
        description: `Transaction hash: ${hash}`,
      });

      // Refresh quest data and reload all quests
      await fetchQuestData(questId);
      await loadAllQuests();

    } catch (error: any) {
      console.error('Reward claim failed:', error);
      toast({
        title: "Reward Claim Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsClaiming(false);
    }
  };

  // Generate ZKTLS proof
  const handleGenerateZKTLSProof = async (questId: string) => {
    if (!address || !questId) return;

    try {
      const launchPage = `https://x.com/monad_xyz/status/1942933687978365289?quest=${questId}&user=${address}`;
      const result = await generateProof(questId, launchPage);
      
      if (result) {
        setProofGenerated(true);
        toast({
          title: "ZKTLS Proof Generated!",
          description: "Proof has been generated successfully. You can now claim your reward.",
        });
      }
    } catch (error: any) {
      console.error('ZKTLS proof generation failed:', error);
      toast({
        title: "Proof Generation Failed",
        description: error.message || "Failed to generate ZKTLS proof",
        variant: "destructive"
      });
    }
  };

  // Handle claim reward with ZKTLS proof
  const handleClaimRewardWithZKTLS = async (questId: bigint) => {
    if (!address || !attestation) return;

    setIsClaiming(true);
    try {
      // Format attestation for contract
      const formattedAttestation = formatForContract(attestation);
      
      // Use the claimRewardWithAttestation function
      const hash = await claimRewardWithAttestation(questId, formattedAttestation);

      toast({
        title: "Reward Claimed with ZKTLS Proof!",
        description: `Transaction hash: ${hash}`,
      });

      // Clear the attestation and refresh quest data
      clearAttestation();
      setProofGenerated(false);
      if (questId === (questId)) {
        await fetchQuestData(questId);
      }
      await loadAllQuests();

    } catch (error: any) {
      console.error('Reward claim with ZKTLS failed:', error);
      toast({
        title: "Reward Claim Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const maxParticipants = formData.totalRewards && formData.rewardPerUser 
    ? Math.floor(Number(formData.totalRewards) / Number(formData.rewardPerUser))
    : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-[hsl(var(--vibrant-purple))] to-[hsl(var(--vibrant-blue))] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Quest System Test</h1>
              <p className="text-white/80">Test LikeAndRetweet quest creation and claiming on Sepolia</p>
            </div>
          </div>
        </div>

        {/* Network Status */}
        <div className="mb-6">
          <Alert className={isOnSepolia ? "border-green-500/50 bg-green-500/10" : "border-yellow-500/50 bg-yellow-500/10"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isOnSepolia ? (
                <span className="text-green-400">Connected to Sepolia network</span>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400">Please switch to Sepolia network</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwitchToSepolia}
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                  >
                    Switch to Sepolia
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>

        {/* ZKTLS Mode Toggle */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                ZKTLS Proof Mode
              </CardTitle>
              <CardDescription>
                Enable real ZKTLS proof generation instead of mock attestation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableZKTLS"
                  checked={enableZKTLS}
                  onCheckedChange={(checked) => setEnableZKTLS(checked as boolean)}
                />
                <Label htmlFor="enableZKTLS" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Use ZKTLS Real Proof Generation
                </Label>
              </div>
              
              {zktlsError && (
                <Alert className="mt-4 border-red-500/50 bg-red-500/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    ZKTLS Error: {zktlsError}
                  </AlertDescription>
                </Alert>
              )}
              
              {attestation && (
                <Alert className="mt-4 border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-400">
                    ZKTLS Proof Generated Successfully
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contract Info */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Contract Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">QuestSystem Address</Label>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">{QUEST_SYSTEM_ADDRESS}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://sepolia.etherscan.io/address/${QUEST_SYSTEM_ADDRESS}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Target Tweet ID</Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded">1942933687978365289</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Quest */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Create LikeAndRetweet Quest
              </CardTitle>
              <CardDescription>
                Create a test quest for like and retweet verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalRewards">Total Rewards (ETH)</Label>
                  <Input
                    id="totalRewards"
                    type="number"
                    step="0.001"
                    value={formData.totalRewards}
                    onChange={(e) => handleInputChange('totalRewards', e.target.value)}
                    placeholder="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="rewardPerUser">Reward Per User (ETH)</Label>
                  <Input
                    id="rewardPerUser"
                    type="number"
                    step="0.001"
                    value={formData.rewardPerUser}
                    onChange={(e) => handleInputChange('rewardPerUser', e.target.value)}
                    placeholder="0.01"
                  />
                </div>
              </div>

              {maxParticipants > 0 && (
                <div className="bg-[hsl(var(--vibrant-blue))]/5 border border-[hsl(var(--vibrant-blue))]/20 rounded-lg p-3">
                  <p className="text-sm font-medium">Max Participants: {maxParticipants}</p>
                </div>
              )}

              <div className="space-y-3">
                <Label>Required Actions</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireFavorite"
                      checked={formData.requireFavorite}
                      onCheckedChange={(checked) => handleInputChange('requireFavorite', checked)}
                    />
                    <Label htmlFor="requireFavorite" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Require Like/Favorite
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireRetweet"
                      checked={formData.requireRetweet}
                      onCheckedChange={(checked) => handleInputChange('requireRetweet', checked)}
                    />
                    <Label htmlFor="requireRetweet" className="flex items-center gap-2">
                      <Repeat2 className="h-4 w-4" />
                      Require Retweet
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateQuest}
                disabled={isCreating || !isConnected || !isOnSepolia}
                className="w-full bg-[hsl(var(--vibrant-green))] hover:bg-[hsl(var(--vibrant-green))]/90"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Quest...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Create Quest
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quest Details & Claim */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Created Quest Details
              </CardTitle>
              <CardDescription>
                View newly created quest and claim rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {questId && questData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Quest ID</Label>
                      <p className="font-mono text-sm">{questId.toString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge variant="outline" className="ml-2">
                        {questData.status === 0 ? 'Pending' : 
                         questData.status === 1 ? 'Active' : 
                         questData.status === 2 ? 'Ended' : 'Closed'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Participants</Label>
                      <p className="font-mono text-sm">{questData.participantCount.toString()}/{questData.maxParticipants.toString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Reward Per User</Label>
                      <p className="font-mono text-sm">{(Number(questData.rewardPerUser) / 1e18).toFixed(4)} ETH</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">Verification Requirements</Label>
                    <div className="flex gap-2">
                      {questData.verificationParams.requireFavorite && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          Like Required
                        </Badge>
                      )}
                      {questData.verificationParams.requireRetweet && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Repeat2 className="h-3 w-3" />
                          Retweet Required
                        </Badge>
                      )}
                    </div>
                  </div>

                  {enableZKTLS ? (
                    <div className="space-y-2">
                      {!attestation ? (
                        <Button
                          onClick={() => handleGenerateZKTLSProof(questId?.toString() || '')}
                          disabled={isGeneratingProof || !isConnected || !isOnSepolia || !questId}
                          className="w-full bg-[hsl(var(--vibrant-purple))] hover:bg-[hsl(var(--vibrant-purple))]/90"
                        >
                          {isGeneratingProof ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating ZKTLS Proof...
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Generate ZKTLS Proof
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleClaimRewardWithZKTLS(questId)}
                          disabled={isClaiming || !isConnected || !isOnSepolia || !questId}
                          className="w-full bg-[hsl(var(--vibrant-green))] hover:bg-[hsl(var(--vibrant-green))]/90"
                        >
                          {isClaiming ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Claiming with ZKTLS...
                            </>
                          ) : (
                            <>
                              <Trophy className="h-4 w-4 mr-2" />
                              Claim Reward with ZKTLS
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={handleClaimReward}
                      disabled={isClaiming || !isConnected || !isOnSepolia}
                      className="w-full bg-[hsl(var(--vibrant-blue))] hover:bg-[hsl(var(--vibrant-blue))]/90"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Claiming Reward...
                        </>
                      ) : (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Claim Reward (Mock)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Create a quest to see details here</p>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quest Selection & Claim */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Select & Claim Quest
              </CardTitle>
              <CardDescription>
                Choose any existing quest and claim rewards with mock data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Load Available Quests</Label>
                <Button
                  onClick={loadAllQuests}
                  disabled={isLoadingQuests || !isConnected || !isOnSepolia}
                  className="w-full bg-[hsl(var(--vibrant-purple))] hover:bg-[hsl(var(--vibrant-purple))]/90"
                >
                  {isLoadingQuests ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading Quests...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4 mr-2" />
                      Load All Quests ({allQuests.length})
                    </>
                  )}
                </Button>
              </div>

              {allQuests.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Quest to Claim</Label>
                  <Select value={selectedQuestId} onValueChange={handleQuestSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a quest..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allQuests.map((quest) => (
                        <SelectItem key={quest.id.toString()} value={quest.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>Quest #{quest.id.toString()}</span>
                            <div className="flex items-center gap-2 ml-2">
                              <Badge variant="outline" className="text-xs">
                                {quest.status === 0 ? 'Pending' : 
                                 quest.status === 1 ? 'Active' : 
                                 quest.status === 2 ? 'Ended' : 'Closed'}
                              </Badge>
                              {userQualificationStatus[quest.id.toString()] && (
                                <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400">
                                  ✓ Claimed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedQuestId && questData && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Quest ID</Label>
                      <p className="font-mono text-sm">{selectedQuestId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge variant="outline" className="ml-2">
                        {questData.status === 0 ? 'Pending' : 
                         questData.status === 1 ? 'Active' : 
                         questData.status === 2 ? 'Ended' : 'Closed'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Participants</Label>
                      <p className="font-mono text-sm">{questData.participantCount.toString()}/{questData.maxParticipants.toString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Reward Per User</Label>
                      <p className="font-mono text-sm">{(Number(questData.rewardPerUser) / 1e18).toFixed(4)} ETH</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium text-muted-foreground mb-2 block">User Status</Label>
                    <div className="flex gap-2">
                      {userQualificationStatus[selectedQuestId] ? (
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Already Claimed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                          <Clock className="h-3 w-3 mr-1" />
                          Available to Claim
                        </Badge>
                      )}
                    </div>
                  </div>

                  {enableZKTLS ? (
                    <div className="space-y-2">
                      {!attestation ? (
                        <Button
                          onClick={() => handleGenerateZKTLSProof(selectedQuestId)}
                          disabled={
                            isGeneratingProof || 
                            !isConnected || 
                            !isOnSepolia || 
                            userQualificationStatus[selectedQuestId] ||
                            questData.status !== 1
                          }
                          className="w-full bg-[hsl(var(--vibrant-purple))] hover:bg-[hsl(var(--vibrant-purple))]/90"
                        >
                          {isGeneratingProof ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating ZKTLS Proof...
                            </>
                          ) : userQualificationStatus[selectedQuestId] ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Already Claimed
                            </>
                          ) : questData.status !== 1 ? (
                            <>
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Quest Not Active
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 mr-2" />
                              Generate ZKTLS Proof
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleClaimRewardWithZKTLS(BigInt(selectedQuestId))}
                          disabled={
                            isClaiming || 
                            !isConnected || 
                            !isOnSepolia || 
                            userQualificationStatus[selectedQuestId] ||
                            questData.status !== 1
                          }
                          className="w-full bg-[hsl(var(--vibrant-green))] hover:bg-[hsl(var(--vibrant-green))]/90"
                        >
                          {isClaiming ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Claiming with ZKTLS...
                            </>
                          ) : (
                            <>
                              <Trophy className="h-4 w-4 mr-2" />
                              Claim Reward with ZKTLS
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={handleClaimSelectedReward}
                      disabled={
                        isClaiming || 
                        !isConnected || 
                        !isOnSepolia || 
                        userQualificationStatus[selectedQuestId] ||
                        questData.status !== 1
                      }
                      className="w-full bg-[hsl(var(--vibrant-green))] hover:bg-[hsl(var(--vibrant-green))]/90"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Claiming Reward...
                        </>
                      ) : userQualificationStatus[selectedQuestId] ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Already Claimed
                        </>
                      ) : questData.status !== 1 ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Quest Not Active
                        </>
                      ) : (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Claim Reward (Mock Data)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {selectedQuestId && !questData && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mock Attestation Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Mock Attestation Data
            </CardTitle>
            <CardDescription>
              Information about the mock zkTLS attestation used for testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Original Recipient</Label>
                  <p className="font-mono text-xs">{MOCK_ATTESTATION.recipient}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Timestamp</Label>
                  <p className="font-mono text-xs">{MOCK_ATTESTATION.timestamp}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Data</Label>
                  <p className="font-mono text-xs">{MOCK_ATTESTATION.data}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tweet ID</Label>
                  <p className="font-mono text-xs">1942933687978365289</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestTest;
