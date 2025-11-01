import { Template } from '../entities/template.ts'

export interface TemplateRepository {
  save(template: Template): Promise<void>
  findById(templateId: string): Promise<Template | null>
  findAll(): Promise<Template[]>
  update(template: Template): Promise<void>
  delete(templateId: string): Promise<void>
}
