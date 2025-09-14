#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCollegeConfig() {
  console.log('🏫 Adding college configuration...\n');

  try {
    // Add college configuration
    const { data, error } = await supabase
      .from('college_configs')
      .upsert([
        {
          college_name: 'Student Notes Hub College',
          allowed_email_domains: ['gmail.com', 'yahoo.com', 'student.edu', 'university.edu'],
          admin_email: 'admin@example.com',
          max_file_size_mb: 10,
          allowed_file_types: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'png', 'jpeg'],
          enable_downloads: true,
          enable_ratings: true,
          enable_comments: true,
          require_approval: false
        }
      ], {
        onConflict: 'college_name',
        returning: 'minimal'
      });

    if (error) {
      console.error('❌ Error adding college config:', error.message);
    } else {
      console.log('✅ College configuration added successfully!');
      
      // Verify it was added
      const { data: configs, error: verifyError } = await supabase
        .from('college_configs')
        .select('*');

      if (!verifyError && configs?.length > 0) {
        console.log('\n📋 Current college configuration:');
        configs.forEach(config => {
          console.log(`   - Name: ${config.college_name}`);
          console.log(`   - Admin Email: ${config.admin_email}`);
          console.log(`   - Allowed Domains: ${config.allowed_email_domains.join(', ')}`);
          console.log(`   - Max File Size: ${config.max_file_size_mb}MB`);
          console.log(`   - Downloads: ${config.enable_downloads ? '✅' : '❌'}`);
          console.log(`   - Ratings: ${config.enable_ratings ? '✅' : '❌'}`);
          console.log(`   - Comments: ${config.enable_comments ? '✅' : '❌'}`);
        });
      }
    }

    console.log('\n🎉 Setup complete! Your application is ready to use.');
    console.log('\nNext steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Create your first user account');
    console.log('4. Upload your first note!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addCollegeConfig();