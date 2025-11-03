import { CreateMicroserviceAuthUseCase } from '../createMicroserviceAuth.ts'
import type { CreateMicroserviceAuthInput } from '../createMicroserviceAuth.ts'
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.ts'
import { MicroserviceAuth } from '../../../domain/entities/microserviceAuth.ts'

describe('CreateMicroserviceAuthUseCase', () => {
  let useCase: CreateMicroserviceAuthUseCase
  let mockRepository: jest.Mocked<MicroserviceAuthRepository>

  beforeEach(() => {
    // Crear un mock del repositorio
    mockRepository = {
      save: jest.fn(),
      findByKey: jest.fn(),
      findByMicroserviceOwner: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    useCase = new CreateMicroserviceAuthUseCase(mockRepository)
  })

  describe('Casos de éxito', () => {
    it('debería crear una autenticación exitosamente con todos los campos', async () => {
      const input: CreateMicroserviceAuthInput = {
        key: 'auth-service-key-123',
        microserviceOwner: 'auth-service',
        active: true
      }

      mockRepository.findByKey.mockResolvedValue(null)
      mockRepository.findByMicroserviceOwner.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Microservice authentication created successfully')
      expect(result.key).toBe('auth-service-key-123')
      expect(mockRepository.findByKey).toHaveBeenCalledWith('auth-service-key-123')
      expect(mockRepository.findByMicroserviceOwner).toHaveBeenCalledWith('auth-service')
      expect(mockRepository.save).toHaveBeenCalledTimes(1)
    })

    it('debería crear una autenticación exitosamente sin especificar active (por defecto true)', async () => {
      const input: CreateMicroserviceAuthInput = {
        key: 'notification-service-key-456',
        microserviceOwner: 'notification-service'
      }

      mockRepository.findByKey.mockResolvedValue(null)
      mockRepository.findByMicroserviceOwner.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)
      expect(result.key).toBe('notification-service-key-456')

      // Verificar que el microserviceAuth guardado tenga active = true por defecto
      const savedAuth = mockRepository.save.mock.calls[0][0]
      expect(savedAuth.active).toBe(true)
    })

    it('debería crear una autenticación con active = false', async () => {
      const input: CreateMicroserviceAuthInput = {
        key: 'test-service-key-789',
        microserviceOwner: 'test-service',
        active: false
      }

      mockRepository.findByKey.mockResolvedValue(null)
      mockRepository.findByMicroserviceOwner.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)

      // Verificar que el microserviceAuth guardado tenga active = false
      const savedAuth = mockRepository.save.mock.calls[0][0]
      expect(savedAuth.active).toBe(false)
    })
  })

  describe('Validación de key duplicada', () => {
    it('debería fallar si la key ya existe', async () => {
      const existingAuth = MicroserviceAuth.create({
        key: 'existing-key',
        microserviceOwner: 'existing-service'
      })

      mockRepository.findByKey.mockResolvedValue(existingAuth)
      mockRepository.findByMicroserviceOwner.mockResolvedValue(null)

      const input: CreateMicroserviceAuthInput = {
        key: 'existing-key',
        microserviceOwner: 'another-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain("already exists")
      expect(result.message).toContain("existing-key")
      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('Validación de microserviceOwner duplicado', () => {
    it('debería fallar si el microserviceOwner ya tiene una autenticación', async () => {
      const existingAuth = MicroserviceAuth.create({
        key: 'old-key',
        microserviceOwner: 'my-service'
      })

      mockRepository.findByKey.mockResolvedValue(null)
      mockRepository.findByMicroserviceOwner.mockResolvedValue(existingAuth)

      const input: CreateMicroserviceAuthInput = {
        key: 'new-key',
        microserviceOwner: 'my-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain("already has an authentication key")
      expect(result.message).toContain("my-service")
      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('Validación de campos requeridos', () => {
    it('debería fallar si la key está vacía', async () => {
      mockRepository.findByKey.mockResolvedValue(null)
      mockRepository.findByMicroserviceOwner.mockResolvedValue(null)

      const input: CreateMicroserviceAuthInput = {
        key: '   ',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Key is required')
      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('debería fallar si el microserviceOwner está vacío', async () => {
      mockRepository.findByKey.mockResolvedValue(null)
      mockRepository.findByMicroserviceOwner.mockResolvedValue(null)

      const input: CreateMicroserviceAuthInput = {
        key: 'test-key',
        microserviceOwner: '   '
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Microservice owner is required')
      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('debería fallar si la key es undefined', async () => {
      mockRepository.findByKey.mockResolvedValue(null)
      mockRepository.findByMicroserviceOwner.mockResolvedValue(null)

      const input: CreateMicroserviceAuthInput = {
        key: undefined as any,
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Key is required')
    })

    it('debería fallar si el microserviceOwner es undefined', async () => {
      mockRepository.findByKey.mockResolvedValue(null)
      mockRepository.findByMicroserviceOwner.mockResolvedValue(null)

      const input: CreateMicroserviceAuthInput = {
        key: 'test-key',
        microserviceOwner: undefined as any
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Microservice owner is required')
    })
  })

  describe('Manejo de errores del repositorio', () => {
    it('debería manejar errores al buscar por key', async () => {
      mockRepository.findByKey.mockRejectedValue(new Error('Database connection error'))

      const input: CreateMicroserviceAuthInput = {
        key: 'test-key',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to create microservice authentication')
      expect(result.message).toContain('Database connection error')
    })

    it('debería manejar errores al buscar por microserviceOwner', async () => {
      mockRepository.findByKey.mockResolvedValue(null)
      mockRepository.findByMicroserviceOwner.mockRejectedValue(new Error('Database timeout'))

      const input: CreateMicroserviceAuthInput = {
        key: 'test-key',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to create microservice authentication')
      expect(result.message).toContain('Database timeout')
    })

    it('debería manejar errores al guardar', async () => {
      mockRepository.findByKey.mockResolvedValue(null)
      mockRepository.findByMicroserviceOwner.mockResolvedValue(null)
      mockRepository.save.mockRejectedValue(new Error('Failed to save to database'))

      const input: CreateMicroserviceAuthInput = {
        key: 'test-key',
        microserviceOwner: 'test-service'
      }

      const result = await useCase.execute(input)

      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to create microservice authentication')
      expect(result.message).toContain('Failed to save to database')
    })
  })

  describe('Validaciones de la entidad', () => {
    it('debería validar que la entidad se crea correctamente con los datos proporcionados', async () => {
      const input: CreateMicroserviceAuthInput = {
        key: 'valid-key-123',
        microserviceOwner: 'valid-service',
        active: true
      }

      mockRepository.findByKey.mockResolvedValue(null)
      mockRepository.findByMicroserviceOwner.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(undefined)

      const result = await useCase.execute(input)

      expect(result.success).toBe(true)

      // Verificar que se llamó al save con una entidad válida
      expect(mockRepository.save).toHaveBeenCalledTimes(1)
      const savedAuth = mockRepository.save.mock.calls[0][0]

      expect(savedAuth).toBeInstanceOf(MicroserviceAuth)
      expect(savedAuth.key).toBe('valid-key-123')
      expect(savedAuth.microserviceOwner).toBe('valid-service')
      expect(savedAuth.active).toBe(true)
      expect(savedAuth.createdAt).toBeInstanceOf(Date)
    })
  })
})
