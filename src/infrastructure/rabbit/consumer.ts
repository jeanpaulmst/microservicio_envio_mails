import amqp from 'amqplib/callback_api.js'
import { SendEmailUseCase } from '../../application/use cases/mailEvent/sendEmail.js';
import type { MailEventRepository } from '../../domain/repositories/mailEventRepository.js'
import type { TemplateRepository } from '../../domain/repositories/templateRepository.js'
import { MailEvent } from '../../domain/entities/mailEvent.js';


export function startRabbitConsumer(mailEventRepository: MailEventRepository, templateRepository: TemplateRepository) {

    amqp.connect('amqp://guest:guest@rabbitmq', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        console.log("RabbitMQ connected successfully");

        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }
            let exchange = 'email-microservice-exchange';
            let queue = 'email-microservice-queue'

            channel.assertExchange(exchange, 'fanout', {
                durable: true
            });

            channel.assertQueue(queue, { durable: true }, function(error2, q){
                if(error2){
                    throw error2;
                }
                channel.bindQueue(q.queue, exchange, '')
            });
            channel.prefetch(1);

            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

            channel.consume(queue, async function(msg) {
                if (!msg) return;

                console.log(" [x] Received %s", msg.content.toString());

                const data = JSON.parse(msg.content.toString());

                const mailEvent = MailEvent.create({
                    emailEventId: data.emailEventId,
                    templateId: data.templateId,
                    to: data.to,
                    from: data.from,
                    templateData: data.templateData,
                    ...(data.scheduledFor && { scheduledFor: new Date(data.scheduledFor) }),
                    ...(data.retries !== undefined && { retries: data.retries })
                });
                await mailEventRepository.save(mailEvent);

                if (!data.scheduledFor) {
                    const sendEmailUseCase = new SendEmailUseCase(mailEventRepository, templateRepository);
                    await sendEmailUseCase.execute();
                }

                channel.ack(msg);
            }, {
                noAck: false
            });
        });

        // reconectar
        connection.on('error', (err) => {
            console.error('RabbitMQ connection error', err);
            setTimeout(() => startRabbitConsumer(mailEventRepository, templateRepository), 5000);
        });
          
        connection.on('close', () => {
            console.warn('RabbitMQ connection closed, reconnecting...');
            setTimeout(() => startRabbitConsumer(mailEventRepository, templateRepository), 5000);
        });
    });
}
