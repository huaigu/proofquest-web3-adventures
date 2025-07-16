import { PrimusZKTLS } from '@primuslabs/zktls-js-sdk';

// ZKTLS Configuration
export const ZKTLS_CONFIG = {
  appId: "0xfef6261ed3b52eda2f9ad85ecc83ac6e9f45a580",
  templateId: "31df898f-a87c-4807-9e84-0cb7b5a098ae",
  dataSourceUrl: "https://x.com/monad_xyz/status/1942933687978365289",
  backendUrl: "http://localhost:3001"
};

// ZKTLS instance
let primusZKTLS: PrimusZKTLS | null = null;

export interface ZKTLSProofResult {
  attestation: unknown;
  verificationResult: boolean;
}

export interface ZKTLSError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Initialize ZKTLS SDK
 */
export async function initializeZKTLS(): Promise<PrimusZKTLS> {
  if (!primusZKTLS) {
    primusZKTLS = new PrimusZKTLS();
    
    // Detect device platform
    let platformDevice = "pc";
    if (navigator.userAgent.toLowerCase().includes("android")) {
      platformDevice = "android";
    } else if (navigator.userAgent.toLowerCase().includes("iphone")) {
      platformDevice = "ios";
    }
    
    // Initialize with appId and platform detection
    const initResult = await primusZKTLS.init(ZKTLS_CONFIG.appId, "", {
      platform: platformDevice
    });
    
    console.log("ZKTLS initialization result:", initResult);
  }
  
  return primusZKTLS;
}

/**
 * Generate ZKTLS proof for quest verification
 */
export async function generateZKTLSProof(
  userAddress: string,
  questId: string,
  launchPage?: string
): Promise<ZKTLSProofResult> {
  try {
    // Initialize ZKTLS
    const zktls = await initializeZKTLS();
    
    // Generate attestation request
    const request = zktls.generateRequestParams(ZKTLS_CONFIG.templateId, userAddress);
    
    // Set additional parameters
    const additionParams = {
      launch_page: launchPage || ZKTLS_CONFIG.dataSourceUrl,
      quest_id: questId,
      user_address: userAddress
    };
    request.setAdditionParams(JSON.stringify(additionParams));
    
    // Set zkTLS mode to proxy mode
    request.setAttMode({
      algorithmType: "proxytls"
    });
    
    // Convert request to string
    const requestStr = request.toJsonString();
    
    // Get signed response from backend
    const signedRequestStr = await getSignedRequest(requestStr);
    
    // Start attestation process
    const attestation = await zktls.startAttestation(signedRequestStr);
    console.log("ZKTLS attestation generated:", attestation);
    
    // Verify signature
    const verificationResult = await zktls.verifyAttestation(attestation);
    console.log("ZKTLS verification result:", verificationResult);
    
    return {
      attestation,
      verificationResult
    };
    
  } catch (error) {
    console.error("ZKTLS proof generation failed:", error);
    throw new Error(`ZKTLS proof generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get signed request from backend
 */
async function getSignedRequest(requestStr: string): Promise<string> {
  try {
    const response = await fetch(`${ZKTLS_CONFIG.backendUrl}/api/zktls/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signParams: requestStr
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Backend signing failed: ${errorData.message || 'Unknown error'}`);
    }
    
    const responseData = await response.json();
    return responseData.signResult;
    
  } catch (error) {
    console.error("Backend signing request failed:", error);
    throw new Error(`Backend signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate attestation using backend
 */
export async function validateAttestation(attestation: unknown): Promise<boolean> {
  try {
    const response = await fetch(`${ZKTLS_CONFIG.backendUrl}/api/zktls/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attestation
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Backend validation failed: ${errorData.message || 'Unknown error'}`);
    }
    
    const responseData = await response.json();
    return responseData.isValid;
    
  } catch (error) {
    console.error("Backend validation request failed:", error);
    return false;
  }
}

/**
 * Check ZKTLS service health
 */
export async function checkZKTLSHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ZKTLS_CONFIG.backendUrl}/api/zktls/health`);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.status === 'ok';
    
  } catch (error) {
    console.error("ZKTLS health check failed:", error);
    return false;
  }
}

/**
 * Format attestation for smart contract
 */
export function formatAttestationForContract(attestation: unknown): unknown {
  // Type guard to check if attestation is an object
  if (typeof attestation !== 'object' || attestation === null) {
    throw new Error('Invalid attestation format');
  }
  
  const att = attestation as Record<string, unknown>;
  const request = att.request as Record<string, unknown>;
  
  // Format the attestation to match the smart contract's expected structure
  return {
    recipient: att.recipient,
    request: {
      url: request.url,
      header: request.header || "",
      method: request.method,
      body: request.body || ""
    },
    reponseResolve: att.reponseResolve || att.responseResolve || [],
    data: att.data,
    attConditions: att.attConditions,
    timestamp: att.timestamp,
    additionParams: att.additionParams,
    attestors: att.attestors || [],
    signatures: att.signatures || []
  };
}