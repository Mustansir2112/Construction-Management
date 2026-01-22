# DPR Setup Instructions

## Database Migration

Run the migration to add the `dprs` table with media support:

```bash
npm run supabase:push
```

Or manually run the migration file:
`supabase/migrations/005_add_dprs_table.sql`

## Supabase Storage Bucket Setup

You need to create a storage bucket for DPR media files:

1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Click **New bucket**
4. Create a bucket named: `dpr-media`
5. Set it as **Public bucket** (or configure RLS policies as needed)
6. Add the following folders:
   - `dpr-photos/` - for photos
   - `dpr-videos/` - for videos

## Storage Policies (Optional - if using RLS)

If you want to restrict access, add these policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload DPR media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'dpr-media');

-- Allow public read access
CREATE POLICY "Public can read DPR media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'dpr-media');
```

## Features

✅ Voice recording (Hindi) converted to text
✅ Automatic text summarization
✅ Photo upload (max 30MB per file)
✅ Video upload (max 30MB per file)
✅ Display photos and videos in DPR view
✅ Integrated into manager dashboard

## Usage

1. Click "New DPR" button in the manager dashboard
2. Record voice update using the microphone button (Hindi)
3. Or type work done manually
4. Add photos/videos (max 30MB each)
5. Fill in other details (labor count, materials, issues)
6. Submit - files will be uploaded to Supabase Storage
7. View DPRs with media in the dashboard
