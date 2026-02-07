import { Router } from 'express';
import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js';
import type { MailEventRepository } from '../../../domain/repositories/mailEventRepository.js';
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.js';
import { MailEventController } from '../controllers/MailEventController.js'

export function createMailEventRoutes(
  mailEventRepository: MailEventRepository,
  templateRepository: TemplateRepository,
  microserviceAuthRepository: MicroserviceAuthRepository
): Router {
  const router = Router();
  const controller = new MailEventController(mailEventRepository, templateRepository, microserviceAuthRepository);

  // POST /api/mailEvents - Crear evento de mail
  router.post('/', (req, res) => controller.createMailEvent(req, res));

  return router;
}