-- =============================================================================
-- COMPREHENSIVE LMS/ERP DATABASE SCHEMA FOR LUMEN PROJECT
-- Enterprise-grade Educational Management System
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_crypto";

-- =============================================================================
-- 1. CORE SYSTEM TABLES
-- =============================================================================

-- System settings and configuration
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for all system changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. ORGANIZATIONAL STRUCTURE
-- =============================================================================

-- Educational institutions (for multi-tenant support)
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    short_name TEXT,
    code TEXT UNIQUE,
    type TEXT CHECK (type IN ('university', 'college', 'school', 'institute')),
    address JSONB, -- {street, city, state, country, postal_code}
    contact_info JSONB, -- {phone, email, website, fax}
    accreditation_info JSONB,
    logo_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    academic_calendar_type TEXT DEFAULT 'semester', -- semester, quarter, trimester
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic departments/faculties
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    head_of_department_id TEXT, -- References users.id
    parent_department_id UUID REFERENCES departments(id),
    budget_allocation DECIMAL(15,2),
    contact_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

-- Buildings and facilities
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    address JSONB,
    total_floors INTEGER,
    total_rooms INTEGER,
    building_type TEXT CHECK (building_type IN ('academic', 'administrative', 'residential', 'sports', 'library', 'laboratory')),
    facilities JSONB, -- Array of facilities like ['wifi', 'ac', 'projector', 'lab_equipment']
    accessibility_features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms within buildings
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    name TEXT,
    floor INTEGER,
    capacity INTEGER,
    room_type TEXT CHECK (room_type IN ('classroom', 'laboratory', 'office', 'auditorium', 'library', 'computer_lab', 'conference_room')),
    equipment JSONB, -- Array of equipment available
    area_sqft DECIMAL(10,2),
    is_accessible BOOLEAN DEFAULT TRUE,
    booking_allowed BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(building_id, room_number)
);

-- =============================================================================
-- 3. USER MANAGEMENT SYSTEM
-- =============================================================================

-- Enhanced users table with comprehensive profile information
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Clerk user ID
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    display_name TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    nationality TEXT,
    phone TEXT,
    emergency_contact JSONB, -- {name, relationship, phone, email}
    address JSONB, -- {permanent: {}, current: {}}
    
    -- System fields
    role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'staff', 'admin', 'superadmin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'graduated', 'withdrawn')),
    institution_id UUID REFERENCES institutions(id),
    department_id UUID REFERENCES departments(id),
    
    -- Academic fields
    student_id TEXT UNIQUE, -- For students
    employee_id TEXT UNIQUE, -- For faculty/staff
    admission_date DATE,
    graduation_date DATE,
    academic_level TEXT CHECK (academic_level IN ('undergraduate', 'graduate', 'postgraduate', 'doctoral')),
    
    -- Profile information
    profile_picture_url TEXT,
    bio TEXT,
    social_links JSONB,
    preferences JSONB, -- UI preferences, notification settings
    
    -- Security and access
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles and permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB, -- Array of permission strings
    is_system_role BOOLEAN DEFAULT FALSE,
    institution_id UUID REFERENCES institutions(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User role assignments (many-to-many)
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by TEXT REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_id)
);

-- User sessions for tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    login_at TIMESTAMPTZ DEFAULT NOW(),
    logout_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- =============================================================================
-- 4. ACADEMIC MANAGEMENT SYSTEM
-- =============================================================================

-- Academic periods (semesters, quarters, etc.)
CREATE TABLE academic_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Fall 2024", "Spring 2025"
    type TEXT NOT NULL CHECK (type IN ('semester', 'quarter', 'trimester', 'year')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_start_date DATE,
    registration_end_date DATE,
    add_drop_deadline DATE,
    withdrawal_deadline DATE,
    is_current BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic programs (degrees, certificates)
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT CHECK (type IN ('bachelor', 'master', 'doctoral', 'certificate', 'diploma')),
    description TEXT,
    duration_years DECIMAL(3,1), -- 4.0, 2.5, etc.
    total_credits_required INTEGER,
    minimum_gpa DECIMAL(3,2),
    admission_requirements JSONB,
    career_outcomes JSONB,
    accreditation_info JSONB,
    tuition_fee DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

-- Course catalog
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- "CS101", "MATH200"
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    level TEXT CHECK (level IN ('100', '200', '300', '400', '500', '600', '700', '800')),
    prerequisites JSONB, -- Array of course IDs or requirement descriptions
    corequisites JSONB,
    learning_outcomes JSONB,
    assessment_methods JSONB,
    contact_hours_per_week INTEGER,
    lab_hours_per_week INTEGER DEFAULT 0,
    course_type TEXT CHECK (course_type IN ('core', 'elective', 'major_required', 'general_education')),
    delivery_mode TEXT CHECK (delivery_mode IN ('in_person', 'online', 'hybrid')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

-- Course sections (specific instances of courses in a period)
CREATE TABLE course_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    academic_period_id UUID REFERENCES academic_periods(id) ON DELETE CASCADE,
    section_number TEXT NOT NULL, -- "001", "A", "Morning"
    instructor_id TEXT REFERENCES users(id),
    co_instructors JSONB, -- Array of user IDs
    max_enrollment INTEGER,
    current_enrollment INTEGER DEFAULT 0,
    waitlist_capacity INTEGER DEFAULT 0,
    current_waitlist INTEGER DEFAULT 0,
    
    -- Schedule information
    schedule JSONB, -- {days: ['MON', 'WED', 'FRI'], time: {start: '09:00', end: '10:15'}}
    room_id UUID REFERENCES rooms(id),
    
    -- Dates
    start_date DATE,
    end_date DATE,
    
    -- Status
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, academic_period_id, section_number)
);

-- Student enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    course_section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
    enrollment_status TEXT DEFAULT 'enrolled' CHECK (enrollment_status IN ('enrolled', 'dropped', 'withdrawn', 'completed')),
    enrollment_date TIMESTAMPTZ DEFAULT NOW(),
    drop_date TIMESTAMPTZ,
    grade_letter TEXT CHECK (grade_letter IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W', 'P', 'NP')),
    grade_points DECIMAL(3,2),
    credits_earned DECIMAL(3,1),
    is_audit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_section_id)
);

-- Grading components (assignments, exams, projects)
CREATE TABLE grade_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('assignment', 'quiz', 'midterm', 'final', 'project', 'participation', 'lab')),
    description TEXT,
    max_points DECIMAL(8,2) NOT NULL,
    weight_percentage DECIMAL(5,2), -- Out of 100
    due_date TIMESTAMPTZ,
    submission_type TEXT CHECK (submission_type IN ('online', 'paper', 'presentation', 'none')),
    instructions JSONB,
    rubric JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual grades
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    grade_component_id UUID REFERENCES grade_components(id) ON DELETE CASCADE,
    points_earned DECIMAL(8,2),
    submission_date TIMESTAMPTZ,
    graded_date TIMESTAMPTZ,
    graded_by TEXT REFERENCES users(id),
    feedback TEXT,
    is_late BOOLEAN DEFAULT FALSE,
    late_penalty_applied DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(enrollment_id, grade_component_id)
);

-- Academic transcripts
CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    academic_period_id UUID REFERENCES academic_periods(id) ON DELETE CASCADE,
    total_credits_attempted DECIMAL(5,1) DEFAULT 0,
    total_credits_earned DECIMAL(5,1) DEFAULT 0,
    total_grade_points DECIMAL(8,2) DEFAULT 0,
    gpa DECIMAL(3,2) DEFAULT 0,
    cumulative_credits_attempted DECIMAL(5,1) DEFAULT 0,
    cumulative_credits_earned DECIMAL(5,1) DEFAULT 0,
    cumulative_grade_points DECIMAL(8,2) DEFAULT 0,
    cumulative_gpa DECIMAL(3,2) DEFAULT 0,
    academic_standing TEXT CHECK (academic_standing IN ('good', 'warning', 'probation', 'suspension', 'honors')),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    is_official BOOLEAN DEFAULT FALSE
);

-- =============================================================================
-- 5. FINANCIAL MANAGEMENT SYSTEM
-- =============================================================================

-- Fee types and structures
CREATE TABLE fee_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('tuition', 'lab', 'library', 'technology', 'activity', 'parking', 'housing', 'meal_plan', 'other')),
    amount DECIMAL(15,2) NOT NULL,
    is_per_credit BOOLEAN DEFAULT FALSE,
    applies_to_programs JSONB, -- Array of program IDs
    applies_to_levels JSONB, -- Array of academic levels
    is_mandatory BOOLEAN DEFAULT TRUE,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student fee assessments
CREATE TABLE student_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    academic_period_id UUID REFERENCES academic_periods(id) ON DELETE CASCADE,
    fee_type_id UUID REFERENCES fee_types(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment records
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'financial_aid')),
    payment_reference TEXT, -- Transaction ID, check number, etc.
    payment_date TIMESTAMPTZ NOT NULL,
    processed_by TEXT REFERENCES users(id),
    notes TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment allocations (which fees were paid)
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    student_fee_id UUID REFERENCES student_fees(id) ON DELETE CASCADE,
    amount_allocated DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial aid and scholarships
CREATE TABLE financial_aid (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    academic_period_id UUID REFERENCES academic_periods(id) ON DELETE CASCADE,
    aid_type TEXT CHECK (aid_type IN ('scholarship', 'grant', 'loan', 'work_study', 'fellowship', 'assistantship')),
    source TEXT, -- Government, institution, external organization
    amount DECIMAL(15,2) NOT NULL,
    disbursement_schedule JSONB, -- When payments are made
    requirements JSONB, -- GPA requirements, service hours, etc.
    status TEXT DEFAULT 'awarded' CHECK (status IN ('applied', 'awarded', 'disbursed', 'cancelled', 'completed')),
    awarded_date DATE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget management
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    name TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    total_allocation DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    committed_amount DECIMAL(15,2) DEFAULT 0,
    budget_categories JSONB, -- Breakdown by category
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'exceeded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. RESOURCE MANAGEMENT SYSTEM
-- =============================================================================

-- Inventory categories
CREATE TABLE inventory_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES inventory_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment and assets
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    category_id UUID REFERENCES inventory_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    model TEXT,
    serial_number TEXT UNIQUE,
    barcode TEXT UNIQUE,
    manufacturer TEXT,
    purchase_date DATE,
    purchase_cost DECIMAL(15,2),
    warranty_expiry DATE,
    current_location_room_id UUID REFERENCES rooms(id),
    assigned_to_user_id TEXT REFERENCES users(id),
    condition_status TEXT CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'damaged', 'retired')),
    maintenance_schedule JSONB,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    is_bookable BOOLEAN DEFAULT FALSE,
    booking_requirements JSONB,
    usage_instructions TEXT,
    safety_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment bookings
CREATE TABLE equipment_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
    booked_by_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    booking_purpose TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    actual_start_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled', 'no_show')),
    special_requirements TEXT,
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by TEXT REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library resources
CREATE TABLE library_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    publisher TEXT,
    publication_year INTEGER,
    edition TEXT,
    resource_type TEXT CHECK (resource_type IN ('book', 'journal', 'magazine', 'dvd', 'digital', 'thesis', 'reference')),
    category TEXT,
    dewey_decimal TEXT,
    location TEXT, -- Shelf location
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    loan_period_days INTEGER DEFAULT 14,
    renewable_times INTEGER DEFAULT 2,
    fine_per_day DECIMAL(5,2) DEFAULT 0.50,
    is_reference_only BOOLEAN DEFAULT FALSE,
    digital_access_url TEXT,
    description TEXT,
    keywords JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library loans/checkouts
CREATE TABLE library_loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES library_resources(id) ON DELETE CASCADE,
    borrower_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    checkout_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ,
    renewal_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue', 'lost', 'damaged')),
    fine_amount DECIMAL(8,2) DEFAULT 0,
    fine_paid_amount DECIMAL(8,2) DEFAULT 0,
    notes TEXT,
    checked_out_by TEXT REFERENCES users(id),
    returned_to TEXT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. COMMUNICATION SYSTEM
-- =============================================================================

-- Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT REFERENCES users(id) NOT NULL,
    target_audience JSONB, -- Array: ['students', 'faculty', 'staff'] or specific user groups
    target_programs JSONB, -- Array of program IDs
    target_departments JSONB, -- Array of department IDs
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    publication_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT FALSE,
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    attachments JSONB, -- Array of file URLs
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcement views/acknowledgments
CREATE TABLE announcement_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    UNIQUE(announcement_id, user_id)
);

-- Discussion forums
CREATE TABLE forums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    course_section_id UUID REFERENCES course_sections(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('general', 'academic', 'social', 'help', 'announcements')),
    access_level TEXT DEFAULT 'public' CHECK (access_level IN ('public', 'registered', 'enrolled', 'restricted')),
    allowed_user_roles JSONB, -- Array of roles that can access
    moderated BOOLEAN DEFAULT TRUE,
    moderators JSONB, -- Array of user IDs
    post_approval_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum topics/threads
CREATE TABLE forum_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author_id TEXT REFERENCES users(id) NOT NULL,
    content TEXT NOT NULL,
    is_sticky BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMPTZ DEFAULT NOW(),
    last_reply_by TEXT REFERENCES users(id),
    tags JSONB, -- Array of topic tags
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum replies/posts
CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
    author_id TEXT REFERENCES users(id) NOT NULL,
    content TEXT NOT NULL,
    parent_post_id UUID REFERENCES forum_posts(id), -- For nested replies
    is_approved BOOLEAN DEFAULT TRUE,
    is_solution BOOLEAN DEFAULT FALSE, -- Mark as solution to topic
    like_count INTEGER DEFAULT 0,
    attachments JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Direct messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id TEXT REFERENCES users(id) NOT NULL,
    recipient_id TEXT REFERENCES users(id) NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_message_id UUID REFERENCES messages(id), -- For conversation threading
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    attachments JSONB,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'error', 'success', 'reminder')),
    category TEXT CHECK (category IN ('academic', 'financial', 'system', 'social', 'deadline')),
    action_url TEXT, -- Link to relevant page
    action_data JSONB, -- Additional data for the action
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    delivery_method JSONB DEFAULT '["web"]', -- ['web', 'email', 'sms', 'push']
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. ACTIVITY AND ACHIEVEMENT SYSTEM (Enhanced from original)
-- =============================================================================

-- Activity categories
CREATE TABLE activity_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    points_multiplier DECIMAL(3,2) DEFAULT 1.0,
    is_academic BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES activity_categories(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    activity_date DATE NOT NULL,
    duration_hours DECIMAL(5,2),
    location TEXT,
    organizer TEXT,
    supervisor_id TEXT REFERENCES users(id),
    
    -- Submission details
    evidence_files JSONB, -- Array of file URLs
    reflection_notes TEXT,
    learning_outcomes TEXT,
    skills_developed JSONB, -- Array of skills
    
    -- Review process
    status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'needs_revision')),
    submitted_at TIMESTAMPTZ,
    reviewed_by TEXT REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    reviewer_comments TEXT,
    revision_requested TEXT,
    
    -- Points and recognition
    points_awarded INTEGER DEFAULT 0,
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url TEXT,
    
    -- Metadata
    is_public BOOLEAN DEFAULT FALSE,
    tags JSONB,
    impact_statement TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievement badges
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    criteria JSONB, -- Requirements to earn the badge
    icon_url TEXT,
    badge_color TEXT,
    points_required INTEGER,
    activities_required INTEGER,
    category_requirements JSONB, -- Required categories and counts
    is_recurring BOOLEAN DEFAULT FALSE, -- Can be earned multiple times
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User earned badges
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    evidence_activity_id UUID REFERENCES activities(id),
    certificate_url TEXT,
    is_displayed BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, badge_id, earned_at)
);

-- =============================================================================
-- 9. SCHEDULING AND CALENDAR SYSTEM
-- =============================================================================

-- Calendar events
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT CHECK (event_type IN ('class', 'exam', 'meeting', 'deadline', 'holiday', 'event', 'maintenance')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    room_id UUID REFERENCES rooms(id),
    
    -- Ownership and visibility
    created_by TEXT REFERENCES users(id),
    institution_id UUID REFERENCES institutions(id),
    department_id UUID REFERENCES departments(id),
    course_section_id UUID REFERENCES course_sections(id),
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB, -- {type: 'weekly', days: ['MON', 'WED'], until: '2024-12-15'}
    parent_event_id UUID REFERENCES calendar_events(id),
    
    -- Attendance and participation
    requires_attendance BOOLEAN DEFAULT FALSE,
    max_participants INTEGER,
    registration_required BOOLEAN DEFAULT FALSE,
    registration_deadline TIMESTAMPTZ,
    
    -- Status and visibility
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled', 'postponed')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'department', 'course')),
    
    -- Notifications
    reminder_settings JSONB, -- When to send reminders
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event participants
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    participation_type TEXT CHECK (participation_type IN ('required', 'optional', 'invited', 'registered')),
    response_status TEXT CHECK (response_status IN ('pending', 'accepted', 'declined', 'tentative')),
    attended BOOLEAN,
    attendance_time TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Room bookings
CREATE TABLE room_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    booked_by TEXT REFERENCES users(id) NOT NULL,
    event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    purpose TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    expected_attendees INTEGER,
    setup_requirements TEXT,
    equipment_needed JSONB,
    catering_required BOOLEAN DEFAULT FALSE,
    
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by TEXT REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    special_instructions TEXT,
    contact_person TEXT,
    contact_phone TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 10. REPORTING AND ANALYTICS
-- =============================================================================

-- Saved reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('academic', 'financial', 'administrative', 'custom')),
    report_type TEXT CHECK (report_type IN ('student_grades', 'enrollment', 'attendance', 'financial', 'activity', 'user_analytics')),
    sql_query TEXT,
    parameters JSONB, -- Report parameters and filters
    created_by TEXT REFERENCES users(id),
    is_public BOOLEAN DEFAULT FALSE,
    scheduled_runs JSONB, -- Automatic generation schedule
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report generations/runs
CREATE TABLE report_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    generated_by TEXT REFERENCES users(id),
    parameters_used JSONB,
    file_url TEXT, -- Generated report file
    file_format TEXT CHECK (file_format IN ('pdf', 'excel', 'csv', 'json')),
    row_count INTEGER,
    generation_time_ms INTEGER,
    status TEXT CHECK (status IN ('generating', 'completed', 'failed')),
    error_message TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System metrics for monitoring
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,4),
    metric_unit TEXT,
    tags JSONB, -- Additional categorization
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    institution_id UUID REFERENCES institutions(id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- User management indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_institution_department ON users(institution_id, department_id);

-- Academic management indexes
CREATE INDEX idx_enrollments_student_period ON enrollments(student_id, course_section_id);
CREATE INDEX idx_course_sections_period ON course_sections(academic_period_id);
CREATE INDEX idx_course_sections_instructor ON course_sections(instructor_id);
CREATE INDEX idx_grades_enrollment ON grades(enrollment_id);
CREATE INDEX idx_transcripts_student_period ON transcripts(student_id, academic_period_id);

-- Financial indexes
CREATE INDEX idx_student_fees_student_period ON student_fees(student_id, academic_period_id);
CREATE INDEX idx_payments_student_date ON payments(student_id, payment_date);
CREATE INDEX idx_financial_aid_student ON financial_aid(student_id, academic_period_id);

-- Communication indexes
CREATE INDEX idx_messages_recipient_read ON messages(recipient_id, is_read);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_announcements_publication ON announcements(publication_date, is_published);

-- Activity indexes
CREATE INDEX idx_activities_student_status ON activities(student_id, status);
CREATE INDEX idx_activities_category_date ON activities(category_id, activity_date);

-- Calendar and booking indexes
CREATE INDEX idx_calendar_events_time ON calendar_events(start_time, end_time);
CREATE INDEX idx_room_bookings_room_time ON room_bookings(room_id, start_time, end_time);
CREATE INDEX idx_equipment_bookings_time ON equipment_bookings(equipment_id, start_time, end_time);

-- Audit and performance indexes
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user_time ON audit_log(user_id, created_at);
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, is_active);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_sections_updated_at BEFORE UPDATE ON course_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id::text, 'DELETE', to_jsonb(OLD), current_setting('app.current_user_id', true));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id::text, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id', true));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id::text, 'INSERT', to_jsonb(NEW), current_setting('app.current_user_id', true));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_enrollments AFTER INSERT OR UPDATE OR DELETE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_grades AFTER INSERT OR UPDATE OR DELETE ON grades
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function to calculate GPA
CREATE OR REPLACE FUNCTION calculate_gpa(student_user_id TEXT, period_id UUID DEFAULT NULL)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    total_points DECIMAL(10,2) := 0;
    total_credits DECIMAL(6,1) := 0;
    gpa_result DECIMAL(3,2);
BEGIN
    SELECT 
        COALESCE(SUM(e.grade_points * c.credits), 0),
        COALESCE(SUM(c.credits), 0)
    INTO total_points, total_credits
    FROM enrollments e
    JOIN course_sections cs ON e.course_section_id = cs.id
    JOIN courses c ON cs.course_id = c.id
    WHERE e.student_id = student_user_id
    AND e.enrollment_status = 'completed'
    AND e.grade_points IS NOT NULL
    AND (period_id IS NULL OR cs.academic_period_id = period_id);
    
    IF total_credits > 0 THEN
        gpa_result := total_points / total_credits;
    ELSE
        gpa_result := 0;
    END IF;
    
    RETURN ROUND(gpa_result, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update enrollment count in course sections
CREATE OR REPLACE FUNCTION update_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.enrollment_status = 'enrolled' THEN
        UPDATE course_sections 
        SET current_enrollment = current_enrollment + 1
        WHERE id = NEW.course_section_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.enrollment_status = 'enrolled' AND NEW.enrollment_status != 'enrolled' THEN
            UPDATE course_sections 
            SET current_enrollment = current_enrollment - 1
            WHERE id = NEW.course_section_id;
        ELSIF OLD.enrollment_status != 'enrolled' AND NEW.enrollment_status = 'enrolled' THEN
            UPDATE course_sections 
            SET current_enrollment = current_enrollment + 1
            WHERE id = NEW.course_section_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.enrollment_status = 'enrolled' THEN
        UPDATE course_sections 
        SET current_enrollment = current_enrollment - 1
        WHERE id = OLD.course_section_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollment_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_enrollment_count();

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_loans ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "users_select_own_or_admin" ON users
    FOR SELECT USING (
        id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'superadmin', 'faculty')
        )
    );

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid()::text);

-- Enrollments policies
CREATE POLICY "enrollments_select" ON enrollments
    FOR SELECT USING (
        student_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'superadmin', 'faculty')
        ) OR
        EXISTS (
            SELECT 1 FROM course_sections cs
            WHERE cs.id = course_section_id
            AND cs.instructor_id = auth.uid()::text
        )
    );

-- Activities policies (enhanced from original)
CREATE POLICY "activities_select" ON activities
    FOR SELECT USING (
        student_id = auth.uid()::text OR
        supervisor_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN ('faculty', 'admin', 'superadmin')
        )
    );

CREATE POLICY "activities_insert" ON activities
    FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "activities_update_own" ON activities
    FOR UPDATE USING (
        (student_id = auth.uid()::text AND status IN ('draft', 'needs_revision')) OR
        (supervisor_id = auth.uid()::text) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN ('faculty', 'admin', 'superadmin')
        )
    );

-- Messages policies
CREATE POLICY "messages_select" ON messages
    FOR SELECT USING (
        sender_id = auth.uid()::text OR 
        recipient_id = auth.uid()::text
    );

CREATE POLICY "messages_insert" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid()::text);

-- Notifications policies
CREATE POLICY "notifications_select" ON notifications
    FOR SELECT USING (user_id = auth.uid()::text);

-- =============================================================================
-- INITIAL SYSTEM DATA
-- =============================================================================

-- Insert default institution
INSERT INTO institutions (id, name, short_name, code, type, is_active) 
VALUES (
    uuid_generate_v4(),
    'Lumen Educational Institution',
    'Lumen',
    'LMN',
    'university',
    true
) ON CONFLICT DO NOTHING;

-- Insert default activity categories
INSERT INTO activity_categories (name, description, is_academic, requires_approval) VALUES
    ('Academic Excellence', 'Activities related to academic achievements and learning', true, true),
    ('Community Service', 'Volunteer work and community engagement activities', false, true),
    ('Leadership', 'Leadership roles and responsibilities', false, true),
    ('Sports & Recreation', 'Athletic activities and sports participation', false, true),
    ('Arts & Culture', 'Creative and cultural activities', false, true),
    ('Research', 'Research projects and scholarly activities', true, true),
    ('Professional Development', 'Career-related activities and skill building', false, true),
    ('Innovation & Technology', 'Technology projects and innovation activities', true, true);

-- Insert default badges
INSERT INTO badges (name, description, points_required, activities_required, is_active) VALUES
    ('First Step', 'Submitted your first activity', 0, 1, true),
    ('Active Learner', 'Completed 5 activities', 100, 5, true),
    ('Community Champion', 'Completed 10 community service activities', 200, 10, true),
    ('Academic Star', 'Maintained high academic performance', 300, 0, true),
    ('Leadership Excellence', 'Demonstrated exceptional leadership', 500, 15, true);

-- Insert default system roles
INSERT INTO roles (name, description, is_system_role, permissions) VALUES
    ('Student', 'Standard student role', true, '["view_own_data", "submit_activities", "access_courses"]'),
    ('Faculty', 'Faculty member role', true, '["view_students", "grade_activities", "manage_courses"]'),
    ('Staff', 'Administrative staff role', true, '["view_reports", "manage_users", "access_admin_tools"]'),
    ('Admin', 'System administrator role', true, '["full_access", "manage_system", "view_all_data"]'),
    ('SuperAdmin', 'Super administrator role', true, '["full_access", "manage_system", "manage_institutions"]');

-- Insert default fee types
INSERT INTO fee_types (institution_id, name, category, amount, is_mandatory) VALUES
    ((SELECT id FROM institutions LIMIT 1), 'Tuition Fee', 'tuition', 5000.00, true),
    ((SELECT id FROM institutions LIMIT 1), 'Library Fee', 'library', 100.00, true),
    ((SELECT id FROM institutions LIMIT 1), 'Technology Fee', 'technology', 200.00, true),
    ((SELECT id FROM institutions LIMIT 1), 'Student Activity Fee', 'activity', 150.00, true),
    ((SELECT id FROM institutions LIMIT 1), 'Laboratory Fee', 'lab', 300.00, false);

-- Insert sample system settings
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
    ('academic_year_start', '"2024-09-01"', 'Start of academic year', 'academic', true),
    ('grading_scale', '{"A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0}', 'Grade point values', 'academic', true),
    ('max_credits_per_semester', '18', 'Maximum credits a student can enroll in per semester', 'academic', true),
    ('late_fee_per_day', '5.00', 'Daily late fee for overdue payments', 'financial', true),
    ('system_maintenance_mode', 'false', 'Enable maintenance mode', 'system', false);

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Student dashboard view
CREATE VIEW student_dashboard AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.student_id,
    COUNT(DISTINCT e.id) as total_courses,
    COUNT(DISTINCT a.id) as total_activities,
    COALESCE(SUM(CASE WHEN a.status = 'approved' THEN a.points_awarded ELSE 0 END), 0) as total_points,
    calculate_gpa(u.id) as current_gpa
FROM users u
LEFT JOIN enrollments e ON u.id = e.student_id AND e.enrollment_status = 'enrolled'
LEFT JOIN activities a ON u.id = a.student_id
WHERE u.role = 'student' AND u.status = 'active'
GROUP BY u.id, u.first_name, u.last_name, u.student_id;

-- Course enrollment summary
CREATE VIEW course_enrollment_summary AS
SELECT 
    c.code,
    c.name,
    cs.section_number,
    ap.name as academic_period,
    cs.max_enrollment,
    cs.current_enrollment,
    u.first_name || ' ' || u.last_name as instructor_name,
    r.room_number || ' (' || b.name || ')' as room_location
FROM course_sections cs
JOIN courses c ON cs.course_id = c.id
JOIN academic_periods ap ON cs.academic_period_id = ap.id
LEFT JOIN users u ON cs.instructor_id = u.id
LEFT JOIN rooms r ON cs.room_id = r.id
LEFT JOIN buildings b ON r.building_id = b.id
WHERE cs.status = 'active';

-- Financial summary per student
CREATE VIEW student_financial_summary AS
SELECT 
    u.id,
    u.first_name || ' ' || u.last_name as student_name,
    u.student_id,
    COALESCE(SUM(sf.amount), 0) as total_fees,
    COALESCE(SUM(pa.amount_allocated), 0) as total_paid,
    COALESCE(SUM(sf.amount), 0) - COALESCE(SUM(pa.amount_allocated), 0) as balance_due
FROM users u
LEFT JOIN student_fees sf ON u.id = sf.student_id
LEFT JOIN payment_allocations pa ON sf.id = pa.student_fee_id
WHERE u.role = 'student'
GROUP BY u.id, u.first_name, u.last_name, u.student_id;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Add a record to track schema installation
INSERT INTO system_settings (key, value, description, category) 
VALUES ('schema_version', '"1.0.0"', 'Current database schema version', 'system')
ON CONFLICT (key) DO UPDATE SET value = '"1.0.0"', updated_at = NOW();

-- Schema creation completed successfully
SELECT 'Comprehensive LMS/ERP Database Schema Created Successfully!' as message;