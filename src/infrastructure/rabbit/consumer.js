import amqp from 'amqplib/callback_api.js'

export function startRabbitConsumer() {

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
                durable: false
            });

            channel.assertQueue(queue, { durable: true }, function(error2, q){
                if(error2){
                    throw error2;
                }
                channel.bindQueue(q.queue, exchange, '')
            });
            channel.prefetch(1);

            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

            channel.consume(queue, function(msg) {
                if (!msg) return;
                var secs = msg.content.toString().split('.').length - 1;

                console.log(" [x] Received %s", msg.content.toString());
                setTimeout(function() {
                    console.log(" [x] Done");
                    channel.ack(msg);
                }, secs * 1000);
            }, {
                noAck: false
            });
        });
    });
}
