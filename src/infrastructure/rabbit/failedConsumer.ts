import amqp from 'amqplib/callback_api.js'
import chalk from 'chalk'

export function startFailedMailConsumer() {
    amqp.connect('amqp://guest:guest@rabbitmq', function(error0, connection) {
        if (error0) {
            throw error0
        }
        console.log('[failedConsumer] connected successfully')

        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1
            }

            const exchange = 'email-sending-fail-exchange'
            const queue = 'email-sending-fail-queue'

            channel.assertExchange(exchange, 'fanout', { durable: true })

            channel.assertQueue(queue, { durable: true }, function(error2, q) {
                if (error2) {
                    throw error2
                }
                channel.bindQueue(q.queue, exchange, '')

                channel.consume(q.queue, function(msg) {
                    if (!msg) return

                    const data = JSON.parse(msg.content.toString())
                    console.error(chalk.red(
                        `[failedConsumer]-[MAIL FAILED] emailEventId=${data.emailEventId} | templateId=${data.templateId} | to=${data.to}`
                    ))

                    channel.ack(msg)
                }, { noAck: false })
            })
        })

        connection.on('error', (err) => {
            console.error(chalk.red('[failedConsumer] RabbitMQ failedConsumer connection error'), err)
            setTimeout(() => startFailedMailConsumer(), 5000)
        })

        connection.on('close', () => {
            console.warn(chalk.red('[failedConsumer] RabbitMQ failedConsumer connection closed, reconnecting...'))
            setTimeout(() => startFailedMailConsumer(), 5000)
        })
    })
}
