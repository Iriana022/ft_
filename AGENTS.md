# AGENTS.md - Tickeo Project Guidelines

## Project Overview

Tickeo is a ticket management system with:
- **Frontend**: React 19 + Vite + TypeScript + TailwindCSS 4 + ESLint
- **Backend**: NestJS + Prisma + Jest + TypeScript
- **Database**: PostgreSQL (via Docker)
- **Auth**: JWT, 42 OAuth, Google OAuth

---

## Build, Lint & Test Commands

### Frontend (in `frontend/`)

```bash
npm run dev          # Start dev server (0.0.0.0:5173)
npm run build        # Type-check + production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend (in `backend/`)

```bash
npm run build              # Build NestJS app
npm run start              # Start production
npm run start:dev          # Start with hot reload
npm run start:debug        # Debug mode with inspect
npm run lint               # Lint + fix with ESLint
npm run format             # Format with Prettier

# Testing
npm run test               # Run all tests
npm run test -- --testPathPattern=user.service.spec  # Run single test file
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
npm run test:e2e           # E2E tests
```

### Root Level

```bash
make all          # Docker compose up + generate certs + run migrations
make up           # Restart containers
make down         # Stop containers
make fclean       # Full clean (stop + remove volumes)
make re           # Rebuild from scratch
```

---

## Code Style Guidelines

### General Principles

- **NO comments** unless required for complex logic
- **Prefer explicit** over implicit
- **Keep files under 300 lines** - split if larger

### TypeScript

- Use explicit return types for exported functions
- Avoid `any` - use `unknown` or proper types
- Enable `strictNullChecks` in TypeScript config
- Use interfaces for objects, types for unions/primitives

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `user.service.ts`, `create-ticket.dto.ts` |
| Classes | PascalCase | `AuthService`, `UserController` |
| Functions/Variables | camelCase | `getUserById`, `isAuthenticated` |
| Components | PascalCase | `ClientHome.tsx`, `TicketList.tsx` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT`, `API_URL` |
| DTOs | PascalCase + DTO suffix | `CreateTicketDto`, `UpdateTicketStatusDto` |

### Import Order (Backend)

1. Node built-ins (`@nestjs/*`, `rxjs`)
2. External packages
3. Relative imports (local modules)

```typescript
// Good
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
```

### Import Order (Frontend)

1. React/framework imports
2. External packages
3. Relative imports (components, utils, types)

```typescript
// Good
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/client_components/button';
import { Ticket } from '../types';
```

### Formatting

- **Backend**: Uses Prettier - run `npm run format` before commits
- **Frontend**: ESLint handles formatting (extends TypeScript + React configs)
- 2 spaces for indentation
- Trailing commas in arrays/objects
- Single quotes for strings (except JSX props)

### React Patterns

- Use functional components with hooks
- Props interfaces defined in same file or `./types` directory
- Use `class-variance-authority` + `clsx` + `tailwind-merge` for cn() utility
- Prefer early returns for conditional rendering

```typescript
// Good
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children }: ButtonProps) {
  if (!children) return null;
  return <button className={cn(baseStyles, variants[variant])}>{children}</button>;
}
```

### NestJS Error Handling

- Use built-in exceptions: `BadRequestException`, `UnauthorizedException`, `ConflictException`, `NotFoundException`
- Use DTOs with `class-validator` for validation
- Use guards (`@UseGuards`) for auth/roles

```typescript
// Good
@Injectable()
export class UserService {
  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
```

---

## Architecture

### Backend Structure

```
backend/src/
├── auth/              # Auth module (JWT, 42, Google)
│   ├── dto/           # Request/Response DTOs
│   ├── google/        # Google OAuth
│   └── *.guard.ts     # Auth guards
├── user/              # User module
├── tickets/           # Tickets module (controller, service, gateway)
├── prisma.service.ts  # Prisma singleton
└── main.ts            # App entry point
```

### Frontend Structure

```
frontend/src/
├── components/
│   ├── client_components/  # Client-facing components
│   ├── agent_components/   # Agent dashboard components
│   └── login_components/   # Auth components
├── views/
│   ├── client_view/        # Client pages
│   ├── view_agent/         # Agent pages
│   ├── chat_ticket/       # Chat/ticket detail
│   └── Login_Page/         # Auth pages
├── layout/                 # Layout components
├── context/                # React contexts (Theme)
├── types/                  # Shared TypeScript types
└── router/                 # React Router setup
```

### Database

- Schema located at `backend/prisma/schema.prisma`
- Run migrations with `npx prisma migrate deploy` inside Docker
- Generate client with `npx prisma generate`

---

## Testing Guidelines

- Test files: `*.spec.ts` in same directory as implementation
- Use NestJS Testing module: `Test.createTestingModule`
- Follow AAA pattern: Arrange, Act, Assert
- Mock PrismaService with jest.mock()

```typescript
// Example test
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

---

## Docker Environment

- Frontend: `localhost:5173`
- Backend: `localhost:3000`
- PostgreSQL: `localhost:5432`

Environment variables required (check `docker-compose.yml` for defaults).