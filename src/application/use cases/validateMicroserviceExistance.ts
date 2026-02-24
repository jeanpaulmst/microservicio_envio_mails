import type { MicroserviceAuthRepository } from '../../domain/repositories/microserviceAuthRepository.js'
import crypto from 'crypto'

export async function validateMicroserviceExistance(
  key: string,
  repository: MicroserviceAuthRepository
): Promise<{ valid: boolean; microserviceOwner?: string }> {
  const hashedKey = crypto.createHash('sha256').update(key).digest('hex')
  const auth = await repository.findByKey(hashedKey)

  if (auth === null) {
    return { valid: false }
  }

  return { valid: true, microserviceOwner: auth.microserviceOwner }
}
