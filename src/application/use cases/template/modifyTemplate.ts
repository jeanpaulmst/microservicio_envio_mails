import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js'
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.js'
import { validateTemplateFormat } from './shared/templateValidations.js'
import { validateMicroserviceAuth } from '../validateMicroserviceAuth.js'

export interface ModifyTemplateInput {
  templateId: string
  subject: string
  htmlBody: string
  textBody?: string
  authKey: string
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
    private readonly templateRepository: TemplateRepository,
    private readonly microserviceAuthRepository: MicroserviceAuthRepository
  ) {}

  async execute(input: ModifyTemplateInput): Promise<ModifyTemplateOutput> {
    try {
      if (!input.authKey?.trim()) {
        return { success: false, message: 'Authentication key is required' }
      }

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

      // 2. Validar que la key sea valida y que el microservicio sea dueño de la plantilla
      const authResult = await validateMicroserviceAuth(
        input.authKey,
        existingTemplate.microserviceOwner,
        this.microserviceAuthRepository
      )

      if (!authResult.valid) {
        return { success: false, message: authResult.error ?? 'Authentication failed' }
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
