import { Template } from '../../domain/entities/template.js'
import type { TemplateRepository } from '../../domain/repositories/templateRepository.js'

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

      //valida el formato de los datos
      const variableValidation = this.validateVariableSyntax(input.htmlBody)
      if (!variableValidation.isValid) {
        return {
          success: false,
          message: `Invalid variable syntax in HTML body: ${variableValidation.error}`
        }
      }

      //valida sintaxis en textBody si existe
      if (input.textBody) {
        const textBodyValidation = this.validateVariableSyntax(input.textBody)
        if (!textBodyValidation.isValid) {
          return {
            success: false,
            message: `Invalid variable syntax in text body: ${textBodyValidation.error}`
          }
        }
      }

      // Validar sintaxis en subject
      const subjectValidation = this.validateVariableSyntax(input.subject)
      if (!subjectValidation.isValid) {
        return {
          success: false,
          message: `Invalid variable syntax in subject: ${subjectValidation.error}`
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

  /**
   * Valida que la sintaxis de variables sea correcta
   * Las variables deben tener el formato: {{nombreVariable}}
   * No se permiten llaves sin cerrar o variables anidadas
   */
  private validateVariableSyntax(text: string): { isValid: boolean; error?: string } {
    // Verificar que todas las llaves de apertura tengan su cierre
    const openBraces = (text.match(/\{\{/g) || []).length
    const closeBraces = (text.match(/\}\}/g) || []).length

    if (openBraces !== closeBraces) {
      return {
        isValid: false,
        error: 'Mismatched variable braces: all {{ must have corresponding }}'
      }
    }

    // Verificar que no haya variables anidadas o mal formadas
    const variablePattern = /\{\{([^{}]*)\}\}/g
    const matches = text.match(variablePattern)

    if (matches) {
      for (const match of matches) {
        // Extraer el contenido entre llaves
        const variableName = match.slice(2, -2).trim()

        // Validar que el nombre de variable no est� vac�o
        if (variableName === '') {
          return {
            isValid: false,
            error: 'Empty variable name found: {{}}'
          }
        }

        // Validar que el nombre de variable solo contenga caracteres v�lidos (letras, n�meros, guiones bajos)
        if (!/^[a-zA-Z0-9_]+$/.test(variableName)) {
          return {
            isValid: false,
            error: `Invalid variable name '${variableName}': only letters, numbers and underscores allowed`
          }
        }
      }
    }

    // Verificar que no haya llaves sueltas (sin su par)
    const singleOpenBrace = /\{(?!\{)/g
    const singleCloseBrace = /(?<!\})\}/g

    if (singleOpenBrace.test(text) || singleCloseBrace.test(text)) {
      return {
        isValid: false,
        error: 'Single braces found: use {{ }} for variables'
      }
    }

    return { isValid: true }
  }
}
