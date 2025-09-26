# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Lumen is a comprehensive student achievement tracking and management platform built with React and TypeScript. It provides a role-based system for students, faculty, and administrators to manage academic activities, track progress, and generate reports.

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
No test runner is currently configured. To add testing:
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Add test script to package.json
# "test": "vitest"
```

## Architecture Overview

### Application Structure
The application follows a role-based architecture with three distinct user types, each with dedicated components and workflows:

1. **Entry Point**: `src/main.tsx` bootstraps the React app with `App.tsx` as the root component
2. **Authentication Flow**: Login via `LoginForm` component determines user role and routes to appropriate dashboard
3. **State Management**: Local state with localStorage persistence for users, activities, and current session
4. **Routing**: Section-based navigation using state rather than URL routing (managed by `currentSection` state)

### Core Data Flow
- **User Sessions**: Managed in `App.tsx` with `currentUser` state, persisted to localStorage
- **Activities**: Central activity data (`Activity[]`) flows from App.tsx to role-specific components
- **Review Workflow**: Activities move through states: `pending` → `approved`/`rejected` with faculty review
- **Data Persistence**: All state changes are synced to localStorage for offline capability

### Role-Based Component Architecture
```
App.tsx (orchestrator)
├── Student Role → StudentDashboard → Profile, Activities, Stats
├── Faculty Role → FacultyDashboard → Review, Students, Analytics
└── Admin Role → AdminDashboard → UserManagement, Reports, SystemAnalytics
```

### Key Technical Decisions
- **UI Library**: shadcn/ui components provide consistent, accessible design system
- **Build Tool**: Vite for fast development and optimized production builds
- **Type Safety**: TypeScript strict mode enforced throughout
- **PDF Handling**: Built-in PDF viewer component for document management
- **No External Backend**: localStorage serves as the data persistence layer

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

## Default User Credentials

For development and testing:
- **Student**: `john.smith@university.edu`
- **Faculty**: `emily.chen@university.edu`  
- **Admin**: `michael.johnson@university.edu`

## Key Technologies

- **React 18** with TypeScript
- **Vite** build tool
- **Tailwind CSS** + **shadcn/ui** for styling
- **jsPDF** for report generation
- **Recharts** for data visualization
- **date-fns** for date handling