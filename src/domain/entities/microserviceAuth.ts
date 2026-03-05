export class MicroserviceAuth {
  private constructor(
    private readonly _key: string,
    private _active: boolean
  ) {}

  static create(params: {
    key: string
    active?: boolean
  }): MicroserviceAuth {
    if (!params.key?.trim()) {
      throw new Error('Key is required')
    }

    return new MicroserviceAuth(
      params.key,
      params.active !== undefined ? params.active : true
    )
  }

  static reconstitute(params: {
    key: string
    active: boolean
  }): MicroserviceAuth {
    return new MicroserviceAuth(params.key, params.active)
  }

  // Getters
  get key(): string {
    return this._key
  }

  get active(): boolean {
    return this._active
  }

  // Methods
  activate(): void {
    if (this._active) {
      throw new Error('Microservice is already active')
    }
    this._active = true
  }

  deactivate(): void {
    if (!this._active) {
      throw new Error('Microservice is already inactive')
    }
    this._active = false
  }

  isAuthorized(): boolean {
    return this._active
  }
}
