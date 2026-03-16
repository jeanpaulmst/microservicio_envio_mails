import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js'
import { validateTemplateFormat } from './shared/templateValidations.js'

export interface ModifyTemplateInput {
  templateId: string
  subject: string
  htmlBody: string
  textBody?: string
  requesterMicroserviceId: string
}

export interface ModifyTemplateOutput {
  success: boolean
  message: string
  template?: {
    templateId: string
    subject: string
    htmlBody: string
    textBody: string | null
    microserviceOwner: string
  }
}

export class ModifyTemplateUseCase {
  constructor(
    private readonly templateRepository: TemplateRepository
  ) {}

  async execute(input: ModifyTemplateInput): Promise<ModifyTemplateOutput> {
    try {
      // 1. Validar que la plantilla exista
      const existingTemplate = await this.templateRepository.findById(input.templateId)

      if (existingTemplate === null) {
        return {
          success: false,
          message: `Template with ID '${input.templateId}' does not exist`
        }
      }

      // Verificar que la plantilla no este eliminada (soft delete)
      if (existingTemplate.deletedAt !== null) {
        return {
          success: false,
          message: `Template with ID '${input.templateId}' has been deleted`
        }
      }

      // 2. Validar que el microservicio sea el propietario de la plantilla
      if (existingTemplate.microserviceOwner !== input.requesterMicroserviceId) {
        return {
          success: false,
          message: `Microservice does not have permission to modify template '${input.templateId}'`
        }
      }

      // 3. Validar el formato de los nuevos datos (sintaxis de variables)
      const validationParams: { subject: string; htmlBody: string; textBody?: string } = {
        subject: input.subject,
        htmlBody: input.htmlBody
      }

      if (input.textBody !== undefined) {
        validationParams.textBody = input.textBody
      }

      const formatValidation = validateTemplateFormat(validationParams)

      if (!formatValidation.isValid) {
        return {
          success: false,
          message: formatValidation.error || 'Invalid template format'
        }
      }

      // 4. Actualizar la plantilla usando los metodos de la entidad
      try {
        existingTemplate.updateSubject(input.subject)
        existingTemplate.updateHtmlBody(input.htmlBody)
        existingTemplate.updateTextBody(input.textBody || null)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Validation error'
        return {
          success: false,
          message: `Failed to update template: ${errorMessage}`
        }
      }

      // 5. Guardar la plantilla actualizada en la base de datos
      await this.templateRepository.update(existingTemplate)

      return {
        success: true,
        message: 'Template updated successfully',
        template: {
          templateId: existingTemplate.templateId,
          subject: existingTemplate.subject,
          htmlBody: existingTemplate.htmlBody,
          textBody: existingTemplate.textBody,
          microserviceOwner: existingTemplate.microserviceOwner
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return {
        success: false,
        message: `Failed to modify template: ${errorMessage}`
      }
    }
  }
}
