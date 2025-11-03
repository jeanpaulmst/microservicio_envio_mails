/**
 * Validaciones compartidas para los casos de uso de Template
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Valida que la sintaxis de variables sea correcta
 * Las variables deben tener el formato: {{nombreVariable}}
 * No se permiten llaves sin cerrar o variables anidadas
 */
export function validateVariableSyntax(text: string): ValidationResult {
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

      // Validar que el nombre de variable no esté vacío
      if (variableName === '') {
        return {
          isValid: false,
          error: 'Empty variable name found: {{}}'
        }
      }

      // Validar que el nombre de variable solo contenga caracteres válidos (letras, números, guiones bajos)
      if (!/^[a-zA-Z0-9_]+$/.test(variableName)) {
        return {
          isValid: false,
          error: `Invalid variable name '${variableName}': only letters, numbers and underscores allowed`
        }
      }
    }
  }

  // Primero, remover todas las variables válidas del texto
  const textWithoutValidVars = text.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, '')

  // Ahora verificar si quedan llaves sueltas después de remover las variables válidas
  const singleOpenBrace = /\{(?!\{)/
  const singleCloseBrace = /(?<!\})\}/

  if (singleOpenBrace.test(textWithoutValidVars) || singleCloseBrace.test(textWithoutValidVars)) {
    return {
      isValid: false,
      error: 'Single braces found: use {{ }} for variables'
    }
  }

  return { isValid: true }
}

/**
 * Valida el formato completo de una plantilla (subject, htmlBody, textBody)
 */
export function validateTemplateFormat(params: {
  subject: string
  htmlBody: string
  textBody?: string
}): ValidationResult {
  // Validar sintaxis en subject
  const subjectValidation = validateVariableSyntax(params.subject)
  if (!subjectValidation.isValid) {
    return {
      isValid: false,
      error: `Invalid variable syntax in subject: ${subjectValidation.error}`
    }
  }

  // Validar sintaxis en htmlBody
  const htmlBodyValidation = validateVariableSyntax(params.htmlBody)
  if (!htmlBodyValidation.isValid) {
    return {
      isValid: false,
      error: `Invalid variable syntax in HTML body: ${htmlBodyValidation.error}`
    }
  }

  // Validar sintaxis en textBody si existe
  if (params.textBody) {
    const textBodyValidation = validateVariableSyntax(params.textBody)
    if (!textBodyValidation.isValid) {
      return {
        isValid: false,
        error: `Invalid variable syntax in text body: ${textBodyValidation.error}`
      }
    }
  }

  return { isValid: true }
}
