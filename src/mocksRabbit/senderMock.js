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
      templateId: "welcome-email",
      to: "destinatario@ejemplo.com",
      from: "remitente@ejemplo.com",
      templateData: JSON.stringify({
        userName: "Juan",
        serviceName: "MiApp"
      }),
      retries: 3
      // scheduledFor: "2026-12-31T23:59:00.000Z"  // descomentar para envío diferido
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