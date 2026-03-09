#!/usr/bin/env node

import amqp from 'amqplib/callback_api.js'
import { randomUUID } from 'crypto'

amqp.connect('amqp://guest:guest@localhost', function(error0, connection) {
  if (error0) {
    console.log("error0:", error0)
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      console.log("error1:", error1)
      throw error1;
    }
    let exchange = 'email-microservice-exchange';

    let emailEventPayload = {
      emailEventId: randomUUID(),
      templateId: "bienvenida-v1",
      to: "juanpablomasuet@gmail.com",
      from: "juanpablomasuet@gmail.com",
      templateData: JSON.stringify({
        nombre: "Alex Honnold",
        codigo: "ABC-123"
      }),
      retries: 3
      // scheduledFor: "2026-03-02T18:00:00Z"  // descomentar para envío diferido
    }

    console.log("defino el exchange...")
    channel.assertExchange(exchange, 'fanout', {
      durable: true
    });
    console.log("publicando mensaje:", emailEventPayload)
    channel.publish(exchange, '', Buffer.from(JSON.stringify(emailEventPayload)), { persistent: true });
    console.log(" [x] Sent", emailEventPayload.emailEventId);

    channel.close(function() {
      connection.close()
      process.exit(0)
    })
  });
});