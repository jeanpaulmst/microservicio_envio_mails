# Microservicio de Envío de Mails

## Tecnologías

El servicio está construido con Node.js y TypeScript, siguiendo una Arquitectura Hexagonal (Clean Architecture) con principios de Domain-Driven Design. Utiliza Express como framework HTTP, MongoDB con Mongoose para la persistencia, Nodemailer para el envío de correos, RabbitMQ con amqplib para la mensajería entre microservicios, node-cron para la ejecución de tareas programadas, y Docker para la contenedorización del entorno.

## Cómo levantar el proyecto

### Requisitos

- [Node.js](https://nodejs.org/) v18 o superior
- [Docker](https://www.docker.com/) y Docker Compose

### Pasos

1. Clonar el repositorio e instalar dependencias:
   ```bash
   npm install
   ```

2. Crear el archivo `.env` en la raíz del proyecto tomando como base `.env.example` y completar las variables de entorno.

3. Levantar los contenedores:
   ```bash
   docker-compose up -d
   ```

## Prueba de envío de mensajes via RabbitMQ

Con los contenedores corriendo, ejecutar el script mock desde la raíz del proyecto para publicar un mensaje en el exchange:

```bash
node src/mocksRabbit/senderMock.js
```

## Monitoreo de RabbitMQ

UI web disponible en `http://localhost:15672` (usuario y contraseña: `guest`).

Para consultar el estado de la cola por terminal:

```bash
curl -s -u guest:guest http://localhost:15672/api/queues/%2F/email-microservice-queue
```
