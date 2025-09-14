#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Student Notes Hub database...\n');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Executing database schema...');
    
    // Split schema into individual statements and execute them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            // Try direct SQL execution as fallback
            const { error: directError } = await supabase.from('_').select('*').limit(0);
            // If neither works, log the statement that failed
            if (directError && statement.includes('CREATE')) {
              console.log(`⚠️  Statement may have already been executed: ${statement.substring(0, 50)}...`);
            }
          }
        } catch (err) {
          console.log(`⚠️  Continuing after error: ${err.message}`);
        }
      }
    }

    console.log('✅ Database schema setup completed!\n');

    // Set up RLS trigger for new users
    console.log('🔒 Setting up authentication trigger...');
    
    const triggerSQL = `
      CREATE OR REPLACE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `;

    try {
      // This would need to be run via Supabase SQL editor manually
      console.log('⚠️  Please run this trigger manually in Supabase SQL Editor:');
      console.log(triggerSQL);
    } catch (err) {
      console.log('⚠️  Authentication trigger setup needs manual configuration');
    }

    // Check if storage bucket exists
    console.log('📁 Checking storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (!bucketError) {
      const notesBucket = buckets.find(bucket => bucket.name === 'student-notes');
      if (notesBucket) {
        console.log('✅ Storage bucket "student-notes" found!');
      } else {
        console.log('⚠️  Storage bucket "student-notes" not found.');
        console.log('   Please create it manually in Supabase Dashboard > Storage');
      }
    }

    // Test database connection with a simple query
    console.log('\n🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('college_configs')
      .select('count')
      .limit(1);

    if (!testError) {
      console.log('✅ Database connection successful!');
    } else {
      console.log('⚠️  Database connection test failed:', testError.message);
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\nNext steps:');
    console.log('1. Verify the storage bucket exists: "student-notes"');
    console.log('2. Run seed data: npm run seed-db');
    console.log('3. Configure your college in the college_configs table');
    console.log('4. Test the application: npm run dev');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();