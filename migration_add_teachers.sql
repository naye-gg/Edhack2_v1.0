-- Migration script to add teacher authentication system
-- This script should be run on the existing SQLite database

-- Add teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    school TEXT,
    grade TEXT,
    subject TEXT,
    phone_number TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT,
    updated_at TEXT,
    last_login TEXT
);

-- Add teacherId column to existing students table
-- Note: This will require handling existing data
-- For now, we'll add the column as optional and will need to assign teachers to existing students

-- First, let's check if the column already exists
-- If not, add it
ALTER TABLE students ADD COLUMN teacher_id TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);

-- Insert a default teacher for existing students (optional)
-- This would need to be customized based on your needs
INSERT OR IGNORE INTO teachers (
    id, email, password, name, last_name, school, grade, subject, 
    is_active, created_at, updated_at
) VALUES (
    'default_teacher_001',
    'profesor@demo.com',
    'demo123',  -- In production, this should be hashed
    'Profesor',
    'Demo',
    'Escuela Demo',
    'Varios',
    'Educación General',
    1,
    datetime('now'),
    datetime('now')
);

-- Update existing students to have the default teacher
-- Remove this if you want to assign teachers manually
UPDATE students 
SET teacher_id = 'default_teacher_001' 
WHERE teacher_id IS NULL;
