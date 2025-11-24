import dotenv from "dotenv";
import { MongoConnection } from "./infrastructure/persistence/mongodb/connection.js";
import { createApp } from "./infrastructure/api/server.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mail_service';
const PORT = process.env.PORT || 3000;

async function main() {
  try {
    // Conectar a MongoDB
    const mongoConnection = MongoConnection.getInstance();
    await mongoConnection.connect(MONGODB_URI);

    console.log(`MongoDB conectado: ${MONGODB_URI}`);

    // Crear y iniciar el servidor Express
    const app = createApp();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Microservicio de envío de mails iniciado`);
      console.log(`📡 API REST disponible en http://localhost:${PORT}`);
      console.log(`✅ Endpoints:`);
      console.log(`   POST   /api/templates`);
      console.log(`   PUT    /api/templates/:templateId`);
      console.log(`   POST   /api/auth/register`);
      console.log(`   GET    /health`);
    });

    // Manejo de señales para graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} recibido, cerrando servidor...`);

      server.close(() => {
        console.log('Servidor HTTP cerrado');
      });

      await mongoConnection.disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Error al iniciar el microservicio:', error);
    process.exit(1);
  }
}

main();
