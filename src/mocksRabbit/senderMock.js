#!/usr/bin/env node

import amqp from 'amqplib/callback_api.js'

amqp.connect('amqp://guest:guest@localhost', function(error0, connection) {
  if (error0) {
    console.log("error0:", error0)
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      console.log("error0:", error1)
      throw error1;
    }
    let exchange = 'email-microservice-exchange';
    let queue = 'email-microservice-queue'

    let emailEventExample = {
        id: "1",
        nameEvent: "evento de envio de mail"
    }

    console.log("defino el exchange...")
    channel.assertExchange(exchange, 'fanout', {
      durable: false
    });
    console.log("ordeno la publicacion...")
    channel.publish(exchange, queue, Buffer.from(JSON.stringify(emailEventExample)));
    console.log(" [x] Sent %s", emailEventExample.nameEvent);

    channel.close(function() {
      connection.close()
      process.exit(0)
    })
  });
});