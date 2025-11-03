import { Template } from '../../../domain/entities/template.js'
import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js'
import { validateTemplateFormat } from './shared/templateValidations.js'

export interface CreateTemplateInput {
  templateId: string
  subject: string
  htmlBody: string
  microserviceOwner: string
  textBody?: string
}

export interface CreateTemplateOutput {
  success: boolean
  message: string
  templateId?: string
}

export class CreateTemplateUseCase {
  constructor(private readonly templateRepository: TemplateRepository) {}

  async execute(input: CreateTemplateInput): Promise<CreateTemplateOutput> {
    try {

      //valida que el templateId no exista
      const existingTemplate = await this.templateRepository.findById(input.templateId)
      if (existingTemplate !== null) {
        return {
          success: false,
          message: `Template with ID '${input.templateId}' already exists`
        }
      }

      //valida el formato de los datos (sintaxis de variables)
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

      // Crear la entidad Template (esto tambi�n valida que subject y htmlBody no est�n vac�os)
      const templateParams: {
        templateId: string
        subject: string
        htmlBody: string
        microserviceOwner: string
        textBody?: string
      } = {
        templateId: input.templateId,
        subject: input.subject,
        htmlBody: input.htmlBody,
        microserviceOwner: input.microserviceOwner
      }

      if (input.textBody) {
        templateParams.textBody = input.textBody
      }

      const template = Template.create(templateParams)

      //guarda la plantilla en la base de datos
      await this.templateRepository.save(template)

      return {
        success: true,
        message: 'Template created successfully',
        templateId: template.templateId
      }

    } catch (error) {
      // Manejo de errores de validación de la entidad o errores del repositorio
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return {
        success: false,
        message: `Failed to create template: ${errorMessage}`
      }
    }
  }
}
