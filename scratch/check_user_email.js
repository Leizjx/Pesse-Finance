const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://blmxmdvzapsmrrhszuwj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbXhtZHZ6YXBzbXJyaHN6dXdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTU4OTY1MCwiZXhwIjoyMDkxMTY1NjUwfQ.s0ytvokFnEdccJzDbz4yB3B7wyGDNglAMuhSeOzq9tc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
  const emailToFind = 'nguyenhuong150783@gmail.com';
  console.log(`Checking for user with email: ${emailToFind}...`);

  try {
    // 1. Try to list users from Auth (requires Service Role Key)
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Auth Error:', authError.message);
    } else {
      const foundUser = users.find(u => u.email === emailToFind);
      if (foundUser) {
        console.log('SUCCESS: User found in Supabase Auth!');
        console.log('ID:', foundUser.id);
        console.log('Last Sign In:', foundUser.last_sign_in_at);
        return;
      }
    }

    // 2. Try to search in profiles table (fallback)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profileError) {
      console.error('Profile Error:', profileError.message);
    } else {
      console.log(`Searching through ${profiles?.length || 0} profiles...`);
      // Note: Profiles might not have email field depending on schema, but let's check
      // Sometimes it's linked via internal logic or specifically added
      const profileResult = profiles?.find(p => p.email === emailToFind);
      if (profileResult) {
        console.log('SUCCESS: User found in Profiles table!');
        console.log('Profile Data:', profileResult);
        return;
      }
    }

    console.log('RESULT: No user found with that email.');
  } catch (err) {
    console.error('Unexpected Error:', err);
  }
}

checkUser();
