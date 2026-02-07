import type { Request, Response } from 'express';
import { CreateEmailEventUseCase } from '../../../application/use cases/mailEvent/createMailEvent.js';
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
        const { templateId } = req.body;

        // Validar que los campos requeridos estén presentes
        if (!templateId) {
        res.status(400).json({
            success: false,
            message: 'Missing required fields: templateId'
        });
        return;
        }

        res.status(200).json({
            success: true,
            message: `createMailEvent funcionando`
        });
    }
}   
