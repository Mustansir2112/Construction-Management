# Database Setup Instructions

The application requires specific database tables to function properly. Follow these steps to set up your Supabase database:

## 1. Run the Database Migrations

You need to apply the database migrations to create the required tables. Run these commands in your project directory:

```bash
# Make sure you have Supabase CLI installed
npm install -g supabase

# Login to Supabase (if not already logged in)
supabase login

# Link your project (replace with your project reference)
supabase link --project-ref your-project-ref

# Apply the migrations
supabase db push
```

## 2. Required Tables

The migrations will create these tables:

### `profiles` table
- Stores user profile information and roles
- Links to Supabase auth users

### `inventory` table  
- Stores inventory items with quantities and minimum stock levels
- Triggers alerts when stock is low

### `movements` table
- Tracks item movements between zones
- Includes approval status and risk levels

### `alerts` table
- Stores system-generated alerts (like low stock warnings)
- Links to inventory items and workers

## 3. Environment Variables

Make sure your `.env` file has the correct values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Replace `your_supabase_service_role_key_here` with your actual service role key from the Supabase dashboard.

## 4. Row Level Security (RLS)

The migrations automatically set up RLS policies:
- Workers can view and create movements
- Managers can manage inventory and approve movements  
- Everyone can view inventory and alerts
- System can create alerts automatically

## 5. Test the Setup

After running the migrations:

1. Start your development server: `npm run dev`
2. Try adding an inventory item
3. Try creating a movement
4. Check that alerts are generated for low stock items

## Troubleshooting

If you see TypeScript errors about "never" types:
1. Make sure the database tables exist (run migrations)
2. Restart your development server
3. Clear TypeScript cache: `rm -rf .next`

The application uses type assertions (`as any`) as a temporary workaround for type issues that occur when tables don't exist yet. Once the database is properly set up, these should work correctly.