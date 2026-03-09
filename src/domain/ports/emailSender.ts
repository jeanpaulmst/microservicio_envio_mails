export interface SendMailParams {
    from: string
    to: string
    subject: string
    html: string
    text?: string
}

export interface EmailSender {
    send(params: SendMailParams): Promise<void>
}
