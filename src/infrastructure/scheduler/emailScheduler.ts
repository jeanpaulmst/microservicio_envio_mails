import cron from 'node-cron';
import { SendEmailUseCase } from '../../application/use cases/mailEvent/sendEmail.js';

let task: cron.ScheduledTask | null = null;

export function startEmailScheduler(): void {
    const sendEmailUseCase = new SendEmailUseCase();

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
