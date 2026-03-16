import type { Request, Response } from 'express';
import { GenerateApiKey } from '../../../application/use cases/generateApiKey.js';
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.js';

export class AuthController {
  constructor(private readonly microserviceAuthRepository: MicroserviceAuthRepository) {}

  async registerMicroservice(req: Request, res: Response): Promise<void> {
    try {
      const { active } = req.body;

      const useCase = new GenerateApiKey(this.microserviceAuthRepository);
      const result = await useCase.execute({
        ...(active !== undefined && { active })
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          data: {
            microserviceId: result.microserviceId,
            key: result.key
          }
        });
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
