# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IRG Capacity Planner - A Next.js 15.3.3 application using App Router for managing consultants, clients, projects, and resource allocations with Supabase backend.

## Essential Commands

### Development
```bash
npm run dev              # Start development server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Testing
```bash
npm run test             # Run unit tests (Vitest)
npm run test:watch       # Unit tests in watch mode
npm run test:e2e         # Run E2E tests (resets DB first)
npm run test:e2e:ui      # E2E tests with Playwright UI
npm run test:smoke       # Critical user journey tests
```

### Database
```bash
npm run supabase:start   # Start local Supabase
npm run supabase:reset   # Reset database (required before E2E tests)
npm run supabase:stop    # Stop Supabase
```

### Type Checking
```bash
# Run TypeScript type checking (Next.js includes TypeScript)
npm run build            # This will also check types
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.3.3 with App Router
- **UI**: React 19, Tailwind CSS v4, shadcn/ui (New York style)
- **Database**: Supabase (PostgreSQL with RLS)
- **State**: Zustand for client state, Server Actions for mutations
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest (unit), Playwright (E2E)
- **Auth**: Supabase Auth with SSR

### Key Directories
- `/app/(auth)/*` - Public auth pages (login, signup, reset)
- `/app/(protected)/*` - Protected routes requiring authentication
- `/actions/*` - Server Actions for data operations
- `/components/ui/*` - shadcn/ui components
- `/supabase/migrations/*` - Database schema
- `/tests/*` - Test suites

### Data Flow Pattern
```
Form Input → Zod Validation → Server Action → Supabase RLS → Database
    ↓                                               ↓
UI Update ← Revalidation ← Response ← Query Result
```

### Authentication Pattern
All protected routes check authentication via:
1. Middleware redirects unauthenticated users
2. Server Actions verify user session before operations
3. Database RLS policies enforce data isolation

## Development Guidelines

### Server Actions
Located in `/actions/*`, these handle all data mutations:
- Always check user authentication first
- Return consistent error/success responses
- Use `revalidatePath()` for cache updates
- Handle Supabase errors gracefully

### Database Operations
- All tables use UUID primary keys
- User data isolated via RLS policies
- Foreign keys: consultant_id, client_id, project_id
- Automatic updated_at timestamps

### Component Patterns
- Server Components for data fetching
- Client Components for interactivity
- Use Suspense boundaries for loading states
- Error boundaries with toast notifications

### Testing Requirements
Before committing:
1. Run `npm run lint` to check code style
2. Run `npm run build` to check TypeScript types
3. Run unit tests for new utility functions
4. Run E2E tests for new user-facing features

## Common Tasks

### Adding a New Feature
1. Create Server Action in `/actions`
2. Add types in `/types`
3. Build UI components (use existing patterns)
4. Add form validation with Zod
5. Implement optimistic updates if applicable
6. Add tests (unit for logic, E2E for flows)

### Modifying Database Schema
1. Create migration in `/supabase/migrations`
2. Update types in `/types`
3. Update Server Actions
4. Run `npm run supabase:reset` to apply

### Working with Forms
1. Use React Hook Form with zodResolver
2. Create Zod schema for validation
3. Handle errors with toast notifications
4. Show loading states during submission

## Environment Variables
Required for local development:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## CI/CD
Two workflows run on GitHub Actions:
- **Full Test Suite**: All tests on main/develop branches
- **PR Tests**: Quick checks + smoke tests for PRs

Tests use local Supabase instance (no external dependencies).