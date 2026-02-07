//Crea una instancia de mailEvent en la BD
import { randomUUID } from 'crypto'
import { MailEvent } from '../../../domain/entities/mailEvent.js'
import type { MailEventRepository } from '../../../domain/repositories/mailEventRepository.js'
import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js'

export interface CreateMailEventInput {
    templateId: string
    to: string
    from: string
    templateData: Record<string, string>
    scheduledFor?: string // ISO 8601 date string
    retries?: number
}

export interface CreateMailEventOutput {
    success: boolean
    message: string
    mailEventId?: string
}

export class CreateMailEventUseCase {

    constructor(
        private readonly mailEventRepository: MailEventRepository,
        private readonly templateRepository: TemplateRepository
    ) {}

    async execute(input: CreateMailEventInput): Promise<CreateMailEventOutput> {

        try {
            // Validar que el template exista
            const template = await this.templateRepository.findById(input.templateId)
            if (template === null) {
                return {
                    success: false,
                    message: `Template with ID '${input.templateId}' not found`
                }
            }

            // Validar que el template no esté eliminado
            if (template.deletedAt !== null) {
                return {
                    success: false,
                    message: `Template with ID '${input.templateId}' has been deleted`
                }
            }

            // Validar formato de scheduledFor y que no sea una fecha pasada
            let scheduledDate: Date | undefined
            if (input.scheduledFor !== undefined) {
                scheduledDate = new Date(input.scheduledFor)
                if (isNaN(scheduledDate.getTime())) {
                    return {
                        success: false,
                        message: 'Invalid scheduledFor date format: must be a valid ISO 8601 date string'
                    }
                }
                if (scheduledDate < new Date()) {
                    return {
                        success: false,
                        message: 'scheduledFor date cannot be in the past'
                    }
                }
            }

            // Extraer variables del template y validar que templateData las provea todas
            const requiredVariables = this.extractVariables(
                template.subject,
                template.htmlBody,
                template.textBody
            )
            const providedVariables = Object.keys(input.templateData)
            const missingVariables = requiredVariables.filter(v => !providedVariables.includes(v))

            if (missingVariables.length > 0) {
                return {
                    success: false,
                    message: `Missing required template variables: ${missingVariables.join(', ')}`
                }
            }

            // Crear la entidad MailEvent
            const createParams: {
                emailEventId: string
                templateId: string
                to: string
                from: string
                templateData: string
                scheduledFor?: Date
                retries?: number
            } = {
                emailEventId: randomUUID(),
                templateId: input.templateId,
                to: input.to,
                from: input.from,
                templateData: JSON.stringify(input.templateData)
            }

            if (scheduledDate !== undefined) {
                createParams.scheduledFor = scheduledDate
            }
            if (input.retries !== undefined) {
                createParams.retries = input.retries
            }

            const mailEvent = MailEvent.create(createParams)

            // Persistir en el repositorio
            await this.mailEventRepository.save(mailEvent)

            return {
                success: true,
                message: 'Mail event created successfully',
                mailEventId: mailEvent.emailEventId
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            return {
                success: false,
                message: `Failed to create mail event: ${errorMessage}`
            }
        }
    }

    private extractVariables(...texts: (string | null)[]): string[] {
        const variables = new Set<string>()
        const pattern = /\{\{([a-zA-Z0-9_]+)\}\}/g
        for (const text of texts) {
            if (text === null) continue
            let match: RegExpExecArray | null
            while ((match = pattern.exec(text)) !== null) {
                variables.add(match[1]!)
            }
        }
        return Array.from(variables)
    }
}
