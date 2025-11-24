import type { Request, Response } from 'express';
import { CreateMicroserviceAuthUseCase } from '../../../application/use cases/createMicroserviceAuth.js';
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.js';

export class AuthController {
  constructor(private readonly microserviceAuthRepository: MicroserviceAuthRepository) {}

  async registerMicroservice(req: Request, res: Response): Promise<void> {
    try {
      const { key, microserviceOwner, active } = req.body;

      // Validar que los campos requeridos estén presentes
      if (!key || !microserviceOwner) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: key, microserviceOwner'
        });
        return;
      }

      const useCase = new CreateMicroserviceAuthUseCase(this.microserviceAuthRepository);
      const result = await useCase.execute({
        key,
        microserviceOwner,
        active
      });

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        message: `Internal server error: ${errorMessage}`
      });
    }
  }
}
