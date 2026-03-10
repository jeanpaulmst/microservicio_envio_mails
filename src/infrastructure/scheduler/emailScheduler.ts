import cron from 'node-cron';
import { SendEmailUseCase } from '../../application/use cases/mailEvent/sendEmail.js';
import type { MailEventRepository } from '../../domain/repositories/mailEventRepository.js';
import type { TemplateRepository } from '../../domain/repositories/templateRepository.js';
import { RabbitFailedMailPublisher } from '../rabbit/RabbitFailedMailPublisher.js';
import { StubEmailSender } from '../email/StubEmailSender.js';

let task: cron.ScheduledTask | null = null;

export function startEmailScheduler(mailEventRepository: MailEventRepository, templateRepository: TemplateRepository): void {
    const failedMailPublisher = new RabbitFailedMailPublisher();
    const emailSender = new StubEmailSender();
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
