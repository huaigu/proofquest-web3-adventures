import Fastify from 'fastify'
import { setupCors } from './middleware/cors.js'
import { questRoutes } from './routes/quests.js'
import { userRoutes } from './routes/users.js'
import { participationRoutes } from './routes/participations.js'

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
})

// Register CORS middleware
await setupCors(fastify)

// Register routes
await fastify.register(questRoutes)
await fastify.register(userRoutes)
await fastify.register(participationRoutes)

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
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

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    const host = process.env.HOST || '0.0.0.0'
    
    await fastify.listen({ port, host })
    fastify.log.info(`ProofQuest Server is running on http://${host}:${port}`)
    
    // Log available routes
    fastify.log.info('Available routes:')
    fastify.log.info('GET /health - Health check')
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
    
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

start()