import { Router } from 'express';
import { TemplateController } from '../controllers/TemplateController.js';
import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js';
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.js';

export function createTemplateRoutes(
  templateRepository: TemplateRepository,
  microserviceAuthRepository: MicroserviceAuthRepository
): Router {
  const router = Router();
  const controller = new TemplateController(templateRepository, microserviceAuthRepository);

  // POST /api/templates - Crear template
  router.post('/', (req, res) => controller.createTemplate(req, res));

  // PUT /api/templates/:templateId - Modificar template (requiere authKey)
  router.put('/:templateId', (req, res) => controller.modifyTemplate(req, res));

  return router;
}
