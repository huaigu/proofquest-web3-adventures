import { FastifyInstance } from 'fastify'
import fastifyCors from '@fastify/cors'

export async function setupCors(fastify: FastifyInstance) {
  await fastify.register(fastifyCors, {
    // Allow frontend origin
    origin: (origin, callback) => {
      const hostname = new URL(origin || 'http://localhost:3000').hostname
      
      // Allow localhost for development and specific production domains
      if (hostname === 'localhost' || hostname === '127.0.0.1' || 
          hostname === 'proofquest.com' || hostname === 'app.proofquest.com') {
        callback(null, true)
        return
      }
      
      // For development, allow any origin
      if (process.env.NODE_ENV === 'development') {
        callback(null, true)
        return
      }
      
      // Reject other origins in production
      callback(new Error('Not allowed by CORS'), false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
}