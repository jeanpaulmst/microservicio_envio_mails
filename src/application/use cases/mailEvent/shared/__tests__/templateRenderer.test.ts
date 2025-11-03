import {
  extractTemplateVariables,
  extractAllTemplateVariables,
  validateTemplateData,
  renderTemplate,
  renderFullTemplate
} from '../templateRenderer'

describe('Template Renderer Functions', () => {
  describe('extractTemplateVariables', () => {
    it('debe extraer variables de un texto simple', () => {
      const text = 'Hola {{userName}}, bienvenido a {{appName}}'
      const variables = extractTemplateVariables(text)

      expect(variables).toEqual(['userName', 'appName'])
    })

    it('debe retornar array vacío si no hay variables', () => {
      const text = 'Texto sin variables'
      const variables = extractTemplateVariables(text)

      expect(variables).toEqual([])
    })

    it('debe eliminar variables duplicadas', () => {
      const text = 'Hola {{userName}}, tu nombre es {{userName}}'
      const variables = extractTemplateVariables(text)

      expect(variables).toEqual(['userName'])
    })

    it('debe aceptar variables con números y guiones bajos', () => {
      const text = '{{user_id}} - {{email123}} - {{USER_NAME_2}}'
      const variables = extractTemplateVariables(text)

      expect(variables).toEqual(['user_id', 'email123', 'USER_NAME_2'])
    })

    it('no debe extraer llaves simples o mal formadas', () => {
      const text = 'Texto con {llave simple} y {{valida}}'
      const variables = extractTemplateVariables(text)

      expect(variables).toEqual(['valida'])
    })
  })

  describe('extractAllTemplateVariables', () => {
    it('debe extraer variables de subject, htmlBody y textBody', () => {
      const variables = extractAllTemplateVariables({
        subject: 'Hola {{userName}}',
        htmlBody: '<p>Email: {{email}}</p>',
        textBody: 'ID: {{userId}}'
      })

      expect(variables.sort()).toEqual(['email', 'userId', 'userName'].sort())
    })

    it('debe funcionar sin textBody', () => {
      const variables = extractAllTemplateVariables({
        subject: 'Hola {{userName}}',
        htmlBody: '<p>Email: {{email}}</p>'
      })

      expect(variables.sort()).toEqual(['email', 'userName'].sort())
    })

    it('debe eliminar duplicados entre subject, htmlBody y textBody', () => {
      const variables = extractAllTemplateVariables({
        subject: 'Hola {{userName}}',
        htmlBody: '<p>Hola {{userName}}, tu email es {{email}}</p>',
        textBody: 'Usuario: {{userName}}'
      })

      expect(variables.sort()).toEqual(['email', 'userName'].sort())
    })

    it('debe retornar array vacío si no hay variables', () => {
      const variables = extractAllTemplateVariables({
        subject: 'Sin variables',
        htmlBody: '<p>Sin variables</p>',
        textBody: 'Sin variables'
      })

      expect(variables).toEqual([])
    })
  })

  describe('validateTemplateData', () => {
    it('debe validar correctamente cuando todas las variables están presentes', () => {
      const requiredVariables = ['userName', 'email']
      const templateData = JSON.stringify({
        userName: 'Juan',
        email: 'juan@example.com'
      })

      const result = validateTemplateData(requiredVariables, templateData)

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('debe fallar si falta una variable requerida', () => {
      const requiredVariables = ['userName', 'email']
      const templateData = JSON.stringify({
        userName: 'Juan'
        // falta 'email'
      })

      const result = validateTemplateData(requiredVariables, templateData)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Missing required template variables')
      expect(result.missingVariables).toEqual(['email'])
    })

    it('debe fallar si templateData no es un JSON válido', () => {
      const requiredVariables = ['userName']
      const invalidJson = 'esto no es JSON'

      const result = validateTemplateData(requiredVariables, invalidJson)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('valid JSON string')
    })

    it('debe fallar si templateData es un array en vez de objeto', () => {
      const requiredVariables = ['userName']
      const templateData = JSON.stringify(['array', 'no', 'objeto'])

      const result = validateTemplateData(requiredVariables, templateData)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain('JSON object')
    })

    it('debe fallar si una variable está vacía', () => {
      const requiredVariables = ['userName', 'email']
      const templateData = JSON.stringify({
        userName: '',
        email: 'juan@example.com'
      })

      const result = validateTemplateData(requiredVariables, templateData)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain("Variable 'userName' cannot be empty")
    })

    it('debe fallar si una variable es null', () => {
      const requiredVariables = ['userName']
      const templateData = JSON.stringify({
        userName: null
      })

      const result = validateTemplateData(requiredVariables, templateData)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain("Variable 'userName' cannot be empty")
    })

    it('debe permitir variables extra que no se usan en el template', () => {
      const requiredVariables = ['userName']
      const templateData = JSON.stringify({
        userName: 'Juan',
        extraField: 'valor extra',
        anotherField: 123
      })

      const result = validateTemplateData(requiredVariables, templateData)

      expect(result.isValid).toBe(true)
    })
  })

  describe('renderTemplate', () => {
    it('debe renderizar un template simple con una variable', () => {
      const template = 'Hola {{userName}}'
      const templateData = JSON.stringify({ userName: 'Juan' })

      const result = renderTemplate(template, templateData)

      expect(result).toBe('Hola Juan')
    })

    it('debe renderizar múltiples variables', () => {
      const template = 'Hola {{firstName}} {{lastName}}, tu email es {{email}}'
      const templateData = JSON.stringify({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com'
      })

      const result = renderTemplate(template, templateData)

      expect(result).toBe('Hola Juan Pérez, tu email es juan@example.com')
    })

    it('debe renderizar la misma variable múltiples veces', () => {
      const template = 'Hola {{userName}}, bienvenido {{userName}}'
      const templateData = JSON.stringify({ userName: 'Juan' })

      const result = renderTemplate(template, templateData)

      expect(result).toBe('Hola Juan, bienvenido Juan')
    })

    it('debe dejar sin cambios las variables que no están en templateData', () => {
      const template = 'Hola {{userName}}, tu ID es {{userId}}'
      const templateData = JSON.stringify({ userName: 'Juan' })

      const result = renderTemplate(template, templateData)

      expect(result).toBe('Hola Juan, tu ID es {{userId}}')
    })

    it('debe convertir números a strings', () => {
      const template = 'Tu ID es {{userId}}'
      const templateData = JSON.stringify({ userId: 12345 })

      const result = renderTemplate(template, templateData)

      expect(result).toBe('Tu ID es 12345')
    })

    it('debe manejar HTML correctamente', () => {
      const template = '<h1>Hola {{userName}}</h1><p>Email: {{email}}</p>'
      const templateData = JSON.stringify({
        userName: 'Juan',
        email: 'juan@example.com'
      })

      const result = renderTemplate(template, templateData)

      expect(result).toBe('<h1>Hola Juan</h1><p>Email: juan@example.com</p>')
    })
  })

  describe('renderFullTemplate', () => {
    it('debe renderizar subject, htmlBody y textBody', () => {
      const template = {
        subject: 'Bienvenido {{userName}}',
        htmlBody: '<h1>Hola {{userName}}</h1><p>Email: {{email}}</p>',
        textBody: 'Hola {{userName}}, tu email es {{email}}'
      }
      const templateData = JSON.stringify({
        userName: 'Juan',
        email: 'juan@example.com'
      })

      const result = renderFullTemplate(template, templateData)

      expect(result.subject).toBe('Bienvenido Juan')
      expect(result.htmlBody).toBe('<h1>Hola Juan</h1><p>Email: juan@example.com</p>')
      expect(result.textBody).toBe('Hola Juan, tu email es juan@example.com')
    })

    it('debe manejar textBody como null', () => {
      const template = {
        subject: 'Bienvenido {{userName}}',
        htmlBody: '<h1>Hola {{userName}}</h1>'
      }
      const templateData = JSON.stringify({ userName: 'Juan' })

      const result = renderFullTemplate(template, templateData)

      expect(result.subject).toBe('Bienvenido Juan')
      expect(result.htmlBody).toBe('<h1>Hola Juan</h1>')
      expect(result.textBody).toBeNull()
    })

    it('debe manejar textBody vacío', () => {
      const template = {
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        textBody: null
      }
      const templateData = JSON.stringify({ userName: 'Juan' })

      const result = renderFullTemplate(template, templateData)

      expect(result.textBody).toBeNull()
    })
  })
})
