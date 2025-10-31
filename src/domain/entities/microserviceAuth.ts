export class MicroserviceAuth {
  private constructor(
    private readonly _key: string,
    private readonly _microserviceOwner: string,
    private _active: boolean,
    private readonly _createdAt: Date
  ) {}

  static create(params: {
    key: string
    microserviceOwner: string
    active?: boolean
  }): MicroserviceAuth {

    if (!params.key?.trim()) {
      throw new Error('Key is required')
    }
    if (!params.microserviceOwner?.trim()) {
      throw new Error('Microservice owner is required')
    }

    return new MicroserviceAuth(
      params.key,
      params.microserviceOwner,
      params.active !== undefined ? params.active : true,
      new Date()
    )
  }

  static reconstitute(params: {
    key: string
    microserviceOwner: string
    active: boolean
    createdAt: Date
  }): MicroserviceAuth {
    return new MicroserviceAuth(
      params.key,
      params.microserviceOwner,
      params.active,
      params.createdAt
    )
  }

  // Getters
  get key(): string {
    return this._key
  }

  get microserviceOwner(): string {
    return this._microserviceOwner
  }

  get active(): boolean {
    return this._active
  }

  get createdAt(): Date {
    return this._createdAt
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
