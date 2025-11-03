export enum MailEventResult {
  SUCCESS = 'success',
  FAIL = 'fail',
  PENDING = 'pending'
}

export class MailEvent {
  private constructor(
    private readonly _emailEventId: string,
    private readonly _templateId: string,
    private readonly _to: string,
    private readonly _from: string,
    private readonly _templateData: string, // JSON stringificado
    private readonly _scheduledFor: Date,
    private readonly _retries: number,
    private _retryCount: number,
    private _result: MailEventResult
  ) {}

  static create(params: {
    emailEventId: string
    templateId: string
    to: string
    from: string
    templateData: string
    scheduledFor?: Date
    retries?: number
  }): MailEvent {

    if (!params.emailEventId?.trim()) {
      throw new Error('Email event ID is required')
    }
    if (!params.templateId?.trim()) {
      throw new Error('Template ID is required')
    }
    if (!params.to?.trim()) {
      throw new Error('To address is required')
    }
    if (!params.from?.trim()) {
      throw new Error('From address is required')
    }
    if (!params.templateData?.trim()) {
      throw new Error('Template data is required')
    }

    // Validar que templateData sea un JSON válido
    try {
      const parsed = JSON.parse(params.templateData)
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Template data must be a JSON object')
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Template data must be a valid JSON string')
      }
      throw error
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(params.to)) {
      throw new Error('Invalid To email address')
    }
    if (!emailRegex.test(params.from)) {
      throw new Error('Invalid From email address')
    }

    // Si scheduledFor no viene, usar fecha actual (envío inmediato)
    const scheduledFor = params.scheduledFor || new Date()

    // Validar que retries sea un número positivo
    const retries = params.retries !== undefined ? params.retries : 3
    if (retries < 0) {
      throw new Error('Retries must be a positive number')
    }

    return new MailEvent(
      params.emailEventId,
      params.templateId,
      params.to,
      params.from,
      params.templateData,
      scheduledFor,
      retries,
      0, // retryCount empieza en 0
      MailEventResult.PENDING // result empieza como pending
    )
  }

  static reconstitute(params: {
    emailEventId: string
    templateId: string
    to: string
    from: string
    templateData: string
    scheduledFor: Date
    retries: number
    retryCount: number
    result: MailEventResult
  }): MailEvent {
    return new MailEvent(
      params.emailEventId,
      params.templateId,
      params.to,
      params.from,
      params.templateData,
      params.scheduledFor,
      params.retries,
      params.retryCount,
      params.result
    )
  }

  // Getters
  get emailEventId(): string {
    return this._emailEventId
  }

  get templateId(): string {
    return this._templateId
  }

  get to(): string {
    return this._to
  }

  get from(): string {
    return this._from
  }

  get templateData(): string {
    return this._templateData
  }

  get scheduledFor(): Date {
    return this._scheduledFor
  }

  get retries(): number {
    return this._retries
  }

  get retryCount(): number {
    return this._retryCount
  }

  get result(): MailEventResult {
    return this._result
  }

  // Methods
  markAsSuccess(): void {
    if (this._result === MailEventResult.SUCCESS) {
      throw new Error('Mail event is already marked as success')
    }
    this._result = MailEventResult.SUCCESS
  }

  markAsFail(): void {
    this._result = MailEventResult.FAIL
  }

  incrementRetryCount(): void {
    if (this._retryCount >= this._retries) {
      throw new Error('Maximum retry count reached')
    }
    this._retryCount++
  }

  canRetry(): boolean {
    return this._retryCount < this._retries && this._result !== MailEventResult.SUCCESS
  }

  isScheduled(): boolean {
    return this._scheduledFor > new Date()
  }

  isPending(): boolean {
    return this._result === MailEventResult.PENDING
  }

  isSuccess(): boolean {
    return this._result === MailEventResult.SUCCESS
  }

  isFailed(): boolean {
    return this._result === MailEventResult.FAIL
  }
}
