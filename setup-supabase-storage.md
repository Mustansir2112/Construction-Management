# Supabase Storage Setup for Invoice History

## Step 1: Get Your Service Role Key

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/zdnhhkwxeimbjwoezirc
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)
4. Update your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## Step 2: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click **Create Bucket**
3. Name it: `invoices`
4. Make it **Public** (so we can generate download URLs)
5. Click **Create Bucket**

## Step 3: Set Storage Policies (Optional)

If you want to restrict access, you can set up Row Level Security policies:

```sql
-- Allow authenticated users to upload invoices
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'invoices' AND auth.role() = 'authenticated');

-- Allow public read access to invoices
CREATE POLICY "Allow public downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'invoices');
```

## Step 4: Test the Setup

After completing the above steps:

1. Generate a PDF from the invoice preview page
2. Visit `/invoice-history` to see the stored invoices
3. The component will show all invoices with metadata like:
   - Invoice number and date
   - Client and project information
   - Total amounts and item counts
   - Creation timestamps
   - Download functionality

## Features Included

✅ **Metadata Storage**: Each PDF includes rich metadata without needing a database schema
✅ **File Management**: All invoices stored in Supabase Storage with organized naming
✅ **Download History**: Track when invoices were created and by whom
✅ **Rich UI**: Professional interface with shadcn components
✅ **Search & Filter**: Easy to extend with search functionality
✅ **Responsive Design**: Works on all device sizes

## Metadata Included in Each PDF

- `invoiceNo`: Invoice number
- `invoiceDate`: Invoice date
- `dueDate`: Due date
- `companyName`: Company name
- `clientName`: Client name
- `projectName`: Project name
- `subtotal`: Subtotal amount
- `totalTax`: Tax amount
- `grandTotal`: Grand total
- `itemCount`: Number of items
- `timeCreated`: Creation timestamp
- `createdBy`: Creator (can be extended to include user info)