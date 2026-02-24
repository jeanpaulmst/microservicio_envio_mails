import type { MicroserviceAuthRepository } from '../../domain/repositories/microserviceAuthRepository.js'
import { validateMicroserviceExistance } from './validateMicroserviceExistance.js'

export async function validateMicroserviceAuth(
  key: string,
  resourceOwner: string,
  repository: MicroserviceAuthRepository
): Promise<{ valid: boolean; error?: string }> {
  const result = await validateMicroserviceExistance(key, repository)

  if (!result.valid) {
    return { valid: false, error: 'Invalid API key' }
  }

  if (result.microserviceOwner !== resourceOwner) {
    return { valid: false, error: 'You do not have permission to perform this action' }
  }

  return { valid: true }
}
