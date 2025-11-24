import { MailEvent } from '../entities/mailEvent.js'

export interface mailEventRepository {
  save(mailEvent: MailEvent): Promise<void>
  findById(id: string): Promise<MailEvent | null>
  findAll(): Promise<MailEvent[]>
  delete(id: string): Promise<void>
}