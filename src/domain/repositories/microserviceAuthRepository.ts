import { MicroserviceAuth } from '../entities/microserviceAuth.js'

export interface MicroserviceAuthRepository {
  save(microserviceAuth: MicroserviceAuth): Promise<void>
  findByKey(key: string): Promise<MicroserviceAuth | null>
  findByMicroserviceOwner(microserviceOwner: string): Promise<MicroserviceAuth | null>
  findAll(): Promise<MicroserviceAuth[]>
  update(microserviceAuth: MicroserviceAuth): Promise<void>
  delete(key: string): Promise<void>
}
