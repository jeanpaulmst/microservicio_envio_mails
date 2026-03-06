// Caso de uso que se ejecuta cada 1 minuto:
// - busca los mails que estan en estado 'pending'
// - SOLO SI retryCount <= retries
// - Se conecta con el servidor SMTP y envia el mail al destinatario
import nodemailer from 'nodemailer'
import type { MailEventRepository } from '../../../domain/repositories/mailEventRepository.js'
import type { TemplateRepository } from '../../../domain/repositories/templateRepository.js'
import type { FailedMailPublisher } from '../../../domain/repositories/failedMailPublisher.js'
import { renderFullTemplate } from './shared/templateRenderer.js'

export class SendEmailUseCase {

    constructor(
        private readonly mailEventRepository: MailEventRepository,
        private readonly templateRepository: TemplateRepository,
        private readonly failedMailPublisher: FailedMailPublisher
    ) {}

    async execute() {
        const pendingEvents = await this.mailEventRepository.findPending()

        if (pendingEvents.length === 0) return

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        //Para eventos pendientes, eenvia 
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

                await transporter.sendMail({
                    from: event.from,
                    to: event.to,
                    subject: rendered.subject,
                    html: rendered.htmlBody,
                    text: rendered.textBody ?? undefined
                })

                event.markAsSuccess()
                await this.mailEventRepository.save(event)
                console.log(`Email enviado exitosamente: evento '${event.emailEventId}' a '${event.to}'`)

            } catch (error) {
                console.log(`Error enviando email para evento '${event.emailEventId}':`, error)
                event.incrementRetryCount()
                if (!event.canRetry()) {
                    event.markAsFail()
                    await this.failedMailPublisher.publish(event)
                }
                await this.mailEventRepository.save(event)
            }
        }
    }

}
