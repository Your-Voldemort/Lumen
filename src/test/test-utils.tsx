import { vi } from 'vitest';
import type { User } from '../App';

// Mock Clerk
export const mockClerkUser = {
  id: 'test-clerk-id-123',
  firstName: 'Test',
  lastName: 'User',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  publicMetadata: { role: 'student' },
};

export const mockClerk = {
  user: mockClerkUser,
  isLoaded: true,
  isSignedIn: true,
  signOut: vi.fn(),
};

// Mock users for testing
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@university.edu',
    role: 'student',
    department: 'Computer Science',
    year: 'Senior',
    studentId: 'CS2022001'
  },
  {
    id: '2',
    name: 'Dr. Emily Chen',
    email: 'emily.chen@university.edu',
    role: 'faculty',
    department: 'Computer Science'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael.johnson@university.edu',
    role: 'admin',
    department: 'Administration'
  }
];

// Mock activities for testing
export const mockActivities = [
  {
    id: '1',
    title: 'React Workshop Completion',
    type: 'Workshop',
    description: 'Completed advanced React development workshop',
    date: '2024-12-15',
    studentId: 'CS2022001',
    studentName: 'John Smith',
    fileName: 'react_workshop_certificate.pdf',
    status: 'pending' as const,
    submittedAt: '2024-12-16T10:30:00Z'
  },
  {
    id: '2',
    title: 'Machine Learning Certification',
    type: 'Certificate',
    description: 'Completed online certification in Machine Learning fundamentals',
    date: '2024-11-28',
    studentId: 'CS2022002',
    studentName: 'Sarah Johnson',
    fileName: 'ml_certificate.pdf',
    status: 'approved' as const,
    submittedAt: '2024-11-29T14:20:00Z',
    reviewedAt: '2024-11-30T09:15:00Z',
    reviewedBy: 'Dr. Emily Chen',
    comments: 'Excellent work!'
  }
];

// Local storage mock utilities
export const mockLocalStorage = () => {
  const storage: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
    get length() {
      return Object.keys(storage).length;
    }
  };
};

// Mock Supabase
export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: mockUsers,
        error: null
      }))
    })),
    insert: vi.fn(() => ({
      data: null,
      error: null
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))
  })),
  auth: {
    getUser: vi.fn(() => ({ 
      data: { user: mockClerkUser }, 
      error: null 
    })),
    signOut: vi.fn(),
  }
};

// Custom render function with providers
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };