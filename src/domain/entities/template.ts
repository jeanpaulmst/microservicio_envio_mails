export class Template {
  private constructor(
    private readonly _templateId: string,
    private _subject: string,
    private _htmlBody: string,
    private readonly _microserviceOwner: string,
    private _textBody: string | null,
    private _deletedAt: Date | null
  ) {}

  static create(params: {
    templateId: string
    subject: string
    htmlBody: string
    microserviceOwner: string
    textBody?: string
  }): Template {
    
    if (!params.templateId?.trim()) {
      throw new Error('Template ID is required')
    }
    if (!params.subject?.trim()) {
      throw new Error('Subject is required')
    }
    if (!params.htmlBody?.trim()) {
      throw new Error('HTML body is required')
    }
    if (!params.microserviceOwner?.trim()) {
      throw new Error('Microservice owner is required')
    }

    return new Template(
      params.templateId,
      params.subject,
      params.htmlBody,
      params.microserviceOwner,
      params.textBody || null,
      null // deletedAt empieza en null
    )
  }

  // Getters
  get templateId(): string {
    return this._templateId
  }

  get subject(): string {
    return this._subject
  }

  get htmlBody(): string {
    return this._htmlBody
  }

  get microserviceOwner(): string {
    return this._microserviceOwner
  }

  get textBody(): string | null {
    return this._textBody
  }

  get deletedAt(): Date | null {
    return this._deletedAt
  }

  delete(): void {
    if (this._deletedAt !== null) {
      throw new Error('Template is already deleted')
    }
    this._deletedAt = new Date()
  }

  updateSubject(newSubject: string): void {
    if (!newSubject?.trim()) {
      throw new Error('Subject cannot be empty')
    }
    this._subject = newSubject
  }

  updateHtmlBody(newHtmlBody: string): void {
    if (!newHtmlBody?.trim()) {
      throw new Error('HTML body cannot be empty')
    }
    this._htmlBody = newHtmlBody
  }

  updateTextBody(newTextBody: string | null): void {
    this._textBody = newTextBody
  }

}