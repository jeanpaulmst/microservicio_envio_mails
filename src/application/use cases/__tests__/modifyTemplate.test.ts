import { ModifyTemplateUseCase } from '../template/modifyTemplate.ts'
import type { ModifyTemplateInput } from '../template/modifyTemplate.ts'
import type { TemplateRepository } from '../../../domain/repositories/templateRepository.ts'
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.ts'
import { Template } from '../../../domain/entities/template.ts'
import { MicroserviceAuth } from '../../../domain/entities/microserviceAuth.ts'

describe('ModifyTemplateUseCase', () => {
  let useCase: ModifyTemplateUseCase
  let mockTemplateRepository: jest.Mocked<TemplateRepository>
  let mockAuthRepository: jest.Mocked<MicroserviceAuthRepository>

  beforeEach(() => {
    // Crear mocks de los repositorios
    mockTemplateRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    mockAuthRepository = {
      save: jest.fn(),
      findByKey: jest.fn(),
      findByMicroserviceOwner: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    useCase = new ModifyTemplateUseCase(mockTemplateRepository, mockAuthRepository)
  })

  describe('Casos de éxito', () => {
    it('debería modificar una plantilla exitosamente con todos los campos', async () => {
      const existingTemplate = Template.create({
        templateId: 'welcome-email',
        subject: 'Old Subject',
        htmlBody: '<p>Old Body</p>',
        microserviceOwner: 'auth-service',
        textBody: 'Old Text'
      })

      const authKey = MicroserviceAuth.create({
        key: 'test-auth-key',
        microserviceOwner: 'auth-service',
        active: true
      })

      mockTemplateRepository.findById.mockResolvedValue(existingTemplate)
      mockAuthRepository.findByKey.mockResolvedValue(authKey)
      mockTemplateRepository.update.mockResolvedValue(undefined)

      const input: ModifyTemplateInput = {
        templateId: 'welcome-email',
        subject: 'Welcome {{userName}}',
        htmlBody: '<h1>Hello {{userName}}</h1><p>Welcome to our service</p>',
        textBody: 'Hello {{userName}}, welcome!',
        authKey: 'test-auth-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Template updated successfully')
      expect(result.template).toBeDefined()
      expect(result.template?.subject).toBe('Welcome {{userName}}')
      expect(result.template?.htmlBody).toBe('<h1>Hello {{userName}}</h1><p>Welcome to our service</p>')
      expect(result.template?.textBody).toBe('Hello {{userName}}, welcome!')
      expect(mockTemplateRepository.update).toHaveBeenCalledTimes(1)
    })

    it('debería modificar una plantilla sin textBody', async () => {
      const existingTemplate = Template.create({
        templateId: 'notification-email',
        subject: 'Old Subject',
        htmlBody: '<p>Old Body</p>',
        microserviceOwner: 'notification-service'
      })

      const authKey = MicroserviceAuth.create({
        key: 'notification-key',
        microserviceOwner: 'notification-service',
        active: true
      })

      mockTemplateRepository.findById.mockResolvedValue(existingTemplate)
      mockAuthRepository.findByKey.mockResolvedValue(authKey)
      mockTemplateRepository.update.mockResolvedValue(undefined)

      const input: ModifyTemplateInput = {
        templateId: 'notification-email',
        subject: 'Updated Notification',
        htmlBody: '<h1>Updated Content</h1>',
        authKey: 'notification-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)
      expect(result.template?.textBody).toBeNull()
    })

    it('debería aceptar variables válidas en todos los campos', async () => {
      const existingTemplate = Template.create({
        templateId: 'multi-var-email',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      })

      const authKey = MicroserviceAuth.create({
        key: 'test-key',
        microserviceOwner: 'test-service',
        active: true
      })

      mockTemplateRepository.findById.mockResolvedValue(existingTemplate)
      mockAuthRepository.findByKey.mockResolvedValue(authKey)
      mockTemplateRepository.update.mockResolvedValue(undefined)

      const input: ModifyTemplateInput = {
        templateId: 'multi-var-email',
        subject: 'Hello {{firstName}} {{lastName}}',
        htmlBody: '<p>{{user_id}} - {{email123}}</p>',
        textBody: 'User {{USER_NAME}} info',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)
    })
  })

  describe('Validación de existencia de plantilla', () => {
    it('debería fallar si la plantilla no existe', async () => {
      mockTemplateRepository.findById.mockResolvedValue(null)

      const input: ModifyTemplateInput = {
        templateId: 'non-existent',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('does not exist')
      expect(mockAuthRepository.findByKey).not.toHaveBeenCalled()
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar si la plantilla está eliminada (soft delete)', async () => {
      const deletedTemplate = Template.create({
        templateId: 'deleted-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      })
      deletedTemplate.delete() // Marca como eliminada

      mockTemplateRepository.findById.mockResolvedValue(deletedTemplate)

      const input: ModifyTemplateInput = {
        templateId: 'deleted-template',
        subject: 'Updated',
        htmlBody: '<p>Updated</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('has been deleted')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })
  })

  describe('Validación de autenticación y permisos', () => {
    it('debería fallar si authKey está vacío', async () => {
      const existingTemplate = Template.create({
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      })

      mockTemplateRepository.findById.mockResolvedValue(existingTemplate)

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Updated',
        htmlBody: '<p>Updated</p>',
        authKey: '   '
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Authentication key is required')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar si authKey no existe', async () => {
      const existingTemplate = Template.create({
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      })

      mockTemplateRepository.findById.mockResolvedValue(existingTemplate)
      mockAuthRepository.findByKey.mockResolvedValue(null)

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Updated',
        htmlBody: '<p>Updated</p>',
        authKey: 'invalid-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid authentication key')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar si authKey no está activo', async () => {
      const existingTemplate = Template.create({
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      })

      const inactiveAuth = MicroserviceAuth.create({
        key: 'inactive-key',
        microserviceOwner: 'test-service',
        active: false
      })

      mockTemplateRepository.findById.mockResolvedValue(existingTemplate)
      mockAuthRepository.findByKey.mockResolvedValue(inactiveAuth)

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Updated',
        htmlBody: '<p>Updated</p>',
        authKey: 'inactive-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('not active')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar si el microserviceOwner no coincide', async () => {
      const existingTemplate = Template.create({
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'service-A'
      })

      const authFromOtherService = MicroserviceAuth.create({
        key: 'other-service-key',
        microserviceOwner: 'service-B',
        active: true
      })

      mockTemplateRepository.findById.mockResolvedValue(existingTemplate)
      mockAuthRepository.findByKey.mockResolvedValue(authFromOtherService)

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Updated',
        htmlBody: '<p>Updated</p>',
        authKey: 'other-service-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('do not have permission')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })
  })

  describe('Validación de formato y sintaxis', () => {
    const setupValidTemplateAndAuth = () => {
      const template = Template.create({
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      })

      const auth = MicroserviceAuth.create({
        key: 'test-key',
        microserviceOwner: 'test-service',
        active: true
      })

      mockTemplateRepository.findById.mockResolvedValue(template)
      mockAuthRepository.findByKey.mockResolvedValue(auth)
      mockTemplateRepository.update.mockResolvedValue(undefined)
    }

    it('debería fallar con llaves sin cerrar en subject', async () => {
      setupValidTemplateAndAuth()

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Hello {{userName',
        htmlBody: '<p>Valid</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid variable syntax in subject')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar con llaves sin cerrar en htmlBody', async () => {
      setupValidTemplateAndAuth()

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Valid Subject',
        htmlBody: '<p>Hello {{userName</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid variable syntax in HTML body')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar con llaves sin cerrar en textBody', async () => {
      setupValidTemplateAndAuth()

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Valid',
        htmlBody: '<p>Valid</p>',
        textBody: 'Hello {{userName',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid variable syntax in text body')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar con variable vacía', async () => {
      setupValidTemplateAndAuth()

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Hello {{}}</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Empty variable name')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar con nombre de variable inválido (espacios)', async () => {
      setupValidTemplateAndAuth()

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Hello {{user name}}</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid variable name')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar con nombre de variable inválido (caracteres especiales)', async () => {
      setupValidTemplateAndAuth()

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>{{user@email}}</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid variable name')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar con llaves simples', async () => {
      setupValidTemplateAndAuth()

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>{userName}</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Single braces found')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar si subject está vacío', async () => {
      setupValidTemplateAndAuth()

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: '   ',
        htmlBody: '<p>Valid</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Subject cannot be empty')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })

    it('debería fallar si htmlBody está vacío', async () => {
      setupValidTemplateAndAuth()

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Valid',
        htmlBody: '   ',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('HTML body cannot be empty')
      expect(mockTemplateRepository.update).not.toHaveBeenCalled()
    })
  })

  describe('Manejo de errores del repositorio', () => {
    it('debería manejar errores al buscar la plantilla', async () => {
      mockTemplateRepository.findById.mockRejectedValue(new Error('Database error'))

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to modify template')
      expect(result.message).toContain('Database error')
    })

    it('debería manejar errores al buscar la autenticación', async () => {
      const template = Template.create({
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      })

      mockTemplateRepository.findById.mockResolvedValue(template)
      mockAuthRepository.findByKey.mockRejectedValue(new Error('Auth service error'))

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Updated',
        htmlBody: '<p>Updated</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to modify template')
      expect(result.message).toContain('Auth service error')
    })

    it('debería manejar errores al actualizar la plantilla', async () => {
      const template = Template.create({
        templateId: 'test-template',
        subject: 'Test',
        htmlBody: '<p>Test</p>',
        microserviceOwner: 'test-service'
      })

      const auth = MicroserviceAuth.create({
        key: 'test-key',
        microserviceOwner: 'test-service',
        active: true
      })

      mockTemplateRepository.findById.mockResolvedValue(template)
      mockAuthRepository.findByKey.mockResolvedValue(auth)
      mockTemplateRepository.update.mockRejectedValue(new Error('Update failed'))

      const input: ModifyTemplateInput = {
        templateId: 'test-template',
        subject: 'Updated',
        htmlBody: '<p>Updated</p>',
        authKey: 'test-key'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to modify template')
      expect(result.message).toContain('Update failed')
    })
  })
})
