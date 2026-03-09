import type { EmailSender, SendMailParams } from '../../domain/ports/emailSender.js'

// Implementacion de servicio de envio de mail para probar casos de fallo
// Se simula un fallo del servidor para probar logica de reintentos

export class StubEmailSender implements EmailSender {
    private callCount = 0

    async send(params: SendMailParams): Promise<void> {
        this.callCount++
        const shouldFail = this.callCount % 2 === 0 || (this.callCount > 10)

        console.log(`[STUB] Intento #${this.callCount} → ${params.to} | resultado: ${shouldFail ? 'FALLO' : 'ÉXITO'}`)

        if (shouldFail) {
            throw new Error('connect ECONNREFUSED — servidor de email no disponible')
        }
    }
}
