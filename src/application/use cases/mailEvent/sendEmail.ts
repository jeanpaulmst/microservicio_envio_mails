// Caso de uso que se ejecuta cada 1 minuto: 
// - busca los mails que estan en estado 'pending'
// - SOLO SI retryCount <= retries
// - Se conecta con el servidor SMTP y envia el mail al destinatario

export class SendEmailUseCase {

} 