// Caso de uso que se ejecuta cada 1 minuto:
// - busca los mails que estan en estado 'pending'
// - SOLO SI retryCount <= retries
// - Se conecta con el servidor SMTP y envia el mail al destinatario
import type { MailEventRepository } from '../../../domain/repositories/mailEventRepository.js'
import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js'
import type { FailedMailPublisher } from '../../../domain/ports/failedMailPublisher.js'
import type { EmailSender } from '../../../domain/ports/emailSender.js'
import { renderFullTemplate } from './shared/templateRenderer.js'

export class SendEmailUseCase {

    constructor(
        private readonly mailEventRepository: MailEventRepository,
        private readonly templateRepository: TemplateRepository,
        private readonly failedMailPublisher: FailedMailPublisher,
        private readonly emailSender: EmailSender
    ) {}

    async execute() {
        const pendingEvents = await this.mailEventRepository.findPending()

        if (pendingEvents.length === 0) return

        for (const event of pendingEvents) {
            try {
                const template = await this.templateRepository.findById(event.templateId)

                if (template === null || template.deletedAt !== null) {
                    console.log(`Template '${event.templateId}' no encontrado o eliminado para evento '${event.emailEventId}'`)
                    event.markAsFail()
                    await this.mailEventRepository.save(event)
                    continue
                }

                const rendered = renderFullTemplate(
                    {
                        subject: template.subject,
                        htmlBody: template.htmlBody,
                        textBody: template.textBody
                    },
                    event.templateData
                )

                const sendParams = {
                    from: event.from,
                    to: event.to,
                    subject: rendered.subject,
                    html: rendered.htmlBody,
                    ...(rendered.textBody != null && { text: rendered.textBody })
                }
                await this.emailSender.send(sendParams)

                event.markAsSuccess()
                await this.mailEventRepository.save(event)
                console.log(`Email enviado exitosamente: evento '${event.emailEventId}' a '${event.to}'`)

            } catch (error: any) {
                if (error.permanent) {
                    console.log(`Error permanente de SMTP para evento '${event.emailEventId}' (${error.responseCode}): no se reintentará`)
                    event.markAsFail()
                    await this.failedMailPublisher.publish(event)
                } else {
                    console.log(`Error transitorio enviando email para evento '${event.emailEventId}':`, error.message)
                    event.incrementRetryCount()
                    if (!event.canRetry()) {
                        event.markAsFail()
                        await this.failedMailPublisher.publish(event)
                    }
                }
                await this.mailEventRepository.save(event)
            }
        }
    }

}
