import cron from 'node-cron';
import { SendEmailUseCase } from '../../application/use cases/mailEvent/sendEmail.js';
import type { MailEventRepository,  } from '../../domain/repositories/mailEventRepository.ts';
import type { TemplateRepository } from '../../domain/repositories/templateRepository.ts';

let task: cron.ScheduledTask | null = null;

export function startEmailScheduler(mailEventRepository: MailEventRepository, templateRepository: TemplateRepository): void {
    const sendEmailUseCase = new SendEmailUseCase(mailEventRepository, templateRepository);

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
