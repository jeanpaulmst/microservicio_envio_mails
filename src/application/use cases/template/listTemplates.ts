import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js'

export interface ListTemplatesOutput {
  success: boolean
  message: string
  templates?: Array<{
    templateId: string
    subject: string
    htmlBody: string
    textBody: string | null
  }>
}

export class ListTemplatesUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async execute(microserviceId: string): Promise<ListTemplatesOutput> {
    try {
      const templates = await this.templateRepository.findByOwner(microserviceId)

      return {
        success: true,
        message: 'Templates retrieved successfully',
        templates: templates.map(t => ({
          templateId: t.templateId,
          subject: t.subject,
          htmlBody: t.htmlBody,
          textBody: t.textBody
        }))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return {
        success: false,
        message: `Failed to list templates: ${errorMessage}`
      }
    }
  }
}
