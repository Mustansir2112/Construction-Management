# Supabase Setup for Construction Management

## Prerequisites
- Node.js installed
- Supabase account (https://supabase.com)

## Setup Instructions

### 1. Create a Supabase Project
1. Go to https://supabase.com and create a new project
2. Wait for the project to be fully initialized

### 2. Get Your Project Credentials
1. Go to Project Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### 4. Run Database Migrations
```bash
# Link your project (you'll need your project reference from Supabase dashboard)
npx supabase link --project-ref your-project-ref

# Push the migrations to your Supabase project
npx supabase db push
```

### 5. Start the Development Server
```bash
npm run dev
```

## Database Schema

The project includes the following tables:

### profiles
- User profiles with roles (manager, engineer, construction_worker)
- Automatically created when users sign up

### projects
- Construction projects with status tracking
- Managed by managers and engineers

### project_assignments
- Links users to projects they're assigned to

### tasks
- Individual tasks within projects
- Can be assigned to specific users

## Authentication Flow

1. Users sign up/sign in at `/auth/login`
2. Profile is automatically created in the `profiles` table
3. Users are redirected to the main dashboard
4. Access is controlled by Row Level Security (RLS) policies

## User Roles

- **Manager**: Can create/manage projects, assign users, view all data
- **Engineer**: Can manage projects, view assigned projects
- **Construction Worker**: Can view assigned projects and tasks

## Next Steps

1. Customize the database schema as needed
2. Add more pages for different user roles
3. Implement project management features
4. Add real-time updates using Supabase subscriptions