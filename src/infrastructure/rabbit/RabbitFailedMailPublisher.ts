import amqp from 'amqplib/callback_api.js'
import type { MailEvent } from '../../domain/entities/mailEvent.js'
import type { FailedMailPublisher } from '../../domain/ports/failedMailPublisher.js'

export class RabbitFailedMailPublisher implements FailedMailPublisher {
    async publish(event: MailEvent): Promise<void> {
        return new Promise((resolve, reject) => {
            amqp.connect('amqp://guest:guest@rabbitmq', function(error0, connection) {
                if (error0) return reject(error0)

                connection.createChannel(function(error1, channel) {
                    if (error1) return reject(error1)

                    const exchange = 'email-sending-fail-exchange'
                    const payload = {
                        emailEventId: event.emailEventId,
                        templateId: event.templateId,
                        to: event.to,
                        from: event.from,
                        templateData: event.templateData
                    }

                    channel.assertExchange(exchange, 'fanout', { durable: true })
                    channel.publish(exchange, '', Buffer.from(JSON.stringify(payload)), { persistent: true })
                    channel.close(function() {
                        connection.close()
                        resolve()
                    })
                })
            })
        })
    }
}
