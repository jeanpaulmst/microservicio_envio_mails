import type { MailEvent } from '../entities/mailEvent.js'

export interface FailedMailPublisher {
    publish(event: MailEvent): Promise<void>
}
