-- Essential tables setup for Construction Management App
-- Run this SQL in your Supabase SQL Editor

-- Create user_roles table (essential for authentication)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'worker',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'worker',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance_requests table
CREATE TABLE IF NOT EXISTS attendance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL,
    worker_name VARCHAR(255) NOT NULL,
    worker_email VARCHAR(255) NOT NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    is_within_zone BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_attendance table
CREATE TABLE IF NOT EXISTS daily_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attendance_date DATE NOT NULL,
    present_worker_ids UUID[] NOT NULL DEFAULT '{}',
    total_workers_present INTEGER DEFAULT 0,
    marked_by UUID NOT NULL,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attendance_date)
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  item_id TEXT NOT NULL UNIQUE,
  zone TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create movements table
CREATE TABLE IF NOT EXISTS movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  from_zone TEXT NOT NULL,
  to_zone TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  risk_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dprs table
CREATE TABLE IF NOT EXISTS dprs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  work_done TEXT NOT NULL,
  labor_count INTEGER DEFAULT 0,
  materials_used TEXT,
  issues TEXT,
  photos TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  full_text TEXT,
  short_summary TEXT,
  created_by UUID,
  project TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_attendance_requests_updated_at 
    BEFORE UPDATE ON attendance_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_daily_attendance_updated_at 
    BEFORE UPDATE ON daily_attendance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_dprs_updated_at 
    BEFORE UPDATE ON dprs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE dprs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view own role" ON user_roles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Anyone can view attendance requests" ON attendance_requests
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Workers can insert their own requests" ON attendance_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Engineers can update attendance requests" ON attendance_requests
    FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Engineers can manage daily attendance" ON daily_attendance
    FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can view inventory" ON inventory 
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can manage inventory" ON inventory 
    FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can view movements" ON movements 
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can create movements" ON movements 
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can view dprs" ON dprs 
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can create dprs" ON dprs 
    FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can update dprs" ON dprs 
    FOR UPDATE USING (true);

-- Insert sample data for testing
INSERT INTO user_roles (id, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'manager'),
  ('00000000-0000-0000-0000-000000000002', 'engineer'),
  ('00000000-0000-0000-0000-000000000003', 'worker')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, full_name, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'manager@test.com', 'Test Manager', 'manager'),
  ('00000000-0000-0000-0000-000000000002', 'engineer@test.com', 'Test Engineer', 'engineer'),
  ('00000000-0000-0000-0000-000000000003', 'worker@test.com', 'Test Worker', 'worker')
ON CONFLICT (id) DO NOTHING;