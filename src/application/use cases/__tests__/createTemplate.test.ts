import { CreateTemplateUseCase } from '../template/createTemplate.ts'
import type { CreateTemplateInput } from '../template/createTemplate.ts'
import type { TemplateRepository } from '../../../domain/repositories/templateRepository.ts'
import { Template } from '../../../domain/entities/template.ts'

describe('CreateTemplateUseCase', () => {
  let useCase: CreateTemplateUseCase
  let mockRepository: jest.Mocked<TemplateRepository>

  beforeEach(() => {
    // Crear un mock del repositorio
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    useCase = new CreateTemplateUseCase(mockRepository)
  })

  describe('Casos de éxito', () => {
    it('debería crear un template exitosamente con todos los campos', async () => {
      const input: CreateTemplateInput = {
        templateId: 'welcome-email',
        subject: 'Bienvenido {{userName}}',
        htmlBody: '<h1>Hola {{userName}}</h1><p>Bienvenido a nuestro servicio</p>',
        microserviceOwner: 'auth-service',
        textBody: 'Hola {{userName}}, bienvenido a nuestro servicio'
      }

      mockRepository.findById.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      const result = await useCase.execute(input)

      if (!result.success) console.log('Test 1 Error:', result.message)
      expect(result.success).toBe(true)
      expect(result.message).toBe('Template created successfully')
      expect(result.templateId).toBe('welcome-email')
      expect(mockRepository.findById).toHaveBeenCalledWith('welcome-email')
      expect(mockRepository.save).toHaveBeenCalledTimes(1)
    })

    it('debería crear un template exitosamente sin textBody', async () => {
      const input: CreateTemplateInput = {
        templateId: 'notification-email',
        subject: 'Notificación importante',
        htmlBody: '<h1>Notificación</h1>',
        microserviceOwner: 'notification-service'
      }

      mockRepository.findById.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)
      expect(result.templateId).toBe('notification-email')
    })

    it('debería aceptar variables válidas en el subject', async () => {
      const input: CreateTemplateInput = {
        templateId: 'test-subject',
        subject: 'Hola {{firstName}} {{lastName}}',
        htmlBody: '<p>Content</p>',
        microserviceOwner: 'test-service'
      }

      mockRepository.findById.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)
    })
  })

  describe('Validación de template duplicado', () => {
    it('debería fallar si el templateId ya existe', async () => {
      const existingTemplate = Template.create({
        templateId: 'existing-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      })

      mockRepository.findById.mockResolvedValue(existingTemplate)

      const input: CreateTemplateInput = {
        templateId: 'existing-template',
        subject: 'Another subject',
        htmlBody: '<p>Another body</p>',
        microserviceOwner: 'another-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain("already exists")
      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('Validación de sintaxis de variables', () => {
    it('debería fallar con llaves sin cerrar en htmlBody', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Hola {{userName</p>',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid variable syntax in HTML body')
      expect(result.message).toContain('Mismatched variable braces')
    })

    it('debería fallar con llaves sin cerrar en textBody', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Valid {{userName}}</p>',
        microserviceOwner: 'test-service',
        textBody: 'Hola {{userName'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid variable syntax in text body')
    })

    it('debería fallar con llaves sin cerrar en subject', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Hola {{userName',
        htmlBody: '<p>Valid content</p>',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid variable syntax in subject')
    })

    it('debería fallar con variable vacía', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Hola {{}}</p>',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Empty variable name')
    })

    it('debería fallar con nombre de variable inválido (con espacios)', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Hola {{user name}}</p>',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid variable name')
    })

    it('debería fallar con nombre de variable inválido (caracteres especiales)', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Hola {{user@name}}</p>',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid variable name')
    })

    it('debería fallar con llaves simples', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Hola {userName}</p>',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Single braces found')
    })

    it('debería aceptar nombres de variables válidos con números y guiones bajos', async () => {
      mockRepository.findById.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>{{user_name}} {{user123}} {{USER_NAME_2}}</p>',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)
    })
  })

  describe('Validación de campos requeridos', () => {
    it('debería fallar si el templateId está vacío', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const input: CreateTemplateInput = {
        templateId: '   ',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Template ID is required')
    })

    it('debería fallar si el subject está vacío', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: '   ',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Subject is required')
    })

    it('debería fallar si el htmlBody está vacío', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '   ',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('HTML body is required')
    })

    it('debería fallar si el microserviceOwner está vacío', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: '   '
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Microservice owner is required')
    })
  })

  describe('Manejo de errores del repositorio', () => {
    it('debería manejar errores al buscar template existente', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database connection error'))

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to create template')
      expect(result.message).toContain('Database connection error')
    })

    it('debería manejar errores al guardar el template', async () => {
      mockRepository.findById.mockResolvedValue(null)
      mockRepository.save.mockRejectedValue(new Error('Failed to save to database'))

      const input: CreateTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to create template')
      expect(result.message).toContain('Failed to save to database')
    })
  })
})
