import cron from 'node-cron';
import { SendEmailUseCase } from '../../application/use cases/mailEvent/sendEmail.js';
import type { MailEventRepository } from '../../domain/repositories/mailEventRepository.js';
import type { TemplateRepository } from '../../domain/repositories/templateRepository.js';
import { RabbitFailedMailPublisher } from '../rabbit/RabbitFailedMailPublisher.js';
import { NodemailerTestSender } from '../email/NodemailerTestSender.js';

let task: cron.ScheduledTask | null = null;

export function startEmailScheduler(mailEventRepository: MailEventRepository, templateRepository: TemplateRepository): void {
    const failedMailPublisher = new RabbitFailedMailPublisher();
    const emailSender = new NodemailerTestSender();
    const sendEmailUseCase = new SendEmailUseCase(mailEventRepository, templateRepository, failedMailPublisher, emailSender);

    task = cron.schedule('*/1 * * * *', async () => {
        await sendEmailUseCase.execute();
    });

    console.log('[emailScheduler] Email scheduler iniciado (cada 1 minuto)');
}

export function stopEmailScheduler(): void {
    if (task) {
        task.stop();
        task = null;
        console.log('[emailScheduler] Email scheduler detenido');
    }
}
