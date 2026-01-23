-- Fix Database Schema - Run this in Supabase SQL Editor
-- This script fixes the missing columns and tables causing DPR and attendance errors

-- 1. Ensure dprs table has all required columns
DO $ 
BEGIN
  -- Add full_text column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dprs' AND column_name = 'full_text'
  ) THEN
    ALTER TABLE dprs ADD COLUMN full_text TEXT;
  END IF;

  -- Add short_summary column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dprs' AND column_name = 'short_summary'
  ) THEN
    ALTER TABLE dprs ADD COLUMN short_summary TEXT;
  END IF;

  -- Add created_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dprs' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE dprs ADD COLUMN created_by UUID;
  END IF;

  -- Add project column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dprs' AND column_name = 'project'
  ) THEN
    ALTER TABLE dprs ADD COLUMN project TEXT;
  END IF;

  -- Add photos column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dprs' AND column_name = 'photos'
  ) THEN
    ALTER TABLE dprs ADD COLUMN photos TEXT[] DEFAULT '{}';
  END IF;

  -- Add videos column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dprs' AND column_name = 'videos'
  ) THEN
    ALTER TABLE dprs ADD COLUMN videos TEXT[] DEFAULT '{}';
  END IF;
END $;

-- 2. Create dprs table if it doesn't exist at all
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

-- 3. Ensure attendance_requests table exists
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

-- 4. Enable RLS on dprs table
ALTER TABLE dprs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for dprs
DO $ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dprs' AND policyname = 'Anyone can view dprs') THEN
    CREATE POLICY "Anyone can view dprs" ON dprs FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dprs' AND policyname = 'Anyone can create dprs') THEN
    CREATE POLICY "Anyone can create dprs" ON dprs FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dprs' AND policyname = 'Anyone can update dprs') THEN
    CREATE POLICY "Anyone can update dprs" ON dprs FOR UPDATE USING (true);
  END IF;
END $;

-- 6. Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- 7. Create trigger for dprs updated_at
DO $ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dprs_updated_at') THEN
    CREATE TRIGGER update_dprs_updated_at 
      BEFORE UPDATE ON dprs 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $;

-- 8. Add some test data
INSERT INTO attendance_requests (worker_id, worker_name, worker_email, location_lat, location_lng, is_within_zone, status) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Test Worker', 'worker@test.com', 19.213585, 72.865429, true, 'pending'),
  ('worker1', 'John Doe', 'john@example.com', 19.213585, 72.865429, true, 'approved'),
  ('worker2', 'Jane Smith', 'jane@example.com', 19.214000, 72.866000, false, 'pending')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database schema fixed successfully! DPR creation and attendance requests should now work.' as status;