import { GenerateApiKey } from '../generateApiKey.js'
import type { MicroserviceAuthRepository } from '../../../domain/repositories/microserviceAuthRepository.js'
import { MicroserviceAuth } from '../../../domain/entities/microserviceAuth.js'

describe('GenerateApiKey', () => {
  let useCase: GenerateApiKey
  let mockRepository: jest.Mocked<MicroserviceAuthRepository>

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findByKey: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    useCase = new GenerateApiKey(mockRepository)
  })

  describe('Casos de éxito', () => {
    it('debería generar y retornar una api-key', async () => {
      mockRepository.save.mockResolvedValue(undefined)

      const result = await useCase.execute({})

      expect(result.success).toBe(true)
      expect(result.message).toBe('api-key created successfully')
      expect(result.key).toBeDefined()
      expect(typeof result.key).toBe('string')
      expect(result.key!.length).toBe(64) // 32 bytes en hex
    })

    it('debería generar claves distintas en cada llamada', async () => {
      mockRepository.save.mockResolvedValue(undefined)

      const result1 = await useCase.execute({})
      const result2 = await useCase.execute({})

      expect(result1.key).not.toBe(result2.key)
    })

    it('debería crear el registro con active = true por defecto', async () => {
      mockRepository.save.mockResolvedValue(undefined)

      const result = await useCase.execute({})

      expect(result.success).toBe(true)

      const savedAuth = mockRepository.save.mock.calls[0]?.[0]
      expect(savedAuth).toBeInstanceOf(MicroserviceAuth)
      expect(savedAuth?.active).toBe(true)
    })

    it('debería crear el registro con active = false cuando se especifica', async () => {
      mockRepository.save.mockResolvedValue(undefined)

      const result = await useCase.execute({ active: false })

      expect(result.success).toBe(true)

      const savedAuth = mockRepository.save.mock.calls[0]?.[0]
      expect(savedAuth?.active).toBe(false)
    })

    it('debería almacenar la clave hasheada (no la clave raw)', async () => {
      mockRepository.save.mockResolvedValue(undefined)

      const result = await useCase.execute({})

      const savedAuth = mockRepository.save.mock.calls[0]?.[0]
      // La clave almacenada debe ser diferente a la retornada al usuario
      expect(savedAuth?.key).not.toBe(result.key)
      // La almacenada es un hash sha256 (64 chars hex)
      expect(savedAuth?.key.length).toBe(64)
    })
  })

  describe('Manejo de errores del repositorio', () => {
    it('debería manejar errores al guardar', async () => {
      mockRepository.save.mockRejectedValue(new Error('Failed to save to database'))

      const result = await useCase.execute({})

      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to create api-key')
      expect(result.message).toContain('Failed to save to database')
      expect(result.key).toBeUndefined()
    })

    it('debería manejar errores desconocidos', async () => {
      mockRepository.save.mockRejectedValue('string error')

      const result = await useCase.execute({})

      expect(result.success).toBe(false)
      expect(result.message).toContain('Failed to create api-key')
    })
  })
})
