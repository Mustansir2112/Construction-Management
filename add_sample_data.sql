-- Add sample data for testing the dashboard components
-- Run this in your Supabase SQL Editor after running the main setup

-- Sample inventory items
INSERT INTO inventory (item_name, item_id, zone, quantity, min_stock) VALUES
  ('Cement Bags', 'CEM001', 'Storage A', 150, 50),
  ('Steel Rods', 'STL001', 'Storage B', 200, 30),
  ('Bricks', 'BRK001', 'Yard 1', 5000, 1000),
  ('Sand (Cubic Meters)', 'SND001', 'Yard 2', 25, 10),
  ('Concrete Mixer', 'MIX001', 'Equipment', 3, 1),
  ('Safety Helmets', 'HLM001', 'Safety Store', 45, 20),
  ('Wooden Planks', 'WOD001', 'Storage C', 80, 25),
  ('Paint Buckets', 'PNT001', 'Storage A', 12, 5)
ON CONFLICT (item_id) DO NOTHING;

-- Sample movements
INSERT INTO movements (worker_id, item_id, from_zone, to_zone, approved, risk_level) VALUES
  ('worker1', 'CEM001', 'Storage A', 'Site 1', true, 'low'),
  ('worker2', 'STL001', 'Storage B', 'Site 1', false, 'medium'),
  ('worker1', 'BRK001', 'Yard 1', 'Site 2', true, 'low'),
  ('worker3', 'SND001', 'Yard 2', 'Site 1', false, 'low'),
  ('worker2', 'MIX001', 'Equipment', 'Site 2', true, 'high'),
  ('worker1', 'HLM001', 'Safety Store', 'Site 1', true, 'low')
ON CONFLICT DO NOTHING;

-- Sample DPRs (if dprs table exists)
INSERT INTO dprs (date, work_done, labor_count, materials_used, issues, created_by, full_text, short_summary) VALUES
  (CURRENT_DATE, 'Foundation work completed for Block A. Concrete pouring done.', 8, 'Cement: 50 bags, Steel: 20 rods', NULL, '00000000-0000-0000-0000-000000000003', 'Foundation work completed for Block A. Concrete pouring done. The team worked efficiently to complete the foundation within the scheduled timeframe.', 'Foundation work completed for Block A'),
  (CURRENT_DATE - INTERVAL '1 day', 'Brick laying started for walls. Safety inspection passed.', 6, 'Bricks: 500 units, Cement: 20 bags', 'Minor delay due to weather', '00000000-0000-0000-0000-000000000003', 'Brick laying started for walls. Safety inspection passed. Weather caused minor delays but overall progress is on track.', 'Brick laying started for walls'),
  (CURRENT_DATE - INTERVAL '2 days', 'Site preparation and marking completed.', 4, 'Sand: 5 cubic meters, Wooden planks: 20 units', NULL, '00000000-0000-0000-0000-000000000003', 'Site preparation and marking completed. All measurements verified and site is ready for construction work.', 'Site preparation and marking completed')
ON CONFLICT DO NOTHING;

-- Sample attendance requests
INSERT INTO attendance_requests (worker_id, worker_name, worker_email, location_lat, location_lng, is_within_zone, status) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Test Worker', 'worker@test.com', 19.213585, 72.865429, true, 'pending'),
  ('worker1', 'John Doe', 'john@example.com', 19.213585, 72.865429, true, 'approved'),
  ('worker2', 'Jane Smith', 'jane@example.com', 19.214000, 72.866000, false, 'pending')
ON CONFLICT DO NOTHING;