# Lumen
A comprehensive student achievement tracking and management platform built with React and TypeScript. Lumen provides a modern, role-based system for students, faculty, administrators, and super administrators to manage academic activities, track progress, and generate reports. The platform integrates Clerk for authentication and Supabase for database management, offering a secure and scalable solution for educational institutions.

## Features

### Student Features
- **Activity Submission**: Submit achievements, certificates, competitions, and other academic activities
- **Progress Tracking**: Visual analytics of submitted activities and their approval status
- **Profile Management**: Comprehensive student profiles with academic records
- **Real-time Status Updates**: Track submission status (pending, approved, rejected)
- **Document Management**: Upload and view proof documents with built-in PDF viewer

### Faculty Features
- **Activity Review System**: Review and approve/reject student submissions
- **Advanced Search & Filtering**: Find specific activities with enhanced search capabilities
- **Student Directory**: View and manage student information across departments
- **Bulk Operations**: Efficiently process multiple submissions
- **Comment System**: Provide detailed feedback on submissions

### Administrative Features
- **Comprehensive Dashboard**: System-wide analytics and statistics
- **User Management**: Create and manage student and faculty accounts
- **Advanced Reporting**: Generate detailed reports in CSV and PDF formats
- **System Analytics**: Track usage patterns and performance metrics
- **Data Export**: Bulk export capabilities for institutional reporting

### Super Administrator Features
- **Full System Access**: Master control over all platform functions
- **Advanced User Management**: Create, modify, and delete any user account with role assignment
- **System Configuration**: Server settings, database configuration, and application-wide controls
- **Security Monitoring**: System alerts, security event monitoring, and audit log access
- **Permission Override**: Bypass standard role restrictions for system administration

### Technical Features
- **Clerk Authentication**: Secure authentication with role-based access control and session management
- **Supabase Database**: PostgreSQL database with Row-Level Security for data isolation
- **Responsive Design**: Mobile-first design that works across all devices
- **PDF Document Handling**: Built-in PDF viewer with zoom, rotation, and download capabilities
- **Real-time Search**: Global search functionality across activities and users
- **Offline Support**: Local storage integration for offline development and data persistence
- **Modern UI Components**: Built with shadcn/ui for consistent, accessible design

## Project Structure

```
src/
├── components/
│   ├── student/           # Student dashboard and activity submission
│   │   ├── StudentDashboard.tsx
│   │   ├── AddActivityDialog.tsx
│   │   ├── StudentStats.tsx
│   │   └── StudentProfileView.tsx
│   ├── faculty/           # Faculty review and management tools
│   │   ├── FacultyDashboard.tsx
│   │   ├── FacultyReviewView.tsx
│   │   ├── ReviewActivityDialog.tsx
│   │   ├── PendingActivityCard.tsx
│   │   └── FacultyStudentsView.tsx
│   ├── admin/             # Administrative dashboard and tools
│   │   ├── AdminDashboard.tsx
│   │   ├── UserManagementView.tsx
│   │   ├── AdminStats.tsx
│   │   ├── AdminAnalytics.tsx
│   │   └── ExportDialog.tsx
│   ├── superadmin/        # Super administrator components
│   │   └── SuperAdminDashboard.tsx
│   ├── clerk-auth/        # Clerk authentication components
│   │   ├── ClerkSignInPage.tsx
│   │   ├── ClerkSignUpPage.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── RoleSetup.tsx
│   ├── supabase-auth/     # Supabase integration components
│   │   └── SupabaseRoleSetup.tsx
│   ├── shared/            # Shared utility components
│   │   ├── PDFViewer.tsx
│   │   ├── PDFViewerDialog.tsx
│   │   ├── GlobalSearch.tsx
│   │   ├── RoleHeader.tsx
│   │   └── SearchWithSuggestions.tsx
│   ├── reports/           # Reporting components
│   ├── settings/          # User settings and preferences
│   └── ui/                # Reusable UI components (shadcn/ui)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and helpers
├── styles/                # Global styling
├── guidelines/            # Project documentation
├── ClerkAppRouter.tsx     # Main routing with Clerk integration
└── main.tsx              # Application entry point
```

## Key Components

### Core Features
- **[`PDFViewer`](src/components/shared/PDFViewer.tsx)**: Advanced PDF viewing with zoom, rotation, and download capabilities
- **[`GlobalSearch`](src/components/shared/GlobalSearch.tsx)**: Comprehensive search across activities, users, and system functions
- **[`RoleHeader`](src/components/shared/RoleHeader.tsx)**: Dynamic navigation based on user roles

### Student Components
- **[`StudentDashboard`](src/components/student/StudentDashboard.tsx)**: Main student interface with activity overview
- **[`AddActivityDialog`](src/components/student/AddActivityDialog.tsx)**: Activity submission form with file upload

### Faculty Components
- **[`FacultyReviewView`](src/components/faculty/FacultyReviewView.tsx)**: Enhanced review interface with filtering and search
- **[`ReviewActivityDialog`](src/components/faculty/ReviewActivityDialog.tsx)**: Detailed activity review with approval/rejection workflow

### Administrative Components
- **[`AdminDashboard`](src/components/admin/AdminDashboard.tsx)**: Comprehensive admin interface with analytics
- **[`UserManagementView`](src/components/admin/UserManagementView.tsx)**: Complete user account management system
- **[`ExportDialog`](src/components/admin/ExportDialog.tsx)**: Data export functionality in multiple formats

### Super Administrator Components
- **[`SuperAdminDashboard`](src/components/superadmin/SuperAdminDashboard.tsx)**: Master control center with full system access
- **[`SuperAdminAccess`](src/components/auth/SuperAdminAccess.tsx)**: Access control wrapper for super admin features

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A [Clerk](https://clerk.com) account for authentication
- A [Supabase](https://supabase.com) account for database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Your-Voldemort/Lumen.git
   cd Lumen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.template` to `.env.local`
   - Follow [CLERK_SETUP.md](CLERK_SETUP.md) to configure Clerk authentication
   - Follow [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) to configure Supabase database
   - Update `.env.local` with your Clerk and Supabase credentials

4. Run the database schema:
   - Open your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the schema from `database/schema.sql`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### First Time Setup

After starting the application:

1. Click "Sign Up" to create a new account
2. Complete the Clerk authentication flow
3. Select your role (Student, Faculty, Admin, or Super Administrator)
4. Complete your profile setup with department and other details
5. Start using the platform based on your role

For detailed setup instructions, see:
- [CLERK_SETUP.md](CLERK_SETUP.md) - Clerk authentication configuration
- [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md) - Supabase database setup
- [SUPERADMIN_GUIDE.md](SUPERADMIN_GUIDE.md) - Super administrator features

### Building for Production

```bash
npm run build
```

The production build will be available in the `build` directory.

### Running Tests

```bash
npm run test        # Run tests
npm run test:ui     # Run tests with UI
npm run test:coverage  # Run tests with coverage
```

## Technology Stack

### Core Technologies
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing for navigation

### Authentication & Database
- **Clerk**: Modern authentication with role-based access control and session management
- **Supabase**: PostgreSQL database with Row-Level Security and real-time capabilities
- **localStorage**: Offline data persistence for development and backup

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible UI component library built on Radix UI
- **Lucide React**: Consistent iconography
- **Radix UI**: Accessible, unstyled UI primitives

### Additional Libraries
- **jsPDF & jsPDF-AutoTable**: PDF generation and formatting for reports
- **Sonner**: Elegant toast notifications
- **date-fns**: Date formatting and manipulation
- **Recharts**: Data visualization and charts
- **DOMPurify**: HTML sanitization for security

### Development & Testing
- **Vitest**: Fast unit testing framework
- **Testing Library**: React component testing utilities
- **ESLint & TypeScript**: Code quality and type checking

## Key Features Deep Dive

### Authentication & Authorization
- **Clerk Integration**: Modern authentication with email/password and social login support
- **Role-based Access Control**: Four distinct roles (Student, Faculty, Admin, Super Administrator)
- **Row-Level Security**: Supabase RLS policies ensure data isolation between users
- **Protected Routes**: Automatic redirect to sign-in for unauthorized access
- **Role Setup Flow**: Guided onboarding for new users to select and configure their role

### Activity Management
- Multi-step submission process with validation
- File upload with type and size validation
- Status tracking (pending, approved, rejected)
- Faculty review workflow with comments

### Analytics & Reporting
- Real-time dashboard statistics
- Interactive charts and visualizations
- CSV and PDF export capabilities
- Advanced filtering and search

### Document Management
- Built-in PDF viewer with controls
- File type validation (PDF, JPG, PNG)
- Secure file handling and storage simulation
- Document preview and download functionality

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent component structure and naming
- Comprehensive type definitions

### Component Architecture
- Functional components with hooks
- Props interfaces for type safety
- Reusable UI components
- Clear separation of concerns

### State Management
- React hooks for local state
- Supabase for primary data persistence with real-time updates
- localStorage for offline development and backup
- Prop drilling minimized with context where appropriate
- Clerk for authentication state management

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Attributions

This project includes:
- Components from [shadcn/ui](https://ui.shadcn.com/) used under [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)
- Photos from [Unsplash](https://unsplash.com) used under their [license](https://unsplash.com/license)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Author

**SHREY TRIPATHI**

For questions or support, please open an issue on the GitHub repository.
