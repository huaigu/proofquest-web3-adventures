import { PrimusZKTLS } from '@primuslabs/zktls-js-sdk';

// ZKTLS Configuration
export const ZKTLS_CONFIG = {
  appId: "0xfef6261ed3b52eda2f9ad85ecc83ac6e9f45a580",
  appSecret: "0xdad67d6888fa454d7016caffb20a65663d0bcce4adc640436dbc589d8b3d4e89",
  templateId: "31df898f-a87c-4807-9e84-0cb7b5a098ae",
  dataSourceUrl: "https://x.com/monad_xyz/status/1942933687978365289"
};

// Initialize ZKTLS instance
let primusZKTLS: PrimusZKTLS | null = null;

export async function initializeZKTLS(): Promise<PrimusZKTLS> {
  if (!primusZKTLS) {
    primusZKTLS = new PrimusZKTLS();
    
    // Initialize with appId and appSecret
    await primusZKTLS.init(ZKTLS_CONFIG.appId, ZKTLS_CONFIG.appSecret);
    
    console.log('ZKTLS initialized successfully');
  }
  
  return primusZKTLS;
}

export interface ZKTLSSignRequest {
  signParams: string;
}

export interface ZKTLSSignResponse {
  signResult: string;
}

/**
 * Sign an attestation request using ZKTLS
 */
export async function signAttestation(signParams: string): Promise<string> {
  try {
    // Initialize ZKTLS if not already done
    const zktls = await initializeZKTLS();
    
    // Sign the attestation request
    const signResult = await zktls.sign(signParams);
    
    console.log('ZKTLS signature generated successfully');
    return signResult;
    
  } catch (error) {
    console.error('Error signing attestation:', error);
    throw new Error(`ZKTLS signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate attestation signature
 */
export async function validateAttestation(attestation: unknown): Promise<boolean> {
  try {
    const zktls = await initializeZKTLS();
    
    // Verify the attestation signature
    const isValid = await zktls.verifyAttestation(attestation);
    
    console.log('ZKTLS attestation validation result:', isValid);
    return isValid;
    
  } catch (error) {
    console.error('Error validating attestation:', error);
    return false;
  }
}

/**
 * Generate launch page parameter for ZKTLS
 */
export function generateLaunchPageParam(questId: string, userAddress: string): string {
  return `${ZKTLS_CONFIG.dataSourceUrl}?quest=${questId}&user=${userAddress}`;
}