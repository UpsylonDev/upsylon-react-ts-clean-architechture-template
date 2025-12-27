# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React application implementing Clean Architecture and Domain-Driven Design (DDD) principles. The project is framework-independent at its core, with only the UI layer depending on React. It demonstrates post management functionality (create, read, update, delete) using a mock server.

**Important Note**: This project has been discontinued as of 2025-01-13 in favor of the "clean-architecture-with-typescript" project.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Build for production
pnpm build

# Run linter
pnpm lint

# Format code with Prettier
pnpm format

# Check formatting without modifying
pnpm format:check

# Run unit tests (Vitest + React Testing Library)
pnpm test

# Run E2E tests (Playwright)
pnpm e2e

# Run E2E tests in UI mode
pnpm e2e:ui

# Run E2E tests in headed mode (visible browser)
pnpm e2e:headed

# Debug E2E tests
pnpm e2e:debug
```

## Architecture

### Clean Architecture Layers

The codebase follows a strict layered architecture with dependency inversion:

1. **domains/** - Core business logic (framework-independent)
   - `aggregates/` - Complex domain objects (e.g., Post with comments)
   - `entities/` - Simple domain objects (e.g., Comment, User)
   - `vos/` - Value Objects (e.g., UserInfoVO)
   - `useCases/` - Business logic operations (e.g., PostUseCase)
   - `repositories/interfaces/` - Repository contracts
   - `dtos/interfaces/` - Data transfer object contracts

2. **adapters/** - Interface adapters between domains and frameworks
   - `repositories/` - Repository implementations (e.g., PostRepository)
   - `infrastructures/` - External service clients (e.g., ClientHTTP using Axios)
   - `dtos/` - DTO implementations

3. **frameworks/** - UI layer (React-specific)
   - `components/` - Organized by Atomic Design (atoms, molecules, organisms, templates, pages)
   - `hooks/` - React Hooks serving as Presenters (e.g., usePosts)
   - `contexts/` - React Context definitions

4. **di/** - Dependency injection configuration
   - Central place where all dependencies are wired together

### Dependency Injection Flow

The DI system is the heart of the architecture:

```typescript
// di/index.ts
ClientHTTP → Repositories → UseCases → (returned to React Hooks)
```

1. `di/index.ts` - Main DI function that creates ClientHTTP and chains dependencies
2. `di/repositories.ts` - Creates repository instances with injected ClientHTTP
3. `di/useCases.ts` - Creates use case instances with injected repositories
4. React Hooks import and call `di()` to get fully-wired use cases

**Key Pattern**: Each layer only knows about interfaces from inner layers, never concrete implementations from outer layers.

### Presenters Pattern (React Hooks)

React Hooks (in `frameworks/hooks/`) serve as the Presenter layer:

- Import use cases via `di/index.ts`
- Manage global state using Jotai atoms
- Use `useTransition` for loading states
- Use `useOptimistic` (React 19) for optimistic updates
- Return domain objects and actions to components

Example: `usePosts` manages Post domain state and exposes `getPosts()`, `createPost()`, `updatePost()`, `deletePost()`.

### Path Aliases

The project uses TypeScript path aliases configured in both `tsconfig.json` and `jest.config.json`:

- `constants/*` → `src/constants/*`
- `domains/*` → `src/domains/*`
- `adapters/*` → `src/adapters/*`
- `di/*` → `src/di/*`
- `hooks/*` → `src/frameworks/hooks/*`
- `components/*` → `src/frameworks/components/*`

**Always use these aliases** instead of relative imports to maintain clean architecture boundaries.

### Testing Strategy

- **Unit Tests**: Located in `src/__test__/` directory
  - Test domain logic (e.g., `Post.spec.ts`)
  - Test repositories with mocked HTTP client (e.g., `PostRepository.spec.ts`)
  - Test React components (e.g., `PostBox.spec.tsx`)
  - Run individual tests: `pnpm test <path-to-file>`

- **E2E Tests**: Located in `tests/e2e/` (Playwright)
  - Test full user workflows across multiple browsers (Chromium, Firefox, WebKit)
  - Run all tests: `pnpm e2e`
  - Run with UI mode: `pnpm e2e:ui`
  - Run in headed mode: `pnpm e2e:headed`
  - Debug mode: `pnpm e2e:debug`

### Key Technologies

- **Build Tool**: Vite
- **UI**: React 19, React Router v7
- **State Management**: Jotai (global atoms)
- **HTTP Client**: Axios (wrapped in `ClientHTTP`)
- **Styling**: Tailwind CSS
- **Testing**: Vitest, React Testing Library, Playwright
- **Linting**: ESLint with TypeScript, React, and Prettier plugins

## Coding Guidelines

### When Adding New Features

1. **Start in domains/** - Define interfaces, entities, and use cases first
2. **Implement in adapters/** - Create repositories and DTOs
3. **Wire in di/** - Add new dependencies to DI configuration
4. **Create Presenter** - Add React Hook in `frameworks/hooks/`
5. **Build UI** - Create components following Atomic Design pattern

### Repository Pattern

All external data access goes through repositories:

- Repository interfaces defined in `domains/repositories/interfaces/`
- Implementations in `adapters/repositories/`
- Always return domain objects (Entities, Aggregates, VOs), never raw API responses

### Use Case Pattern

Business logic belongs in use cases:

- One use case class per domain (e.g., `PostUseCase`, `UserUseCase`)
- Use cases orchestrate repositories and transform DTOs to domain objects
- Injected into React Hooks via DI

### Domain Objects

- **Entities**: Have identity (id field), mutable state
- **Aggregates**: Complex entities with nested entities (e.g., Post contains Comments)
- **Value Objects**: Immutable, no identity (e.g., UserInfoVO)
- Domain objects can have business logic methods (e.g., `Post.updatePost()`)

## Common Patterns

### Adding a New Domain

1. Create domain interfaces and classes in `domains/`
2. Create repository interface in `domains/repositories/interfaces/`
3. Create repository implementation in `adapters/repositories/`
4. Create use case in `domains/useCases/`
5. Add to DI in `di/repositories.ts` and `di/useCases.ts`
6. Create presenter hook in `frameworks/hooks/`
7. Update interface files: `di/interfaces/IRepositories.ts` and `di/interfaces/IUseCases.ts`

### Testing Domain Logic

Domain objects should be testable without any framework dependencies. See `src/__test__/domains/Post.spec.ts` for examples.

### Testing Repositories

Mock the `IClientHTTP` interface to test repositories without making real HTTP calls. See `src/__test__/adapters/PostRepository.spec.ts`.

## Code Formatting with Prettier

This project uses **Prettier** for automatic code formatting with the following rules:

- `singleQuote: false` - Double quotes
- `trailingComma: none` - No trailing commas
- `tabWidth: 2` - 2-space indentation
- `semi: false` - No semicolons

### Automatic Formatting on Commit

**Husky + lint-staged** automatically format and lint files before each commit:

```
git commit
↓
Pre-commit hook
├─ Format TypeScript/JavaScript with Prettier
├─ Fix ESLint issues with --fix
├─ Format JSON/CSS/Markdown with Prettier
└─ Commit accepted if all passes
```

### Manual Formatting

```bash
# Format all files
pnpm format

# Check formatting without modifying
pnpm format:check
```

See [PRETTIER.md](./PRETTIER.md) for detailed formatting guide and VSCode integration.

## Important
- comment always in english languages