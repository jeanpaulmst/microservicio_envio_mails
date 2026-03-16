import { Template } from '../../../../domain/entities/template.js';
import type { TemplateRepository } from '../../../../domain/repositories/templateRepository.js';
import { TemplateModel } from '../schemas/templateSchema.js';

export class MongoTemplateRepository implements TemplateRepository {
  async save(template: Template): Promise<void> {
    await TemplateModel.create({
      templateId: template.templateId,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody,
      microserviceOwner: template.microserviceOwner,
      deletedAt: template.deletedAt
    });
  }

  async findById(templateId: string): Promise<Template | null> {
    const doc = await TemplateModel.findOne({ templateId });

    if (!doc) {
      return null;
    }

    return Template.reconstitute({
      templateId: doc.templateId,
      subject: doc.subject,
      htmlBody: doc.htmlBody,
      textBody: doc.textBody,
      microserviceOwner: doc.microserviceOwner,
      deletedAt: doc.deletedAt
    });
  }

  async findAll(): Promise<Template[]> {
    const docs = await TemplateModel.find();

    return docs.map(doc => Template.reconstitute({
      templateId: doc.templateId,
      subject: doc.subject,
      htmlBody: doc.htmlBody,
      textBody: doc.textBody,
      microserviceOwner: doc.microserviceOwner,
      deletedAt: doc.deletedAt
    }));
  }

  async findByOwner(microserviceOwner: string): Promise<Template[]> {
    const docs = await TemplateModel.find({ microserviceOwner, deletedAt: null });

    return docs.map(doc => Template.reconstitute({
      templateId: doc.templateId,
      subject: doc.subject,
      htmlBody: doc.htmlBody,
      textBody: doc.textBody,
      microserviceOwner: doc.microserviceOwner,
      deletedAt: doc.deletedAt
    }));
  }

  async update(template: Template): Promise<void> {
    await TemplateModel.updateOne(
      { templateId: template.templateId },
      {
        $set: {
          subject: template.subject,
          htmlBody: template.htmlBody,
          textBody: template.textBody,
          deletedAt: template.deletedAt
        }
      }
    );
  }

  async delete(templateId: string): Promise<void> {
    await TemplateModel.deleteOne({ templateId });
  }
}
