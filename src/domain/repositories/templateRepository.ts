import { Template } from '../entities/template.js'

export interface TemplateRepository {
  save(template: Template): Promise<void>
  findById(templateId: string): Promise<Template | null>
  findAll(): Promise<Template[]>
  findByOwner(microserviceOwner: string): Promise<Template[]>
  update(template: Template): Promise<void>
  delete(templateId: string): Promise<void>
}
