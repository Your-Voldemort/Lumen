-- =============================================================================
-- COMPREHENSIVE LMS/ERP MIGRATION FOR LUMEN PROJECT (SUPABASE)
-- This migration extends the existing schema with enterprise-grade functionality
-- =============================================================================

-- First, create any missing extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. ORGANIZATIONAL STRUCTURE
-- =============================================================================

-- Educational institutions (for multi-tenant support)
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    code TEXT UNIQUE,
    type TEXT CHECK (type IN ('university', 'college', 'school', 'institute')),
    address JSONB,
    contact_info JSONB,
    logo_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    head_of_department_id TEXT,
    budget_allocation DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

-- Buildings and facilities
CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    address JSONB,
    building_type TEXT CHECK (building_type IN ('academic', 'administrative', 'residential', 'sports', 'library')),
    facilities JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms within buildings
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    name TEXT,
    capacity INTEGER,
    room_type TEXT CHECK (room_type IN ('classroom', 'laboratory', 'office', 'auditorium', 'library')),
    equipment JSONB,
    is_accessible BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(building_id, room_number)
);

-- =============================================================================
-- 2. ENHANCE EXISTING USER SYSTEM
-- =============================================================================

-- Add new columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB;

-- Enhanced roles system
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    assigned_by TEXT REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_name)
);

-- =============================================================================
-- 3. ACADEMIC MANAGEMENT SYSTEM
-- =============================================================================

-- Academic periods (semesters, quarters, etc.)
CREATE TABLE IF NOT EXISTS academic_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('semester', 'quarter', 'trimester', 'year')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_start_date DATE,
    registration_end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Academic programs
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT CHECK (type IN ('bachelor', 'master', 'doctoral', 'certificate')),
    description TEXT,
    duration_years DECIMAL(3,1),
    total_credits_required INTEGER,
    minimum_gpa DECIMAL(3,2),
    tuition_fee DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

-- Enhanced courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    level TEXT CHECK (level IN ('100', '200', '300', '400', '500', '600')),
    prerequisites JSONB,
    learning_outcomes JSONB,
    course_type TEXT CHECK (course_type IN ('core', 'elective', 'major_required')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, code)
);

-- Course sections
CREATE TABLE IF NOT EXISTS course_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    academic_period_id UUID REFERENCES academic_periods(id) ON DELETE CASCADE,
    section_number TEXT NOT NULL,
    instructor_id TEXT REFERENCES users(id),
    max_enrollment INTEGER,
    current_enrollment INTEGER DEFAULT 0,
    schedule JSONB,
    room_id UUID REFERENCES rooms(id),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, academic_period_id, section_number)
);

-- Student enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    course_section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
    enrollment_status TEXT DEFAULT 'enrolled' CHECK (enrollment_status IN ('enrolled', 'dropped', 'withdrawn', 'completed')),
    enrollment_date TIMESTAMPTZ DEFAULT NOW(),
    grade_letter TEXT CHECK (grade_letter IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F')),
    grade_points DECIMAL(3,2),
    credits_earned DECIMAL(3,1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_section_id)
);

-- Assignments and grading
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_section_id UUID REFERENCES course_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignment_type TEXT CHECK (assignment_type IN ('homework', 'quiz', 'midterm', 'final', 'project')),
    max_points DECIMAL(8,2) NOT NULL,
    due_date TIMESTAMPTZ,
    instructions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student grades for assignments
CREATE TABLE IF NOT EXISTS student_grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    points_earned DECIMAL(8,2),
    submission_date TIMESTAMPTZ,
    graded_date TIMESTAMPTZ,
    feedback TEXT,
    is_late BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(enrollment_id, assignment_id)
);

-- Academic transcripts
CREATE TABLE IF NOT EXISTS transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    academic_period_id UUID REFERENCES academic_periods(id) ON DELETE CASCADE,
    total_credits_attempted DECIMAL(5,1) DEFAULT 0,
    total_credits_earned DECIMAL(5,1) DEFAULT 0,
    gpa DECIMAL(3,2) DEFAULT 0,
    cumulative_gpa DECIMAL(3,2) DEFAULT 0,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    is_official BOOLEAN DEFAULT FALSE
);

-- =============================================================================
-- 4. FINANCIAL MANAGEMENT SYSTEM
-- =============================================================================

-- Fee types
CREATE TABLE IF NOT EXISTS fee_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('tuition', 'lab', 'library', 'technology', 'activity')),
    amount DECIMAL(15,2) NOT NULL,
    is_per_credit BOOLEAN DEFAULT FALSE,
    is_mandatory BOOLEAN DEFAULT TRUE,
    effective_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student fee assessments
CREATE TABLE IF NOT EXISTS student_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    academic_period_id UUID REFERENCES academic_periods(id) ON DELETE CASCADE,
    fee_type_id UUID REFERENCES fee_types(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'waived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'check', 'credit_card', 'online')),
    payment_reference TEXT,
    payment_date TIMESTAMPTZ NOT NULL,
    processed_by TEXT REFERENCES users(id),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial aid
CREATE TABLE IF NOT EXISTS financial_aid (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    academic_period_id UUID REFERENCES academic_periods(id) ON DELETE CASCADE,
    aid_type TEXT CHECK (aid_type IN ('scholarship', 'grant', 'loan', 'work_study')),
    source TEXT,
    amount DECIMAL(15,2) NOT NULL,
    status TEXT DEFAULT 'awarded' CHECK (status IN ('applied', 'awarded', 'disbursed')),
    awarded_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. ENHANCED ACTIVITY SYSTEM
-- =============================================================================

-- Activity categories (enhance existing system)
CREATE TABLE IF NOT EXISTS activity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    points_multiplier DECIMAL(3,2) DEFAULT 1.0,
    requires_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhance existing activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES activity_categories(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(5,2);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS supervisor_id TEXT REFERENCES users(id);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS points_awarded INTEGER DEFAULT 0;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS evidence_files JSONB;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS skills_developed JSONB;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS impact_statement TEXT;

-- Achievement badges
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    criteria JSONB,
    icon_url TEXT,
    points_required INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User earned badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    evidence_activity_id UUID REFERENCES activities(id),
    UNIQUE(user_id, badge_id, earned_at)
);

-- =============================================================================
-- 6. COMMUNICATION SYSTEM
-- =============================================================================

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT REFERENCES users(id) NOT NULL,
    target_audience JSONB,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    publication_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages between users
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT REFERENCES users(id) NOT NULL,
    recipient_id TEXT REFERENCES users(id) NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. LIBRARY AND RESOURCES
-- =============================================================================

-- Library resources
CREATE TABLE IF NOT EXISTS library_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    resource_type TEXT CHECK (resource_type IN ('book', 'journal', 'digital', 'reference')),
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library loans
CREATE TABLE IF NOT EXISTS library_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES library_resources(id) ON DELETE CASCADE,
    borrower_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    checkout_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. CALENDAR AND EVENTS
-- =============================================================================

-- Calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT CHECK (event_type IN ('class', 'exam', 'meeting', 'deadline', 'event')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    created_by TEXT REFERENCES users(id),
    course_section_id UUID REFERENCES course_sections(id),
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room bookings
CREATE TABLE IF NOT EXISTS room_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    booked_by TEXT REFERENCES users(id) NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    purpose TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. SYSTEM CONFIGURATION
-- =============================================================================

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 10. PERFORMANCE INDEXES
-- =============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Academic indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_section ON enrollments(course_section_id);
CREATE INDEX IF NOT EXISTS idx_course_sections_instructor ON course_sections(instructor_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_enrollment ON student_grades(enrollment_id);

-- Financial indexes
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_student ON student_fees(student_id);

-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_activities_student ON activities(student_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);

-- Communication indexes
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- =============================================================================
-- 11. UPDATED FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to calculate GPA
CREATE OR REPLACE FUNCTION calculate_student_gpa(student_user_id TEXT)
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
    AND e.grade_points IS NOT NULL;
    
    IF total_credits > 0 THEN
        gpa_result := total_points / total_credits;
    ELSE
        gpa_result := 0;
    END IF;
    
    RETURN ROUND(gpa_result, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update enrollment count
CREATE OR REPLACE FUNCTION update_section_enrollment()
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

-- Create trigger for enrollment count
DROP TRIGGER IF EXISTS enrollment_count_trigger ON enrollments;
CREATE TRIGGER enrollment_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_section_enrollment();

-- =============================================================================
-- 12. ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Update user policies (replace existing ones)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "users_view_policy" ON users
    FOR SELECT USING (
        id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN ('faculty', 'admin', 'superadmin')
        )
    );

CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING (id = auth.uid()::text);

-- Enrollment policies
CREATE POLICY "enrollments_view_policy" ON enrollments
    FOR SELECT USING (
        student_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN ('faculty', 'admin', 'superadmin')
        ) OR
        EXISTS (
            SELECT 1 FROM course_sections cs
            WHERE cs.id = course_section_id
            AND cs.instructor_id = auth.uid()::text
        )
    );

-- Enhanced activity policies (replace existing ones)
DROP POLICY IF EXISTS "Students can view own activities" ON activities;
DROP POLICY IF EXISTS "Students can create activities" ON activities;
DROP POLICY IF EXISTS "Students can update own pending activities" ON activities;
DROP POLICY IF EXISTS "Faculty can update activity status" ON activities;

CREATE POLICY "activities_view_policy" ON activities
    FOR SELECT USING (
        student_id = auth.uid()::text OR
        supervisor_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN ('faculty', 'admin', 'superadmin')
        )
    );

CREATE POLICY "activities_insert_policy" ON activities
    FOR INSERT WITH CHECK (student_id = auth.uid()::text);

CREATE POLICY "activities_update_policy" ON activities
    FOR UPDATE USING (
        (student_id = auth.uid()::text AND status = 'pending') OR
        (supervisor_id = auth.uid()::text) OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN ('faculty', 'admin', 'superadmin')
        )
    );

-- Messages policies
CREATE POLICY "messages_view_policy" ON messages
    FOR SELECT USING (
        sender_id = auth.uid()::text OR 
        recipient_id = auth.uid()::text
    );

CREATE POLICY "messages_insert_policy" ON messages
    FOR INSERT WITH CHECK (sender_id = auth.uid()::text);

-- Notifications policies
CREATE POLICY "notifications_view_policy" ON notifications
    FOR SELECT USING (user_id = auth.uid()::text);

-- Student fees policies
CREATE POLICY "student_fees_view_policy" ON student_fees
    FOR SELECT USING (
        student_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role IN ('admin', 'superadmin')
        )
    );

-- =============================================================================
-- 13. INITIAL DATA SETUP
-- =============================================================================

-- Insert default institution
INSERT INTO institutions (name, short_name, code, type) 
VALUES ('Lumen Educational Institution', 'Lumen', 'LMN', 'university')
ON CONFLICT DO NOTHING;

-- Insert default activity categories
INSERT INTO activity_categories (name, description, requires_approval) VALUES
    ('Academic Excellence', 'Academic achievements and learning activities', true),
    ('Community Service', 'Volunteer work and community engagement', true),
    ('Leadership', 'Leadership roles and responsibilities', true),
    ('Sports & Recreation', 'Athletic and recreational activities', true),
    ('Arts & Culture', 'Creative and cultural activities', true),
    ('Research', 'Research projects and scholarly work', true)
ON CONFLICT DO NOTHING;

-- Insert default badges
INSERT INTO badges (name, description, points_required) VALUES
    ('First Step', 'Submitted your first activity', 0),
    ('Active Learner', 'Completed 5 activities', 100),
    ('Community Champion', 'Strong community service record', 200),
    ('Academic Star', 'Excellent academic performance', 300),
    ('Leadership Excellence', 'Outstanding leadership qualities', 500)
ON CONFLICT DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
    ('academic_year', '"2024-2025"', 'Current academic year'),
    ('semester_system', 'true', 'Use semester system'),
    ('grading_scale', '{"A": 4.0, "B": 3.0, "C": 2.0, "D": 1.0, "F": 0.0}', 'Grade point values'),
    ('max_enrollment_per_section', '30', 'Default maximum enrollment per course section')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- =============================================================================
-- 14. USEFUL VIEWS
-- =============================================================================

-- Student dashboard view
CREATE OR REPLACE VIEW student_dashboard AS
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.student_id,
    COUNT(DISTINCT e.id) as enrolled_courses,
    COUNT(DISTINCT a.id) as total_activities,
    COALESCE(SUM(CASE WHEN a.status = 'approved' THEN a.points_awarded ELSE 0 END), 0) as activity_points,
    calculate_student_gpa(u.id) as current_gpa
FROM users u
LEFT JOIN enrollments e ON u.id = e.student_id AND e.enrollment_status = 'enrolled'
LEFT JOIN activities a ON u.id = a.student_id
WHERE u.role = 'student'
GROUP BY u.id, u.first_name, u.last_name, u.student_id;

-- Course enrollment summary
CREATE OR REPLACE VIEW course_enrollment_summary AS
SELECT 
    c.code,
    c.name,
    cs.section_number,
    ap.name as semester,
    cs.max_enrollment,
    cs.current_enrollment,
    u.first_name || ' ' || u.last_name as instructor
FROM course_sections cs
JOIN courses c ON cs.course_id = c.id
JOIN academic_periods ap ON cs.academic_period_id = ap.id
LEFT JOIN users u ON cs.instructor_id = u.id;

-- =============================================================================
-- COMPLETION
-- =============================================================================

-- Update schema version
INSERT INTO system_settings (key, value, description) 
VALUES ('schema_version', '"2.0.0"', 'Enhanced LMS/ERP schema version')
ON CONFLICT (key) DO UPDATE SET value = '"2.0.0"';

SELECT 'Enhanced LMS/ERP Database Migration Completed Successfully!' as status;