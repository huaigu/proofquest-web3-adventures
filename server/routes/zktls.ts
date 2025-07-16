import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { signAttestation, validateAttestation, ZKTLSSignRequest, ZKTLSSignResponse } from '../lib/zktls.js';

// Request/Response schemas
const signRequestSchema = {
  type: 'object',
  required: ['signParams'],
  properties: {
    signParams: { type: 'string' }
  }
};

const signResponseSchema = {
  type: 'object',
  properties: {
    signResult: { type: 'string' }
  }
};

const validateRequestSchema = {
  type: 'object',
  required: ['attestation'],
  properties: {
    attestation: { type: 'object' }
  }
};

const validateResponseSchema = {
  type: 'object',
  properties: {
    isValid: { type: 'boolean' }
  }
};

// Route handler types
interface SignRequest extends FastifyRequest {
  body: ZKTLSSignRequest;
}

interface ValidateRequest extends FastifyRequest {
  body: {
    attestation: unknown;
  };
}

export async function zktlsRoutes(fastify: FastifyInstance) {
  // Sign attestation request
  fastify.post<{ Body: ZKTLSSignRequest }>('/sign', {
    schema: {
      body: signRequestSchema,
      response: {
        200: signResponseSchema
      }
    }
  }, async (request: SignRequest, reply: FastifyReply) => {
    try {
      const { signParams } = request.body;
      
      // Validate input
      if (!signParams || typeof signParams !== 'string') {
        return reply.status(400).send({
          error: 'Invalid request',
          message: 'signParams is required and must be a string'
        });
      }
      
      // Log the signing request (for debugging)
      fastify.log.info('ZKTLS signing request received');
      fastify.log.debug('Sign params:', signParams);
      
      // Sign the attestation
      const signResult = await signAttestation(signParams);
      
      // Return the signed result
      const response: ZKTLSSignResponse = {
        signResult
      };
      
      return reply.send(response);
      
    } catch (error) {
      fastify.log.error('ZKTLS signing error:', error);
      
      return reply.status(500).send({
        error: 'ZKTLS signing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Validate attestation
  fastify.post<{ Body: { attestation: unknown } }>('/validate', {
    schema: {
      body: validateRequestSchema,
      response: {
        200: validateResponseSchema
      }
    }
  }, async (request: ValidateRequest, reply: FastifyReply) => {
    try {
      const { attestation } = request.body;
      
      // Validate input
      if (!attestation) {
        return reply.status(400).send({
          error: 'Invalid request',
          message: 'attestation is required'
        });
      }
      
      // Log the validation request (for debugging)
      fastify.log.info('ZKTLS validation request received');
      
      // Validate the attestation
      const isValid = await validateAttestation(attestation);
      
      // Return the validation result
      return reply.send({
        isValid
      });
      
    } catch (error) {
      fastify.log.error('ZKTLS validation error:', error);
      
      return reply.status(500).send({
        error: 'ZKTLS validation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Health check endpoint for ZKTLS
  fastify.get('/health', async (request, reply) => {
    return reply.send({
      status: 'ok',
      service: 'ZKTLS',
      timestamp: new Date().toISOString()
    });
  });
}

export default zktlsRoutes;