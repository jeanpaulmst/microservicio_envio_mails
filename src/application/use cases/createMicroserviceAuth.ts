import { MicroserviceAuth } from '../../domain/entities/microserviceAuth.js'
import type { MicroserviceAuthRepository } from '../../domain/repositories/microserviceAuthRepository.js'
import crypto from 'crypto'

export interface CreateMicroserviceAuthInput {
  key: string
  microserviceOwner: string
  active?: boolean
}

export interface CreateMicroserviceAuthOutput {
  success: boolean
  message: string
  key?: string
}

export class CreateMicroserviceAuthUseCase {
  constructor(private readonly microserviceAuthRepository: MicroserviceAuthRepository) {}

  async execute(input: CreateMicroserviceAuthInput): Promise<CreateMicroserviceAuthOutput> {
    try {
      // Validar que la key no esté vacía
      if (!input.key?.trim()) {
        return {
          success: false,
          message: 'Key is required'
        }
      }

      // Validar que el microserviceOwner no esté vacío
      if (!input.microserviceOwner?.trim()) {
        return {
          success: false,
          message: 'Microservice owner is required'
        }
      }

      // Verificar que el microserviceOwner no tenga ya una autenticación
      const existingAuthByOwner = await this.microserviceAuthRepository.findByMicroserviceOwner(input.microserviceOwner)
      if (existingAuthByOwner !== null) {
        return {
          success: false,
          message: `Microservice owner '${input.microserviceOwner}' already has an authentication key`
        }
      }

      // Hashear key antes de guardarla en la bd
      const hashed_key = crypto.createHash('sha256').update(input.key).digest('hex');

      // Crear la entidad MicroserviceAuth
      const microserviceAuth = MicroserviceAuth.create({
        key: hashed_key,
        microserviceOwner: input.microserviceOwner,
        ...(input.active !== undefined && { active: input.active })
      })

      // Guardar en el repositorio
      await this.microserviceAuthRepository.save(microserviceAuth)

      return {
        success: true,
        message: 'Microservice authentication created successfully',
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return {
        success: false,
        message: `Failed to create microservice authentication: ${errorMessage}`
      }
    }
  }
}
