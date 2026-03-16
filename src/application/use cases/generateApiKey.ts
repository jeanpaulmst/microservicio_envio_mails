import { MicroserviceAuth } from '../../domain/entities/microserviceAuth.js'
import type { MicroserviceAuthRepository } from '../../domain/repositories/microserviceAuthRepository.js'
import crypto from 'crypto'

export interface GenerateApiKeyInput {
  active?: boolean
}

export interface GenerateApiKeyOutput {
  success: boolean
  message: string
  microserviceId?: string
  key?: string
}

export class GenerateApiKey {
  constructor(private readonly microserviceAuthRepository: MicroserviceAuthRepository) {}

  async execute(input: GenerateApiKeyInput): Promise<GenerateApiKeyOutput> {
    try {
      const rawKey = crypto.randomBytes(32).toString('hex')
      const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex')

      const microserviceAuth = MicroserviceAuth.create({
        key: hashedKey,
        ...(input.active !== undefined && { active: input.active })
      })

      await this.microserviceAuthRepository.save(microserviceAuth)

      return {
        success: true,
        message: 'api-key created successfully',
        microserviceId: microserviceAuth.microserviceId,
        key: rawKey
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.log('Error generating api-key: ', error)
      return {
        success: false,
        message: `Failed to create api-key: ${errorMessage}`
      }
    }
  }
}
