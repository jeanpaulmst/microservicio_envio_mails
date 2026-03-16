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

  // GET /api/templates - Listar templates del microservicio autenticado
  router.get('/', (req, res) => controller.listTemplates(req, res));

  // POST /api/templates - Crear template
  router.post('/', (req, res) => controller.createTemplate(req, res));

  // PUT /api/templates/:templateId - Modificar template
  router.put('/:templateId', (req, res) => controller.modifyTemplate(req, res));

  return router;
}
