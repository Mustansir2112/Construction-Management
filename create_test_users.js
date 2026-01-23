// Create test users for the Construction Management App
// Run this with: node create_test_users.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zdnhhkwxeimbjwoezirc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkbmhoa3d4ZWltYmp3b2V6aXJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA1NjI2OCwiZXhwIjoyMDg0NjMyMjY4fQ.Qsdiwy2UnOW4YTSpsYJxitewl_UZ8Ek7mvtzdW06wao';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUsers() {
  console.log('Creating test users...');

  const users = [
    {
      email: 'manager@test.com',
      password: 'password123',
      role: 'manager',
      full_name: 'Test Manager'
    },
    {
      email: 'engineer@test.com', 
      password: 'password123',
      role: 'engineer',
      full_name: 'Test Engineer'
    },
    {
      email: 'worker@test.com',
      password: 'password123', 
      role: 'worker',
      full_name: 'Test Worker'
    }
  ];

  for (const user of users) {
    try {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name
        }
      });

      if (authError) {
        console.error(`Error creating ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Created user: ${user.email}`);

      // Insert into user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          id: authUser.user.id,
          role: user.role
        });

      if (roleError) {
        console.error(`Error creating role for ${user.email}:`, roleError.message);
      } else {
        console.log(`✅ Added role ${user.role} for ${user.email}`);
      }

      // Insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ Created profile for ${user.email}`);
      }

    } catch (error) {
      console.error(`Error with ${user.email}:`, error.message);
    }
  }

  console.log('\n🎉 Test users setup complete!');
  console.log('\nYou can now login with:');
  console.log('Manager: manager@test.com / password123');
  console.log('Engineer: engineer@test.com / password123'); 
  console.log('Worker: worker@test.com / password123');
}

createTestUsers();