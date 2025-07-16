import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { 
  generateZKTLSProof, 
  validateAttestation, 
  checkZKTLSHealth, 
  formatAttestationForContract,
  ZKTLSProofResult 
} from '@/lib/zktls';

export interface ZKTLSHookResult {
  // State
  isGenerating: boolean;
  isValidating: boolean;
  attestation: any | null;
  error: string | null;
  
  // Actions
  generateProof: (questId: string, launchPage?: string) => Promise<ZKTLSProofResult | null>;
  validateProof: (attestation: any) => Promise<boolean>;
  clearAttestation: () => void;
  checkHealth: () => Promise<boolean>;
  
  // Utilities
  formatForContract: (attestation: any) => any;
}

export function useZKTLS(): ZKTLSHookResult {
  const { address } = useAccount();
  
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [attestation, setAttestation] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Clear error when starting new operations
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Generate ZKTLS proof
  const generateProof = useCallback(async (
    questId: string, 
    launchPage?: string
  ): Promise<ZKTLSProofResult | null> => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }
    
    setIsGenerating(true);
    clearError();
    
    try {
      const result = await generateZKTLSProof(address, questId, launchPage);
      
      if (result.verificationResult) {
        setAttestation(result.attestation);
        return result;
      } else {
        setError('Proof verification failed');
        return null;
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('ZKTLS proof generation failed:', err);
      return null;
      
    } finally {
      setIsGenerating(false);
    }
  }, [address, clearError]);
  
  // Validate attestation
  const validateProof = useCallback(async (attestationToValidate: any): Promise<boolean> => {
    setIsValidating(true);
    clearError();
    
    try {
      const isValid = await validateAttestation(attestationToValidate);
      
      if (!isValid) {
        setError('Attestation validation failed');
      }
      
      return isValid;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('ZKTLS validation failed:', err);
      return false;
      
    } finally {
      setIsValidating(false);
    }
  }, [clearError]);
  
  // Clear attestation
  const clearAttestation = useCallback(() => {
    setAttestation(null);
    clearError();
  }, [clearError]);
  
  // Check ZKTLS service health
  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const isHealthy = await checkZKTLSHealth();
      
      if (!isHealthy) {
        setError('ZKTLS service is not available');
      }
      
      return isHealthy;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('ZKTLS health check failed:', err);
      return false;
    }
  }, []);
  
  // Format attestation for smart contract
  const formatForContract = useCallback((attestationToFormat: any) => {
    return formatAttestationForContract(attestationToFormat);
  }, []);
  
  return {
    // State
    isGenerating,
    isValidating,
    attestation,
    error,
    
    // Actions
    generateProof,
    validateProof,
    clearAttestation,
    checkHealth,
    
    // Utilities
    formatForContract
  };
}