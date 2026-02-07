import type { Request, Response } from 'express';
import { CreateMailEventUseCase } from '../../../application/use cases/mailEvent/createMailEvent.js';
import { SendEmailUseCase } from '../../../application/use cases/mailEvent/sendEmail.js';
import type { MailEventRepository } from '../../../domain/repositories/mailEventRepository.js';
import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js';
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.js';

export class MailEventController {
    constructor(
        private readonly mailEventRepository: MailEventRepository,
        private readonly templateRepository: TemplateRepository,
        private readonly microserviceAuthRepository: MicroserviceAuthRepository
    ) {}

    async createMailEvent(req: Request, res: Response): Promise<void> {
        try {
            const { templateId, to, from, templateData, scheduledFor, retries } = req.body;

            // Validar que los campos requeridos estén presentes
            const missingFields: string[] = [];
            if (!templateId) missingFields.push('templateId');
            if (!to) missingFields.push('to');
            if (!from) missingFields.push('from');
            if (templateData === undefined || templateData === null) missingFields.push('templateData');

            if (missingFields.length > 0) {
                res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                });
                return;
            }

            // Validar que templateData sea un objeto
            if (typeof templateData !== 'object' || Array.isArray(templateData)) {
                res.status(400).json({
                    success: false,
                    message: 'templateData must be a JSON object'
                });
                return;
            }

            // Construir input para el caso de uso
            const useCaseInput: {
                templateId: string
                to: string
                from: string
                templateData: Record<string, string>
                scheduledFor?: string
                retries?: number
            } = {
                templateId,
                to,
                from,
                templateData
            };

            if (scheduledFor !== undefined) {
                useCaseInput.scheduledFor = scheduledFor;
            }
            if (retries !== undefined) {
                useCaseInput.retries = retries;
            }

            const useCase = new CreateMailEventUseCase(
                this.mailEventRepository,
                this.templateRepository
            );
            const result = await useCase.execute(useCaseInput);

            if (result.success) {
                res.status(201).json(result);
            } else {
                if (result.message.includes('not found') || result.message.includes('has been deleted')) {
                    res.status(404).json(result);
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
