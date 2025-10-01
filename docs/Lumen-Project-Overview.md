# Lumen – Smart Student Hub: Comprehensive Project Overview

## Vision & Purpose

Lumen (also referred to as Smart Student Hub) is a full-stack web application that centralizes the capture, review, and reporting of student achievements for modern educational institutions. The platform empowers students to submit accomplishments, faculty to review and validate them, and administrators to oversee the entire lifecycle with robust analytics and exportable reports.

---

## Architecture & Technical Stack

### Frontend

- **React 18** with **TypeScript** for type-safe component development
- **Vite** for fast development builds and optimized production bundles
- **React Router** to orchestrate navigation across role-specific views

### Styling & Component Library

- **Tailwind CSS** for utility-first styling conventions
- **shadcn/ui** (Radix UI primitives) to deliver consistent, accessible UI components
- **Lucide React** to provide standardized iconography across the experience

### Authentication & Data Platform

- **Clerk** for authentication, multi-tenant user management, and role-aware onboarding
- **Supabase** (PostgreSQL) as the primary datastore with Row Level Security policies
- **localStorage** as a development/offline-friendly persistence fallback

### Supporting Libraries

- **jsPDF** & **jsPDF-AutoTable** for exporting tabular data in polished PDF reports
- **Recharts** to power interactive data visualizations for analytics dashboards
- **date-fns** to handle date formatting and calculations
- **Sonner** to surface toast notifications for user feedback
- **DOMPurify** to sanitize user-generated HTML payloads before rendering

---

## Role-Based Experience

### Students

**Purpose**: submit and track their achievements.

#### Key capabilities (students)

- Capture activities with metadata (title, category, description, date) and supporting documents (PDF/JPG/PNG up to 5 MB)
- Monitor submission status (pending, approved, rejected)
- View personal profiles and progress analytics
- Explore approved achievements and activity distribution

#### Primary components (students)

- `StudentDashboard.tsx` – high-level overview of current status
- `AddActivityDialog.tsx` – submission form with validation and upload handling
- `StudentActivitiesView.tsx` – filterable activity list with status badges
- `StudentProfileView.tsx` – profile, timeline, and analytics cards
- `StudentStats.tsx` – real-time KPI cards for submissions

### Faculty

**Purpose**: review submissions and respond with actionable feedback.

#### Key capabilities (faculty)

- Review pending activities with filtering and search controls
- Approve or reject submissions with contextual comments
- Access a directory of students filtered by department or keywords
- Inspect submitted documents via embedded PDF viewer
- Audit review history including timestamps and reviewer identity

#### Primary components (faculty)

- `FacultyDashboard.tsx` – hub for pending reviews and metrics
- `FacultyReviewView.tsx` – enriched table of activities awaiting action
- `ReviewActivityDialog.tsx` – detailed review modal with approval workflow
- `FacultyStudentsView.tsx` – student roster and profile access
- `PendingActivityCard.tsx` – compact card with quick review actions

### Administrators

**Purpose**: manage accounts, monitor system-wide health, and produce reports.

#### Key capabilities (administrators)

- CRUD operations for students, faculty, and fellow administrators
- Access to system analytics (submission velocity, approval ratio, category distribution)
- Export datasets to CSV, PDF, or plaintext formats
- Configure filters (date range, department, activity type) when generating reports
- Identify top performers and department-level trends

#### Primary components (administrators)

- `AdminDashboard.tsx` – summarized controls and navigation
- `UserManagementView.tsx` – account administration console
- `AdminAnalytics.tsx` – charts and trend visualizations
- `AdminStats.tsx` – headline metrics across the institution
- `ExportDialog.tsx` – multi-format export pipeline

### Super Administrators

**Purpose**: govern the entire platform, including infrastructure-level controls.

#### Key capabilities (super administrators)

- All administrator features plus system configuration and operational oversight
- Database backup tooling and health monitoring
- Role assignment and elevated permission management
- Access to audit trails and emergency system controls

#### Primary components (super administrators)

- `SuperAdminDashboard.tsx` – comprehensive control center
- `SuperAdminAccess.tsx` – gatekeeper component enforcing privileged access

---

## Data Model Overview

### Users

```ts
interface User {
  id: string;                    // Clerk user identifier
  name: string;                  // Full name
  email: string;                 // Contact email
  role: 'student' | 'faculty' | 'admin' | 'superadmin';
  department?: string;           // Academic department (faculties, students)
  year?: string;                 // Academic year (students)
  studentId?: string;            // Student identifier (students)
}
```

### Activities

```ts
interface Activity {
  id: string;                    // Activity identifier
  title: string;                 // Activity/achievement title
  type: string;                  // Category (Workshop, Certificate, etc.)
  description: string;           // Narrative for the submission
  date: string;                  // Date of achievement
  studentId: string;             // Submitting student reference
  studentName: string;           // Convenience display field
  fileName?: string;             // Uploaded document name
  fileUrl?: string;              // Storage pointer for document
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;           // Submission timestamp
  reviewedAt?: string;           // Review timestamp
  reviewedBy?: string;           // Reviewer identifier
  comments?: string;             // Review feedback
}
```

---

## Authentication & Security Model

### Clerk Integration

1. **Role selection** (`RoleSelectionPage.tsx`) acknowledges the target onboarding path.
2. **Role-specific auth pages** (`RoleSpecificSignInPage.tsx` / `RoleSpecificSignUpPage.tsx`) tailor copy, validation, and metadata.
3. **Role setup** (`RoleSetup.tsx`, `SupabaseRoleSetup.tsx`) synchronizes Clerk identity with Supabase profile information.
4. **Protected routing** (`ProtectedRoute.tsx`) guards routes by enforcing authentication status and role alignment.

### Supabase Row-Level Security

Supabase enforces strict data isolation:

- Students can only access their own activities.
- Faculty may read all activities for review but cannot arbitrarily mutate them.
- Administrators obtain full oversight of users and activities.
- Super administrators receive unrestricted access to support operational responsibilities.

Policies are defined in `database/schema.sql`, for example:

```sql
CREATE POLICY "Students can view own activities" ON activities
  FOR SELECT
  USING (student_id = auth.uid()::text);
```

---

## Feature Walkthroughs

### Activity Submission Lifecycle

1. Student launches `AddActivityDialog.tsx` from their dashboard.
2. Inputs are validated (required fields, file type/size checks, sanitized descriptions).
3. Submission persists to Supabase (or localStorage fallback) and triggers toast confirmation.
4. Status tracking cards and tables update in real time.

### Faculty Review Workflow

1. Faculty open `FacultyReviewView.tsx` to triage the pending queue.
2. Selecting an item launches `ReviewActivityDialog.tsx` with full context.
3. The embedded `PDFViewer.tsx` enables document inspection (zoom, rotate, download, fullscreen).
4. Reviewer provides comments, then approves or rejects; status and metadata update immediately.

### Analytics & Reporting

- `AdminAnalytics.tsx` renders Recharts-powered visualizations (bar, line, pie) capturing trends and distribution.
- `AdminStats.tsx` surfaces aggregate metrics (total activities, approval ratios, departmental breakdowns).
- `ExportDialog.tsx` lets administrators export filtered datasets to CSV, PDF (via jsPDF + AutoTable), or text.

### Global Search

`GlobalSearch.tsx` uses the `useSearch` hook to deliver:

- Debounced (300 ms) searches across activities, users, and navigation features.
- Fuzzy scoring for typo tolerance and ranked results.
- Keyboard shortcut (Ctrl/Cmd + K) access and search history recall.

---

## Application Flow & State Management

### Entry points

- `main.tsx` bootstraps React with `ClerkAppRouter.tsx`.
- `App.tsx` orchestrates top-level routing and state for authenticated views.

### State propagation

`App.tsx` maintains canonical `activities`, `users`, and `currentUser` state. Child dashboards receive filtered slices:

- Students: activities filtered by `studentId`.
- Faculty: pending submissions awaiting review.
- Administrators: complete activity and user datasets.

Callbacks propagate upward to mutate shared state:

- `onAddActivity`, `onApproveActivity`, and `onRejectActivity` adjust lifecycle status.
- `onAddUser`, `onUpdateUser`, and `onDeleteUser` manage the user registry.

### Persistence

- Supabase supplies the primary PostgreSQL datastore with Row Level Security.
- `localStorage` mirrors activities, users, and the active session to support offline development scenarios.

---

## UI & UX Principles

- Consistent `Card`, `Dialog`, `Badge`, and `Button` patterns from shadcn/ui.
- Tailwind's spacing scale (4 px base) drives layout rhythm.
- Animations rely on subtle transitions for responsive feedback.
- Responsive design leverages Tailwind breakpoints (`sm`, `md`, `lg`, `xl`) and a `useIsMobile` helper hook.
- Accessibility is reinforced with ARIA attributes and keyboard navigation support.

---

## Performance Considerations

- Route-level code splitting via `React.lazy`.
- `useMemo` wraps expensive derived computations to prevent rework.
- Debounced inputs throttle search and filtering operations.
- Lazy loading defers heavy assets such as PDFs and imagery.
- Vite's production build applies tree shaking and asset hashing for optimal delivery.

---

## Developer Experience & Tooling

### Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

### Configuration

- `vite.config.ts` – Vite bundler configuration and plugin wiring
- `tsconfig.json` / `tsconfig.node.json` – TypeScript compiler settings
- `tailwind.config.js` & `postcss.config.js` – Tailwind and PostCSS customization

### Environment Variables

```bash
VITE_CLERK_PUBLISHABLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Reference Documentation

- `README.md` – high-level instructions
- `CLERK_SETUP.md` – Clerk integration steps
- `SUPABASE_SETUP.md` & `SUPABASE_SETUP_GUIDE.md` – database configuration
- `SUPERADMIN_GUIDE.md` – elevated operations manual
- `src/guidelines/Guidelines.md` – contributor standards
- `src/Attributions.md` – asset and library acknowledgements

---

## Differentiators & Use Cases

### Key Differentiators

1. Comprehensive role-based architecture with tailored dashboards
2. Real-time feedback loops and status tracking
3. Rich analytics coupled with export capabilities (CSV, PDF, plaintext)
4. Secure document handling with embedded PDF viewer
5. Offline resilience via localStorage synchronization
6. Strong UX foundations with consistent design language and accessibility
7. TypeScript-first codebase with clear separation of concerns

### Target Deployments

- Universities and colleges tracking extracurricular accomplishments
- K-12 schools documenting competitions and certifications
- Professional training centers managing course completions
- Corporate learning & development hubs logging employee upskilling

---

## High-Level Summary

Lumen unifies achievement submission, review, and oversight into a single platform that respects user roles, prioritizes security, and supplies administrators with actionable insight. The blend of Clerk, Supabase, and a modern React toolchain results in a type-safe, extensible codebase that is ready for production deployment and future enhancements.
