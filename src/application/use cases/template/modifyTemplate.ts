import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js'
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.js'
import { validateTemplateFormat } from './shared/templateValidations.js'

export interface ModifyTemplateInput {
  templateId: string
  subject: string
  htmlBody: string
  textBody?: string
  authKey: string // Key para autenticaci�n del microservicio
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
      // 1. Validar que la plantilla exista
      const existingTemplate = await this.templateRepository.findById(input.templateId)

      if (existingTemplate === null) {
        return {
          success: false,
          message: `Template with ID '${input.templateId}' does not exist`
        }
      }

      // Verificar que la plantilla no est� eliminada (soft delete)
      if (existingTemplate.deletedAt !== null) {
        return {
          success: false,
          message: `Template with ID '${input.templateId}' has been deleted`
        }
      }

      // 2. Validar autenticaci�n y permisos sobre el microserviceOwner
      const authValidation = await this.validateAuthentication(
        input.authKey,
        existingTemplate.microserviceOwner
      )

      if (!authValidation.isValid) {
        return {
          success: false,
          message: authValidation.error || 'Authentication failed'
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

      // 6. Retornar �xito con los datos actualizados
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

  /**
   * Valida que el authKey sea v�lido y tenga permisos sobre el microserviceOwner
   */
  private async validateAuthentication(
    authKey: string,
    microserviceOwner: string
  ): Promise<{ isValid: boolean; error?: string }> {
    // Validar que authKey no est� vac�o
    if (!authKey?.trim()) {
      return {
        isValid: false,
        error: 'Authentication key is required'
      }
    }

    // Buscar la autenticaci�n por key
    const microserviceAuth = await this.microserviceAuthRepository.findByKey(authKey)

    if (microserviceAuth === null) {
      return {
        isValid: false,
        error: 'Invalid authentication key'
      }
    }

    // Verificar que la autenticacion esta activa
    if (!microserviceAuth.active) {
      return {
        isValid: false,
        error: 'Authentication key is not active'
      }
    }

    // Verificar que el microserviceOwner coincida
    if (microserviceAuth.microserviceOwner !== microserviceOwner) {
      return {
        isValid: false,
        error: 'You do not have permission to modify this template'
      }
    }

    return { isValid: true }
  }
}
