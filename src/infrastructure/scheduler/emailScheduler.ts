import cron from 'node-cron';
import { SendEmailUseCase } from '../../application/use cases/mailEvent/sendEmail.js';
import type { MailEventRepository } from '../../domain/repositories/mailEventRepository.js';
import type { TemplateRepository } from '../../domain/repositories/templateRepository.js';
import { RabbitFailedMailPublisher } from '../rabbit/RabbitFailedMailPublisher.js';

let task: cron.ScheduledTask | null = null;

export function startEmailScheduler(mailEventRepository: MailEventRepository, templateRepository: TemplateRepository): void {
    const failedMailPublisher = new RabbitFailedMailPublisher();
    const sendEmailUseCase = new SendEmailUseCase(mailEventRepository, templateRepository, failedMailPublisher);

    task = cron.schedule('*/1 * * * *', async () => {
        await sendEmailUseCase.execute();
    });

    console.log('Email scheduler iniciado (cada 1 minuto)');
}

export function stopEmailScheduler(): void {
    if (task) {
        task.stop();
        task = null;
        console.log('Email scheduler detenido');
    }
}
