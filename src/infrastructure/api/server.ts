import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { createTemplateRoutes } from './routes/templateRoutes.js';
import { createAuthRoutes } from './routes/authRoutes.js';
import { createMailEventRoutes } from './routes/mailEventRoutes.js';
import { swaggerSpec } from './swagger/swaggerSpec.js';
import { MongoTemplateRepository } from '../persistence/mongodb/repositories/MongoTemplateRepository.js';
import { MongoMicroserviceAuthRepository } from '../persistence/mongodb/repositories/MongoMicroserviceAuthRepository.js';
import { MongoMailEventRepository } from '../persistence/mongodb/repositories/MongoMailEventRepository.js';
import { startEmailScheduler } from '../scheduler/emailScheduler.js';
import { startRabbitConsumer } from '../rabbit/consumer.js'
import { startFailedMailConsumer } from '../rabbit/failedConsumer.js'

export function createApp(): Express {
  const app = express();

  // Middleware para parsear JSON
  app.use(express.json());

  // Middleware para logging de requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Instanciar repositorios de Mongo
  const templateRepository = new MongoTemplateRepository();
  const microserviceAuthRepository = new MongoMicroserviceAuthRepository();
  const mailEventRepository = new MongoMailEventRepository();

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Rutas
  app.use('/api/auth', createAuthRoutes(microserviceAuthRepository));
  app.use('/api/templates', createTemplateRoutes(templateRepository, microserviceAuthRepository));
  app.use('/api/mailEvents', createMailEventRoutes(mailEventRepository, templateRepository, microserviceAuthRepository));

  //cron
  startEmailScheduler(mailEventRepository, templateRepository);

  //consumidor rabbit
  startRabbitConsumer(mailEventRepository, templateRepository);
  startFailedMailConsumer();

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'mail-service'
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`
    });
  });

  // Error handler global
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  });

  return app;
}
