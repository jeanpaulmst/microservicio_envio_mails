import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.js';

export function createAuthRoutes(microserviceAuthRepository: MicroserviceAuthRepository): Router {
  const router = Router();
  const controller = new AuthController(microserviceAuthRepository);

  // POST /api/auth/register - Registrar microservicio
  router.post('/register', (req, res) => controller.registerMicroservice(req, res));

  return router;
}
