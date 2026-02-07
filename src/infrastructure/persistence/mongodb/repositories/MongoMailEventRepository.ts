import { MailEvent, MailEventResult } from '../../../../domain/entities/mailEvent.js';
import type { MailEventRepository } from '../../../../domain/repositories/mailEventRepository.js';
import { MailEventModel } from '../schemas/mailEventSchema.js';

export class MongoMailEventRepository implements MailEventRepository {
  async save(mailEvent: MailEvent): Promise<void> {
    await MailEventModel.create({
      emailEventId: mailEvent.emailEventId,
      templateId: mailEvent.templateId,
      to: mailEvent.to,
      from: mailEvent.from,
      templateData: mailEvent.templateData,
      scheduledFor: mailEvent.scheduledFor,
      retries: mailEvent.retries,
      retryCount: mailEvent.retryCount,
      result: mailEvent.result
    });
  }

  async findById(id: string): Promise<MailEvent | null> {
    const doc = await MailEventModel.findOne({ emailEventId: id });

    if (!doc) {
      return null;
    }

    return MailEvent.reconstitute({
      emailEventId: doc.emailEventId,
      templateId: doc.templateId,
      to: doc.to,
      from: doc.from,
      templateData: doc.templateData,
      scheduledFor: doc.scheduledFor,
      retries: doc.retries,
      retryCount: doc.retryCount,
      result: doc.result as MailEventResult
    });
  }

  async findAll(): Promise<MailEvent[]> {
    const docs = await MailEventModel.find();

    return docs.map(doc => MailEvent.reconstitute({
      emailEventId: doc.emailEventId,
      templateId: doc.templateId,
      to: doc.to,
      from: doc.from,
      templateData: doc.templateData,
      scheduledFor: doc.scheduledFor,
      retries: doc.retries,
      retryCount: doc.retryCount,
      result: doc.result as MailEventResult
    }));
  }

  async delete(id: string): Promise<void> {
    await MailEventModel.deleteOne({ emailEventId: id });
  }
}
