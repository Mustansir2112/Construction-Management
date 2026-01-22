-- Create missing tables for inventory management system

-- Create inventory table if it doesn't exist
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

-- Create movements table if it doesn't exist
CREATE TABLE IF NOT EXISTS movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  from_zone TEXT NOT NULL,
  to_zone TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  risk_level TEXT,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table if it doesn't exist
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  level TEXT NOT NULL,
  related_item_id UUID REFERENCES inventory(id),
  related_worker_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Anyone can view inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can manage inventory" ON inventory FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can view movements" ON movements FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can create movements" ON movements FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Anyone can view alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "System can create alerts" ON alerts FOR INSERT WITH CHECK (true);