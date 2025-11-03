/**
 * Funciones compartidas para renderizado y validación de templates
 * Utilizadas en el caso de uso de envío de mails
 */

/**
 * Extrae todas las variables de un texto con formato {{variableName}}
 * @returns Array de nombres de variables únicas
 */
export function extractTemplateVariables(text: string): string[] {
  const variablePattern = /\{\{([a-zA-Z0-9_]+)\}\}/g
  const matches = text.matchAll(variablePattern)
  const variables = new Set<string>()

  for (const match of matches) {
    variables.add(match[1])
  }

  return Array.from(variables)
}

/**
 * Extrae todas las variables de una plantilla completa (subject, htmlBody, textBody)
 */
export function extractAllTemplateVariables(params: {
  subject: string
  htmlBody: string
  textBody?: string | null
}): string[] {
  const allVariables = new Set<string>()

  // Extraer variables del subject
  extractTemplateVariables(params.subject).forEach(v => allVariables.add(v))

  // Extraer variables del htmlBody
  extractTemplateVariables(params.htmlBody).forEach(v => allVariables.add(v))

  // Extraer variables del textBody si existe
  if (params.textBody) {
    extractTemplateVariables(params.textBody).forEach(v => allVariables.add(v))
  }

  return Array.from(allVariables)
}

/**
 * Valida que el templateData sea un JSON válido y contenga todas las variables requeridas
 * @param requiredVariables - Variables que deben estar presentes
 * @param templateDataJson - JSON stringificado con los datos
 */
export function validateTemplateData(
  requiredVariables: string[],
  templateDataJson: string
): { isValid: boolean; error?: string; missingVariables?: string[] } {
  // Validar que sea un JSON válido
  let templateData: Record<string, unknown>
  try {
    templateData = JSON.parse(templateDataJson)
  } catch (error) {
    return {
      isValid: false,
      error: 'Template data must be a valid JSON string'
    }
  }

  // Validar que sea un objeto
  if (typeof templateData !== 'object' || templateData === null || Array.isArray(templateData)) {
    return {
      isValid: false,
      error: 'Template data must be a JSON object'
    }
  }

  const missingVariables: string[] = []

  for (const variable of requiredVariables) {
    if (!(variable in templateData)) {
      missingVariables.push(variable)
    } else {
      // Validar que el valor no sea null, undefined o string vacío
      const value = templateData[variable]
      if (value === null || value === undefined || value === '') {
        return {
          isValid: false,
          error: `Variable '${variable}' cannot be empty`
        }
      }
    }
  }

  if (missingVariables.length > 0) {
    return {
      isValid: false,
      error: `Missing required template variables: ${missingVariables.join(', ')}`,
      missingVariables
    }
  }

  return { isValid: true }
}

/**
 * Renderiza un template reemplazando las variables con los datos provistos
 * @param template - El texto del template con variables {{variableName}}
 * @param templateDataJson - JSON stringificado con los valores
 */
export function renderTemplate(
  template: string,
  templateDataJson: string
): string {
  const templateData: Record<string, unknown> = JSON.parse(templateDataJson)
  let rendered = template

  // Reemplazar cada variable con su valor
  for (const [key, value] of Object.entries(templateData)) {
    const variablePattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    rendered = rendered.replace(variablePattern, String(value))
  }

  return rendered
}

/**
 * Renderiza una plantilla completa (subject, htmlBody, textBody)
 */
export function renderFullTemplate(
  template: {
    subject: string
    htmlBody: string
    textBody?: string | null
  },
  templateDataJson: string
): {
  subject: string
  htmlBody: string
  textBody: string | null
} {
  return {
    subject: renderTemplate(template.subject, templateDataJson),
    htmlBody: renderTemplate(template.htmlBody, templateDataJson),
    textBody: template.textBody ? renderTemplate(template.textBody, templateDataJson) : null
  }
}
