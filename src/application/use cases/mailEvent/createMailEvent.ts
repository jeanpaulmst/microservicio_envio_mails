//Crea una instancia de mailEvent en la BD
import type { MailEventRepository } from '../../../domain/repositories/mailEventRepository.js'

export interface CreateMailEventInput {
    templateId: string
    subject: string
    htmlBody: string
    microserviceOwner: string
    textBody?: string
}
  
  export interface CreateMailEventOutput {
    success: boolean
    message: string
    mailEventId?: string
}

export class CreateEmailEventUseCase {

    constructor(private readonly mailEventRepository: MailEventRepository) {}

    async execute(input: CreateMailEventInput): Promise<CreateMailEventOutput> {

        try {
            return {
                success: true,
                message: `mailEventCreated test OK`,
                mailEventId: '1'
            }
        } catch(error){
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            return {
                success: false,
                message: `Failed to create mailEvent: ${errorMessage}`
            }
        }
    }
} 