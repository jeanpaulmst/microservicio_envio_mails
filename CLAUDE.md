# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
For the responses yo give me in each query, follow this instructions: Never treat me in a condescending manner; there is no need to highlight or praise my ideas, responses, or questions. Be direct and professional: when explaining something, do not use informal language and never attempt to empathize with me; it is unnecessary in all cases.

## Project Overview

Email sending microservice built with **Clean Architecture** (Hexagonal Architecture) and **Domain-Driven Design** principles. The service manages email templates with variable substitution, scheduled email events, and microservice authentication.

## Development Commands

### Building and Running

```bash
npm run build          # Compile TypeScript to dist/
npm run dev            # Watch mode for development
npm start              # Run compiled application
npm run start:dev      # Build and run in one command
```

### Testing

```bash
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

### Docker

```bash
docker-compose up -d   # Start MongoDB and app containers
docker-compose down    # Stop containers
```

## Architecture

### Clean Architecture Layers

The codebase follows strict dependency rules: **Infrastructure → Application → Domain**

```
src/
├── domain/                    # Core business logic (no dependencies)
│   ├── entities/             # Rich domain models with business rules
│   └── repositories/         # Repository interfaces (contracts)
├── application/
│   └── use cases/            # Application services orchestrating entities
└── infrastructure/           # NOT YET IMPLEMENTED (MongoDB, Express, etc.)
```

### Domain Layer (src/domain/)

**Entities** are rich domain models with encapsulated business logic:

- **Template** - Email templates with variable placeholders (`{{variableName}}`)

  - Factory methods: `Template.create()`, `Template.reconstitute()`
  - Soft delete pattern via `deletedAt`
  - Variable validation (alphanumeric + underscores, no nesting)

- **MailEvent** - Scheduled/sent email events with retry logic

  - States: `SUCCESS`, `FAIL`, `PENDING`
  - Factory methods: `MailEvent.create()`, `MailEvent.reconstitute()`
  - Methods: `markAsSuccess()`, `markAsFail()`, `canRetry()`, `isScheduled()`

- **MicroserviceAuth** - API key authentication for other microservices
  - Factory methods: `MicroserviceAuth.create()`, `MicroserviceAuth.reconstitute()`
  - Methods: `activate()`, `deactivate()`, `isAuthorized()`

**Repository Interfaces** define contracts (implementations pending in infrastructure layer):

- `TemplateRepository` - CRUD for templates
- `MailEventRepository` - CRUD for mail events
- `MicroserviceAuthRepository` - CRUD + lookups for auth

### Application Layer (src/application/use cases/)

**Use Cases** orchestrate business operations using entities and repositories:

- **Template Use Cases:**

  - `CreateTemplateUseCase` - Validates variables, creates template
  - `ModifyTemplateUseCase` - Auth check, validates ownership, updates template
  - `DeleteTemplateUseCase` - Placeholder (not implemented)

- **Auth Use Cases:**
  - `GenerateApiKey` - Registers microservices with API keys

**Shared Utilities:**

- `templateValidations.ts` - Variable syntax validation functions
- `templateRenderer.ts` - Renders templates with data substitution

### Entity Patterns

**Creating New Entities:**

- Use `Entity.create()` for new instances (runs validation)
- Use `Entity.reconstitute()` for loading from DB (bypasses validation)

**Example:**

```typescript
// Creating new template
const template = Template.create({
  templateId: "welcome-email",
  subject: "Welcome {{userName}}!",
  htmlBody: "<h1>Hello {{userName}}</h1>",
  textBody: "Hello {{userName}}",
  microserviceOwner: "auth-service",
});

// Loading from database
const template = Template.reconstitute({
  templateId: "welcome-email",
  // ... all properties including deletedAt
});
```

### Use Case Pattern

All use cases follow constructor injection for repositories:

```typescript
class SomeUseCase {
  constructor(private repository: SomeRepository) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    // 1. Validate input
    // 2. Load entities via repository
    // 3. Execute business logic on entities
    // 4. Persist via repository
    // 5. Return result
  }
}
```

## Template Variable System

Variables use `{{variableName}}` syntax with strict rules:

- Variable names: alphanumeric and underscores only (`[a-zA-Z0-9_]+`)
- No nested variables allowed
- No mismatched braces
- Case-sensitive

**Validation functions** in `src/application/use cases/template/shared/templateValidations.ts`:

- `validateVariableNames()` - Checks variable name format
- `validateMatchingBraces()` - Ensures balanced braces
- `validateNoNestedVariables()` - Prevents `{{var{{nested}}}}`

## Testing Strategy

**Unit Tests** (src/application/use cases/\_\_tests\_\_/):

- Mock repositories using Jest
- Test all edge cases and error conditions
- Test validation rules comprehensively
- Each test file mirrors the use case it tests

**Running Specific Tests:**

```bash
npm test -- createTemplate.test.ts
npm test -- --testNamePattern="should reject template with invalid variable"
```

## Current Development Status

### Implemented ✅

- Domain entities with complete business logic
- Repository interfaces
- Core use cases (CreateTemplate, ModifyTemplate, CreateMicroserviceAuth)
- Template validation and rendering utilities
- Comprehensive unit tests (340+ test cases)
- Docker setup with MongoDB

### Pending Implementation 🚧

- **Infrastructure Layer:**
  - MongoDB repository implementations (Mongoose models)
  - Express REST API controllers and routes
  - Authentication middleware
  - Email service integration (Nodemailer + use cases)
- **Use Cases:**
  - Mail event use cases (send, retry, schedule)
  - Delete template use case
- **Testing:**
  - Integration tests
  - E2E API tests

**Note:** `src/index.ts` and `src/ejemplo.ts` contain prototype Nodemailer code NOT integrated with the architecture. These are examples only.

## Key Business Rules

### Template Management

- Templates owned by specific microservices (via `microserviceOwner`)
- Soft delete preserves template history
- Variable format strictly enforced
- Both HTML and plain text bodies required

### Authentication & Authorization

- Microservices authenticate with API keys (`authKey`)
- Each microservice can only modify its own templates
- Active/inactive state controls access
- One auth entry per microservice owner

### Email Events

- Events can be scheduled for future sending (`scheduledFor`)
- Retry mechanism tracks attempts (`retryCount` vs `retries`)
- State transitions: `PENDING` → `SUCCESS` or `FAIL`
- Template data must provide all variables in template

## Environment Configuration

Required environment variables (see `.env.example`):

```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/mail_service?authSource=admin
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Microservicio Emails <your-email@gmail.com>"
```

## TypeScript Configuration

- **Module System:** ES Modules (NodeNext)
- **Strict Mode:** Enabled with additional checks:
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`
- **Output:** `dist/` directory
- Always import with `.js` extensions (ESM requirement): `import { X } from './file.js'`

## Repository Information

- **GitHub:** https://github.com/jeanpaulmst/microservicio_envio_mails
- **Author:** jp_masuet
- **Issues:** https://github.com/jeanpaulmst/microservicio_envio_mails/issues
