import amqp from 'amqplib/callback_api.js'
import chalk from 'chalk'
import type { MailEventRepository } from '../../domain/repositories/mailEventRepository.js'
import type { TemplateRepository } from '../../domain/repositories/templateRepository.js'
import { CreateMailEventUseCase } from '../../application/use cases/mailEvent/createMailEvent.js'


export function startRabbitConsumer(mailEventRepository: MailEventRepository, templateRepository: TemplateRepository) {

    amqp.connect('amqp://guest:guest@rabbitmq', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        console.log("[consumer] RabbitMQ connected successfully");

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

            console.log("[consumer] Waiting for messages in %s. To exit press CTRL+C");

            // Instanciar caso de uso para crear evento de mail en la bd
            const useCaseCreateMailEvent = new CreateMailEventUseCase(mailEventRepository, templateRepository)

            channel.consume(queue, async function(msg) {
                if (!msg) return;

                const data = JSON.parse(msg.content.toString());

                console.log(chalk.green("[consumer] Received"), `id=${data.emailEventId}`);

                if (typeof data.templateData === 'string') {
                    data.templateData = JSON.parse(data.templateData);
                }

                //crear evento de mail en la bd
                const result = await useCaseCreateMailEvent.execute(data)

                if (!result.success) {
                    console.error(`[consumer] - ` + chalk.red(`[CREATE MAIL EVENT ERROR] ${result.message}`))
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
            console.warn(chalk.green('[consumer] RabbitMQ connection closed, reconnecting...'));
            setTimeout(() => startRabbitConsumer(mailEventRepository, templateRepository), 5000);
        });
    });
}
