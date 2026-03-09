import nodemailer from 'nodemailer'
import type { EmailSender, SendMailParams } from '../../domain/ports/emailSender.js'

export class NodemailerEmailSender implements EmailSender {
    private readonly transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    async send(params: SendMailParams): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: params.from,
                to: params.to,
                subject: params.subject,
                html: params.html,
                text: params.text
            })
        } catch (error: any) {
            // Códigos SMTP 5xx son errores permanentes (ej: 550 = usuario inexistente)
            // Códigos 4xx y errores de red son transitorios
            error.permanent = typeof error.responseCode === 'number' && error.responseCode >= 500
            throw error
        }
    }
}
