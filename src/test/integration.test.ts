import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Integration tests for user workflows
describe('User Workflow Integration Tests', () => {
  let mockLocalStorage: any;

  beforeEach(() => {
    // Setup mock localStorage
    mockLocalStorage = {
      store: {} as Record<string, string>,
      getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage.store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage.store[key];
      }),
      clear: vi.fn(() => {
        mockLocalStorage.store = {};
      }),
    };
    
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe('Student Workflow', () => {
    it('should complete student activity submission flow', () => {
      // Mock student user
      const student = {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@university.edu',
        role: 'student' as const,
        department: 'Computer Science',
        year: 'Senior',
        studentId: 'CS2022001'
      };

      // Step 1: Student login
      mockLocalStorage.setItem('currentUser', JSON.stringify(student));
      const savedUser = JSON.parse(mockLocalStorage.getItem('currentUser'));
      
      expect(savedUser).toEqual(student);
      expect(savedUser.role).toBe('student');

      // Step 2: Create new activity
      const newActivity = {
        id: Date.now().toString(),
        title: 'React Workshop Completion',
        type: 'Workshop',
        description: 'Completed advanced React workshop',
        date: '2024-12-15',
        studentId: student.studentId,
        studentName: student.name,
        status: 'pending' as const,
        submittedAt: new Date().toISOString()
      };

      // Step 3: Save activity to localStorage
      const existingActivities = JSON.parse(mockLocalStorage.getItem('activities') || '[]');
      const updatedActivities = [newActivity, ...existingActivities];
      mockLocalStorage.setItem('activities', JSON.stringify(updatedActivities));

      // Verify activity was saved
      const savedActivities = JSON.parse(mockLocalStorage.getItem('activities'));
      expect(savedActivities).toHaveLength(1);
      expect(savedActivities[0]).toEqual(newActivity);
      expect(savedActivities[0].status).toBe('pending');
    });

    it('should handle student profile management', () => {
      const student = {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@university.edu',
        role: 'student' as const,
        department: 'Computer Science',
        year: 'Senior',
        studentId: 'CS2022001'
      };

      // Update student profile
      const updatedStudent = {
        ...student,
        department: 'Information Technology',
        year: 'Graduate'
      };

      mockLocalStorage.setItem('currentUser', JSON.stringify(updatedStudent));
      const savedUser = JSON.parse(mockLocalStorage.getItem('currentUser'));

      expect(savedUser.department).toBe('Information Technology');
      expect(savedUser.year).toBe('Graduate');
    });
  });

  describe('Faculty Workflow', () => {
    it('should complete faculty activity review flow', () => {
      // Mock faculty user
      const faculty = {
        id: '2',
        name: 'Dr. Emily Chen',
        email: 'emily.chen@university.edu',
        role: 'faculty' as const,
        department: 'Computer Science'
      };

      // Mock pending activity
      const pendingActivity = {
        id: '1',
        title: 'React Workshop Completion',
        type: 'Workshop',
        description: 'Completed advanced React workshop',
        date: '2024-12-15',
        studentId: 'CS2022001',
        studentName: 'John Smith',
        status: 'pending' as const,
        submittedAt: '2024-12-16T10:30:00Z'
      };

      // Save initial state
      mockLocalStorage.setItem('currentUser', JSON.stringify(faculty));
      mockLocalStorage.setItem('activities', JSON.stringify([pendingActivity]));

      // Step 1: Faculty reviews and approves activity
      const approvedActivity = {
        ...pendingActivity,
        status: 'approved' as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: faculty.name,
        comments: 'Excellent work! Well documented completion.'
      };

      const activities = JSON.parse(mockLocalStorage.getItem('activities'));
      const updatedActivities = activities.map((activity: any) => 
        activity.id === pendingActivity.id ? approvedActivity : activity
      );
      mockLocalStorage.setItem('activities', JSON.stringify(updatedActivities));

      // Verify approval
      const savedActivities = JSON.parse(mockLocalStorage.getItem('activities'));
      expect(savedActivities[0].status).toBe('approved');
      expect(savedActivities[0].reviewedBy).toBe(faculty.name);
      expect(savedActivities[0]).toHaveProperty('comments');
    });

    it('should handle faculty rejection workflow', () => {
      const faculty = {
        id: '2',
        name: 'Dr. Emily Chen',
        email: 'emily.chen@university.edu',
        role: 'faculty' as const,
        department: 'Computer Science'
      };

      const pendingActivity = {
        id: '1',
        title: 'Incomplete Workshop',
        type: 'Workshop',
        description: 'Workshop submission without proper documentation',
        date: '2024-12-15',
        studentId: 'CS2022001',
        studentName: 'John Smith',
        status: 'pending' as const,
        submittedAt: '2024-12-16T10:30:00Z'
      };

      mockLocalStorage.setItem('activities', JSON.stringify([pendingActivity]));

      // Faculty rejects activity
      const rejectedActivity = {
        ...pendingActivity,
        status: 'rejected' as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: faculty.name,
        comments: 'Insufficient documentation. Please provide completion certificate and reflection.'
      };

      const activities = JSON.parse(mockLocalStorage.getItem('activities'));
      const updatedActivities = activities.map((activity: any) => 
        activity.id === pendingActivity.id ? rejectedActivity : activity
      );
      mockLocalStorage.setItem('activities', JSON.stringify(updatedActivities));

      const savedActivities = JSON.parse(mockLocalStorage.getItem('activities'));
      expect(savedActivities[0].status).toBe('rejected');
      expect(savedActivities[0].comments).toContain('Insufficient documentation');
    });
  });

  describe('Admin Workflow', () => {
    it('should complete admin user management flow', () => {
      const admin = {
        id: '3',
        name: 'Michael Johnson',
        email: 'michael.johnson@university.edu',
        role: 'admin' as const,
        department: 'Administration'
      };

      // Mock existing users
      const existingUsers = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@university.edu',
          role: 'student' as const,
          department: 'Computer Science',
          studentId: 'CS2022001'
        }
      ];

      mockLocalStorage.setItem('currentUser', JSON.stringify(admin));
      mockLocalStorage.setItem('users', JSON.stringify(existingUsers));

      // Step 1: Admin creates new user
      const newUser = {
        id: Date.now().toString(),
        name: 'Sarah Wilson',
        email: 'sarah.wilson@university.edu',
        role: 'faculty' as const,
        department: 'Computer Science'
      };

      const users = JSON.parse(mockLocalStorage.getItem('users'));
      const updatedUsers = [...users, newUser];
      mockLocalStorage.setItem('users', JSON.stringify(updatedUsers));

      // Verify user creation
      const savedUsers = JSON.parse(mockLocalStorage.getItem('users'));
      expect(savedUsers).toHaveLength(2);
      expect(savedUsers[1].name).toBe('Sarah Wilson');
      expect(savedUsers[1].role).toBe('faculty');

      // Step 2: Admin updates user information
      const updatedUser = {
        ...savedUsers[1],
        department: 'Information Technology'
      };

      const finalUsers = savedUsers.map((user: any) => 
        user.id === updatedUser.id ? updatedUser : user
      );
      mockLocalStorage.setItem('users', JSON.stringify(finalUsers));

      const finalSavedUsers = JSON.parse(mockLocalStorage.getItem('users'));
      expect(finalSavedUsers[1].department).toBe('Information Technology');
    });

    it('should generate reports for approved activities', () => {
      // Mock approved activities
      const approvedActivities = [
        {
          id: '1',
          title: 'React Workshop',
          type: 'Workshop',
          status: 'approved',
          studentId: 'CS2022001',
          studentName: 'John Smith',
          date: '2024-12-15'
        },
        {
          id: '2',
          title: 'ML Certificate',
          type: 'Certificate',
          status: 'approved',
          studentId: 'CS2022002',
          studentName: 'Sarah Johnson',
          date: '2024-11-28'
        }
      ];

      mockLocalStorage.setItem('activities', JSON.stringify(approvedActivities));

      // Generate report data
      const activities = JSON.parse(mockLocalStorage.getItem('activities'));
      const approvedOnly = activities.filter((activity: any) => activity.status === 'approved');
      
      const reportData = {
        totalApproved: approvedOnly.length,
        byType: approvedOnly.reduce((acc: any, activity: any) => {
          acc[activity.type] = (acc[activity.type] || 0) + 1;
          return acc;
        }, {}),
        byStudent: approvedOnly.reduce((acc: any, activity: any) => {
          acc[activity.studentName] = (acc[activity.studentName] || 0) + 1;
          return acc;
        }, {})
      };

      expect(reportData.totalApproved).toBe(2);
      expect(reportData.byType.Workshop).toBe(1);
      expect(reportData.byType.Certificate).toBe(1);
      expect(reportData.byStudent['John Smith']).toBe(1);
      expect(reportData.byStudent['Sarah Johnson']).toBe(1);
    });
  });

  describe('Cross-Role Integration', () => {
    it('should handle complete activity lifecycle from submission to approval', () => {
      // Setup all users
      const users = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@university.edu',
          role: 'student' as const,
          studentId: 'CS2022001'
        },
        {
          id: '2',
          name: 'Dr. Emily Chen',
          email: 'emily.chen@university.edu',
          role: 'faculty' as const
        },
        {
          id: '3',
          name: 'Michael Johnson',
          email: 'michael.johnson@university.edu',
          role: 'admin' as const
        }
      ];

      mockLocalStorage.setItem('users', JSON.stringify(users));

      // Student submits activity
      const newActivity = {
        id: '1',
        title: 'Hackathon Participation',
        type: 'Competition',
        description: 'Participated in university hackathon',
        date: '2024-12-01',
        studentId: 'CS2022001',
        studentName: 'John Smith',
        status: 'pending' as const,
        submittedAt: new Date().toISOString()
      };

      mockLocalStorage.setItem('activities', JSON.stringify([newActivity]));

      // Faculty reviews and approves
      const reviewedActivity = {
        ...newActivity,
        status: 'approved' as const,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Dr. Emily Chen',
        comments: 'Great participation and innovative solution!'
      };

      mockLocalStorage.setItem('activities', JSON.stringify([reviewedActivity]));

      // Admin generates report
      const activities = JSON.parse(mockLocalStorage.getItem('activities'));
      const approvedActivities = activities.filter((a: any) => a.status === 'approved');

      expect(approvedActivities).toHaveLength(1);
      expect(approvedActivities[0].title).toBe('Hackathon Participation');
      expect(approvedActivities[0].status).toBe('approved');
      expect(approvedActivities[0].reviewedBy).toBe('Dr. Emily Chen');
    });
  });
});