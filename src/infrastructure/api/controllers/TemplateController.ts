import type { Request, Response } from 'express';
import { CreateTemplateUseCase } from '../../../application/use cases/template/createTemplate.js';
import { ModifyTemplateUseCase } from '../../../application/use cases/template/modifyTemplate.js';
import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js';
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.js';
import { validateMicroserviceExistance } from '../../../application/use cases/validateMicroserviceExistance.js';

export class TemplateController {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly microserviceAuthRepository: MicroserviceAuthRepository
  ) {}

  async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const apiKey = req.headers['x-api-key'] as string | undefined;

      if (!apiKey) {
        res.status(401).json({ success: false, message: 'Missing x-api-key header' });
        return;
      }

      const authResult = await validateMicroserviceExistance(apiKey, this.microserviceAuthRepository);

      if (!authResult.valid) {
        res.status(401).json({ success: false, message: 'Invalid API key' });
        return;
      }

      const { templateId, subject, htmlBody, textBody, microserviceOwner } = req.body;

      // Validar que los campos requeridos estén presentes
      if (!templateId || !subject || !htmlBody || !microserviceOwner) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: templateId, subject, htmlBody, microserviceOwner'
        });
        return;
      }

      const useCase = new CreateTemplateUseCase(this.templateRepository);
      const result = await useCase.execute({
        templateId,
        subject,
        htmlBody,
        microserviceOwner,
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
      const { templateId } = req.params;
      const { subject, htmlBody, textBody } = req.body;
      const authKey = req.headers['x-api-key'] as string;

      // Validar que los campos requeridos estén presentes
      if (!templateId) {
        res.status(400).json({
          success: false,
          message: 'Missing templateId parameter'
        });
        return;
      }

      if (!subject || !htmlBody) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: subject, htmlBody'
        });
        return;
      }

      if (!authKey) {
        res.status(401).json({
          success: false,
          message: 'Missing authentication key in x-auth-key header'
        });
        return;
      }

      const useCase = new ModifyTemplateUseCase(
        this.templateRepository,
        this.microserviceAuthRepository
      );

      const result = await useCase.execute({
        templateId,
        subject,
        htmlBody,
        ...(textBody !== undefined && { textBody }),
        authKey
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
}
