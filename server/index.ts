import Fastify from 'fastify'
import { setupCors } from './middleware/cors.js'
import { questRoutes } from './routes/quests.js'
import { userRoutes } from './routes/users.js'
import { participationRoutes } from './routes/participations.js'
import authRoutes from './routes/auth.js'
import { zktlsRoutes } from './routes/zktls.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { profileRoutes } from './routes/profile.js'
import { database } from './lib/database.js'
import { eventIndexer } from './lib/eventIndexer.js'

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
})

// Register CORS middleware
await setupCors(fastify)

// Register all plugins and routes in the correct order
await fastify.register(async function (fastify) {
  // Register JWT plugin
  await fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    sign: {
      expiresIn: '30d',
      issuer: 'proofquest',
      audience: 'proofquest-users'
    },
    verify: {
      issuer: 'proofquest',
      audience: 'proofquest-users'
    }
  })

  // Register routes that need JWT
  await fastify.register(authRoutes)
  await fastify.register(questRoutes)
  await fastify.register(userRoutes)
  await fastify.register(participationRoutes)
  await fastify.register(dashboardRoutes)
  await fastify.register(profileRoutes)
  
  // Register ZKTLS routes
  await fastify.register(zktlsRoutes, { prefix: '/api/zktls' })
})

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Event indexer status endpoint
fastify.get('/indexer/status', async (request, reply) => {
  const contractAddress = process.env.QUEST_CONTRACT_ADDRESS
  if (!contractAddress || contractAddress.trim() === '') {
    return { 
      enabled: false, 
      message: 'Event indexer not configured - no contract address'
    }
  }
  
  try {
    const status = await eventIndexer.getStatus()
    return {
      enabled: true,
      ...status
    }
  } catch (error) {
    return {
      enabled: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})

// Global error handler
fastify.setErrorHandler(async (error, request, reply) => {
  fastify.log.error(error)
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : error.message

  return reply.status(500).send({
    error: 'Internal Server Error',
    message,
    statusCode: 500
  })
})

// Initialize database and event indexer
const initializeServices = async () => {
  try {
    // Initialize database
    fastify.log.info('Initializing database...')
    await database.init()
    
    // Initialize event indexer only if contract address is configured
    const contractAddress = process.env.QUEST_CONTRACT_ADDRESS
    if (contractAddress && contractAddress.trim() !== '') {
      fastify.log.info('Initializing event indexer...')
      await eventIndexer.initialize()
      
      // Start event indexing from last processed block (catch up)
      fastify.log.info('Starting initial event indexing...')
      await eventIndexer.startIndexing()
      
      // Update quest statuses based on current time
      fastify.log.info('Updating quest statuses...')
      await eventIndexer.updateQuestStatuses()
      
      // Start continuous polling for new events
      fastify.log.info('Starting continuous event polling...')
      eventIndexer.startPolling()
    } else {
      fastify.log.info('Skipping event indexer - no contract address configured')
    }
    
    fastify.log.info('All services initialized successfully')
  } catch (error) {
    fastify.log.error('Failed to initialize services:', error)
    throw error
  }
}

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    const host = process.env.HOST || '0.0.0.0'
    
    // Initialize services first
    await initializeServices()
    
    await fastify.listen({ port, host })
    fastify.log.info(`ProofQuest Server is running on http://${host}:${port}`)
    
    // Log indexer status if configured
    if (process.env.QUEST_CONTRACT_ADDRESS?.trim()) {
      const indexerStatus = await eventIndexer.getStatus()
      fastify.log.info('Event indexer status:', indexerStatus)
    }
    
    // Log available routes
    fastify.log.info('Available routes:')
    fastify.log.info('GET /health - Health check')
    fastify.log.info('GET /indexer/status - Event indexer status')
    fastify.log.info('Quest routes:')
    fastify.log.info('  GET /api/quests - List quests')
    fastify.log.info('  POST /api/quests - Create quest')
    fastify.log.info('  GET /api/quests/:id - Get quest by ID')
    fastify.log.info('User routes:')
    fastify.log.info('  GET /api/users - List users')
    fastify.log.info('  POST /api/users - Create/update user')
    fastify.log.info('  GET /api/users/:address - Get user by address')
    fastify.log.info('  PUT /api/users/:address - Update user')
    fastify.log.info('  DELETE /api/users/:address - Delete user')
    fastify.log.info('Participation routes:')
    fastify.log.info('  POST /api/participations - Join quest')
    fastify.log.info('  GET /api/participations/user/:address - Get user participations')
    fastify.log.info('  GET /api/participations/quest/:questId - Get quest participants')
    fastify.log.info('  PUT /api/participations/:id - Update participation')
    fastify.log.info('ZKTLS routes:')
    fastify.log.info('  POST /api/zktls/sign - Sign attestation request')
    fastify.log.info('  POST /api/zktls/validate - Validate attestation')
    fastify.log.info('  GET /api/zktls/health - ZKTLS health check')
    
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down gracefully...')
  
  // Stop event indexer polling
  if (process.env.QUEST_CONTRACT_ADDRESS?.trim()) {
    fastify.log.info('Stopping event indexer...')
    eventIndexer.stop()
  }
  
  // Close fastify server
  await fastify.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  fastify.log.info('Received SIGTERM, shutting down gracefully...')
  
  // Stop event indexer polling
  if (process.env.QUEST_CONTRACT_ADDRESS?.trim()) {
    fastify.log.info('Stopping event indexer...')
    eventIndexer.stop()
  }
  
  // Close fastify server
  await fastify.close()
  process.exit(0)
})

start()