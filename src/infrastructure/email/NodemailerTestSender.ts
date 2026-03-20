import nodemailer from 'nodemailer'
import chalk from 'chalk'
import type { EmailSender, SendMailParams } from '../../domain/ports/emailSender.js'

// Implementacion de servicio de envio de mail para probar casos de fallo
// Se simula un fallo del servidor para probar logica de reintentos

export class NodemailerTestSender implements EmailSender {
    private callCount = 0

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
        this.callCount++
        const shouldFail = this.callCount % 2 === 0 || (this.callCount > 10)

        console.log(chalk.blue(`[TEST] Intento #${this.callCount} → ${params.to} | resultado: ${shouldFail ? 'FALLO' : 'ÉXITO'}`))

        if (shouldFail) {
            throw new Error('connect ECONNREFUSED — servidor de email no disponible')
        }else{
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
}
