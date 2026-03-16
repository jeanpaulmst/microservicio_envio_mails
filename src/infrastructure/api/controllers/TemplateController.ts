import type { Request, Response } from 'express';
import { CreateTemplateUseCase } from '../../../application/use cases/template/createTemplate.js';
import { ModifyTemplateUseCase } from '../../../application/use cases/template/modifyTemplate.js';
import { ListTemplatesUseCase } from '../../../application/use cases/template/listTemplates.js';
import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js';
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.js';
import { validateMicroserviceExistance } from '../../../application/use cases/validateMicroserviceExistance.js';

// Helper: valida la key y retorna el microserviceId, o responde con 401 y retorna null
async function resolveAuth(
  req: Request,
  res: Response,
  repo: MicroserviceAuthRepository
): Promise<string | null> {
  const apiKey = req.headers['x-api-key'] as string | undefined;
  if (!apiKey) {
    res.status(401).json({ success: false, message: 'Missing x-api-key header' });
    return null;
  }
  const authResult = await validateMicroserviceExistance(apiKey, repo);
  if (!authResult.valid || !authResult.microserviceId) {
    res.status(401).json({ success: false, message: 'Invalid API key' });
    return null;
  }
  return authResult.microserviceId;
}

export class TemplateController {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly microserviceAuthRepository: MicroserviceAuthRepository
  ) {}

  async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const microserviceId = await resolveAuth(req, res, this.microserviceAuthRepository);
      if (microserviceId === null) return;

      const { templateId, subject, htmlBody, textBody } = req.body;

      // Validar que los campos requeridos estén presentes
      if (!templateId || !subject || !htmlBody) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: templateId, subject, htmlBody'
        });
        return;
      }

      const useCase = new CreateTemplateUseCase(this.templateRepository);
      const result = await useCase.execute({
        templateId,
        subject,
        htmlBody,
        microserviceOwner: microserviceId,
        ...(textBody !== undefined && { textBody })
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: `Internal server error: ${errorMessage}`
      });
    }
  }

  async modifyTemplate(req: Request, res: Response): Promise<void> {
    try {
      const microserviceId = await resolveAuth(req, res, this.microserviceAuthRepository);
      if (microserviceId === null) return;

      const { templateId } = req.params;
      const { subject, htmlBody, textBody } = req.body;

      if (!subject || !htmlBody) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: subject, htmlBody'
        });
        return;
      }

      const useCase = new ModifyTemplateUseCase(this.templateRepository);

      const result = await useCase.execute({
        templateId: templateId!,
        subject,
        htmlBody,
        ...(textBody !== undefined && { textBody }),
        requesterMicroserviceId: microserviceId
      });

      if (result.success) {
        res.status(200).json(result);
      } else {
        // Determinar el código de estado apropiado
        if (result.message.includes('does not exist')) {
          res.status(404).json(result);
        } else if (result.message.includes('Authentication') || result.message.includes('permission')) {
          res.status(403).json(result);
        } else {
          res.status(400).json(result);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: `Internal server error: ${errorMessage}`
      });
    }
  }

  async listTemplates(req: Request, res: Response): Promise<void> {
    try {
      const microserviceId = await resolveAuth(req, res, this.microserviceAuthRepository);
      if (microserviceId === null) return;

      const useCase = new ListTemplatesUseCase(this.templateRepository);
      const result = await useCase.execute(microserviceId);

      res.status(200).json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: `Internal server error: ${errorMessage}`
      });
    }
  }
}
