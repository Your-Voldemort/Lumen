# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Lumen is a comprehensive student achievement tracking and management platform built with React and TypeScript. It provides a role-based system for students, faculty, administrators, and super administrators to manage academic activities, track progress, and generate reports. The platform uses Clerk for authentication and Supabase for database management.

## Development Commands

### Setup and Development
```bash
# Install dependencies
npm install

# Start development server (opens at http://localhost:3000)
npm run dev

# Build for production (outputs to build/ directory)
npm run build
```

### Testing
Tests are configured using Vitest and Testing Library:
```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Architecture Overview

### Application Structure
The application follows a role-based architecture with four distinct user types, each with dedicated components and workflows:

1. **Entry Point**: `src/main.tsx` bootstraps the React app with `ClerkAppRouter.tsx` handling authentication routing
2. **Authentication Flow**: Clerk handles authentication, users select roles during signup, and are routed to appropriate dashboards
3. **State Management**: Supabase for primary data storage with localStorage backup for offline development
4. **Routing**: React Router for navigation with protected routes based on authentication status

### Core Data Flow
- **User Sessions**: Managed by Clerk with role information stored in Supabase user profiles
- **Activities**: Activity data stored in Supabase with Row-Level Security policies
- **Review Workflow**: Activities move through states: `pending` → `approved`/`rejected` with faculty review
- **Data Persistence**: Primary storage in Supabase, with localStorage fallback for offline development

### Role-Based Component Architecture
```
ClerkAppRouter.tsx (authentication routing)
└── App.tsx (orchestrator)
    ├── Student Role → StudentDashboard → Profile, Activities, Stats
    ├── Faculty Role → FacultyDashboard → Review, Students, Analytics
    ├── Admin Role → AdminDashboard → UserManagement, Reports, SystemAnalytics
    └── Super Admin Role → SuperAdminDashboard → System Controls, Advanced Management
```

### Key Technical Decisions
- **UI Library**: shadcn/ui components provide consistent, accessible design system
- **Build Tool**: Vite for fast development and optimized production builds
- **Type Safety**: TypeScript strict mode enforced throughout
- **PDF Handling**: Built-in PDF viewer component for document management
- **Authentication**: Clerk for secure user authentication and session management
- **Database**: Supabase (PostgreSQL) as primary datastore with Row-Level Security
- **Offline Support**: localStorage serves as backup for offline development

## Code Guidelines

### TypeScript Standards
- Strict mode enabled - avoid `any` type
- Define interfaces for all props and complex objects
- Use union types for limited string values (e.g., `'pending' | 'approved' | 'rejected'`)

### Component Patterns
- Functional components with hooks exclusively
- Props interfaces defined for type safety
- Event handlers use arrow functions with proper error handling
- Toast notifications (Sonner) for user feedback

### File Organization
- Components grouped by role: `student/`, `faculty/`, `admin/`, `shared/`
- UI primitives in `ui/` (shadcn components)
- Custom hooks in `hooks/`
- PascalCase for component files, camelCase for utilities

### State Management Principles
- Local state for component-specific data
- Lift state up when shared between components
- localStorage for persistence with error handling
- Unidirectional data flow from parent to child

## Authentication Setup

The application uses Clerk for authentication. Users need to:
1. Sign up with their email address
2. Complete the Clerk authentication flow
3. Select their role (Student, Faculty, Admin, or Super Administrator)
4. Complete profile setup with department information

See [CLERK_SETUP.md](CLERK_SETUP.md) and [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) for configuration details.

## Key Technologies

- **React 18** with TypeScript
- **Vite** build tool
- **Clerk** for authentication and user management
- **Supabase** (PostgreSQL) for database with Row-Level Security
- **Tailwind CSS** + **shadcn/ui** for styling
- **jsPDF** for report generation
- **Recharts** for data visualization
- **date-fns** for date handling
- **Vitest** + **Testing Library** for testing