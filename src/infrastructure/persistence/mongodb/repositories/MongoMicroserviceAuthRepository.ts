import { MicroserviceAuth } from '../../../../domain/entities/microserviceAuth.js';
import type { MicroserviceAuthRepository } from '../../../../domain/repositories/microserviceAuthRepository.js';
import { MicroserviceAuthModel } from '../schemas/microserviceAuthSchema.js';

export class MongoMicroserviceAuthRepository implements MicroserviceAuthRepository {
  async save(microserviceAuth: MicroserviceAuth): Promise<void> {
    await MicroserviceAuthModel.create({
      key: microserviceAuth.key,
      active: microserviceAuth.active
    });
  }

  async findByKey(key: string): Promise<MicroserviceAuth | null> {
    const doc = await MicroserviceAuthModel.findOne({ key });

    if (!doc) {
      return null;
    }

    return MicroserviceAuth.reconstitute({
      key: doc.key,
      active: doc.active
    });
  }

  async findAll(): Promise<MicroserviceAuth[]> {
    const docs = await MicroserviceAuthModel.find();

    return docs.map(doc => MicroserviceAuth.reconstitute({
      key: doc.key,
      active: doc.active
    }));
  }

  async update(microserviceAuth: MicroserviceAuth): Promise<void> {
    await MicroserviceAuthModel.updateOne(
      { key: microserviceAuth.key },
      {
        $set: {
          active: microserviceAuth.active
        }
      }
    );
  }

  async delete(key: string): Promise<void> {
    await MicroserviceAuthModel.deleteOne({ key });
  }
}
