# Production-Ready Checklist

## ✅ Completed Features

### 1. DPR System
- ✅ Worker can CREATE DPR from dashboard (collapsible form)
- ✅ Auto-assigns project_id from worker's project_assignments
- ✅ Stores created_by = authenticated worker id
- ✅ Voice recording (Hindi) → text conversion
- ✅ Automatic text summarization
- ✅ Photo upload (max 30MB) to `dpr` bucket
- ✅ Video upload (max 30MB) to `dpr` bucket
- ✅ Manager can VIEW DPRs (read-only, no edit)
- ✅ Media display (photos/videos) in DPR view dialog
- ✅ Integrated into manager dashboard

### 2. Kanban Board
- ✅ Integrated with database (`kanban` table)
- ✅ Global tasks (all managers see all)
- ✅ CREATE task with description, priority, state
- ✅ Drag & drop updates state in database
- ✅ DELETE task option
- ✅ Real-time sync with Supabase

### 3. Worker Creation
- ✅ Manager can create workers via "Add Workers" page
- ✅ Uses Supabase Service Role API key (server-side only)
- ✅ Inserts role = "worker" in `user_roles` table
- ✅ Secure - service key never exposed to frontend

### 4. Attendance System
- ✅ Connected to real `attendance` table
- ✅ Displays: w_id, w_name, w_status, date
- ✅ Filters by date range (today, week, month, custom)
- ✅ Filters by worker name and status
- ✅ Summary statistics (total, present, absent)
- ✅ Ready for GPS auto-marking (currently displays from DB)

### 5. Sidebar & Navigation
- ✅ Role-based sidebar (ResponsiveSidebar component)
- ✅ Manager sidebar: Dashboard, GST Invoice, Add Workers, Inventory, Movements
- ✅ Worker sidebar: Worker Dashboard, Inventory, Movements
- ✅ Hamburger menu for mobile/PWA
- ✅ Route protection via middleware
- ✅ Auto-closes on mobile after navigation

### 6. GST Invoice Generator
- ✅ Form to input invoice data
- ✅ Fetch inventory items and map to invoice items
- ✅ Manual item entry with HSN, qty, unit, rate, tax%
- ✅ Generate PDF using Puppeteer
- ✅ Store PDF in `Invoices` bucket
- ✅ Store metadata in `invoices` table
- ✅ View past invoices from storage
- ✅ Download invoices

### 7. Movements & Inventory
- ✅ Movement approvals update inventory quantities
- ✅ Zone transfers reflect correctly
- ✅ Manager can approve/reject movements
- ✅ Low stock alerts using min_stock and alerts table
- ✅ Real-time updates via Supabase subscriptions

### 8. Security & RLS
- ✅ RLS policies for all tables
- ✅ Workers see own DPRs, managers see all
- ✅ Service role usage is server-side only
- ✅ File type and size validation
- ✅ Route protection in middleware

## 📋 Database Migrations to Run

Run these migrations in order:

```bash
npm run supabase:push
```

Or manually:
1. `006_fix_dprs_add_project_created_by.sql` - Adds project_id and created_by to dprs
2. `007_create_kanban_table.sql` - Creates kanban table
3. `008_create_invoice_metadata_table.sql` - Creates invoices metadata table
4. `009_add_rls_policies.sql` - Comprehensive RLS policies

## 🗄️ Storage Buckets Required

Create these buckets in Supabase Dashboard > Storage:

1. **dpr** (public)
   - Folders: `photos/`, `videos/`
   - For DPR media files

2. **Invoices** (public)
   - For generated GST invoice PDFs

3. **kanban** (public, optional)
   - For task attachments if needed

4. **videos** (public)
   - For worker video uploads

## 🔧 Environment Variables

Ensure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🚀 Testing Checklist

### DPR System
- [ ] Worker can create DPR with voice/text
- [ ] Photos upload successfully
- [ ] Videos upload successfully
- [ ] Manager can view DPRs with media
- [ ] Project auto-assignment works

### Kanban
- [ ] Create task works
- [ ] Drag-drop updates database
- [ ] Delete task works
- [ ] Tasks visible to all managers

### Attendance
- [ ] Attendance records display from DB
- [ ] Filters work correctly
- [ ] Date range selection works

### Invoice
- [ ] Form validation works
- [ ] Inventory items can be added
- [ ] PDF generates correctly
- [ ] Metadata stored in DB
- [ ] Past invoices load

### Security
- [ ] Workers cannot access manager routes
- [ ] Managers cannot access worker routes
- [ ] RLS policies enforce data access

## 🐛 Known Issues / Notes

1. **Invoice Date Format**: Currently uses "15 Sep 2024" format. May need adjustment for date parsing.

2. **DPR Media Display**: If media doesn't load, check bucket permissions and CORS settings.

3. **Kanban Priority**: Uses 1-5 scale (1=Critical, 5=Minimal)

4. **Attendance w_id**: Currently uses text field. If you want UUID reference, update migration.

## 📝 Next Steps for Production

1. Run all migrations
2. Create storage buckets
3. Test all features end-to-end
4. Set up proper error monitoring
5. Add loading skeletons where needed
6. Test on mobile/PWA
7. Verify RLS policies work correctly
8. Set up backup strategy
