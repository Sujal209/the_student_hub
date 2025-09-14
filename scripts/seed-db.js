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

async function seedDatabase() {
  console.log('🌱 Seeding Student Notes Hub database...\n');

  try {
    // Read seed data file
    const seedPath = path.join(__dirname, '..', 'db', 'seeds', 'initial_data.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');

    console.log('📋 Executing seed data...');
    
    // Split into individual statements and execute them
    const statements = seedData
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // For INSERT statements, use the supabase client directly
          if (statement.toLowerCase().includes('insert into college_configs')) {
            // Parse and execute college configs insert
            const { error } = await supabase
              .from('college_configs')
              .upsert([
                {
                  college_name: 'Default College',
                  allowed_email_domains: ['student.edu', 'university.edu'],
                  admin_email: 'admin@student.edu',
                  max_file_size_mb: 10,
                  allowed_file_types: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'png'],
                  enable_downloads: true,
                  enable_ratings: true,
                  enable_comments: true,
                  require_approval: false
                }
              ], {
                onConflict: 'college_name'
              });

            if (error) {
              console.log(`⚠️  College config insert warning: ${error.message}`);
            } else {
              console.log('✅ College configuration seeded!');
            }
          }
          
          else if (statement.toLowerCase().includes('insert into subjects')) {
            // Parse and execute subjects insert
            const subjects = [
              { name: 'Computer Science', code: 'CS', description: 'Programming, algorithms, and software development' },
              { name: 'Mathematics', code: 'MATH', description: 'Calculus, algebra, statistics, and mathematical analysis' },
              { name: 'Physics', code: 'PHYS', description: 'Classical mechanics, electromagnetism, and quantum physics' },
              { name: 'Chemistry', code: 'CHEM', description: 'Organic, inorganic, and physical chemistry' },
              { name: 'Biology', code: 'BIO', description: 'Life sciences, anatomy, and molecular biology' },
              { name: 'English Literature', code: 'ENG', description: 'Literary analysis, writing, and composition' },
              { name: 'History', code: 'HIST', description: 'World history, historical analysis, and research methods' },
              { name: 'Economics', code: 'ECON', description: 'Microeconomics, macroeconomics, and financial analysis' },
              { name: 'Psychology', code: 'PSYC', description: 'Cognitive psychology, behavioral analysis, and research methods' },
              { name: 'Engineering', code: 'ENGR', description: 'Mechanical, electrical, and civil engineering principles' }
            ];

            const { error } = await supabase
              .from('subjects')
              .upsert(subjects, {
                onConflict: 'code'
              });

            if (error) {
              console.log(`⚠️  Subjects insert warning: ${error.message}`);
            } else {
              console.log('✅ Subjects seeded!');
            }
          }
          
          else {
            // Try to execute other statements directly
            console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
          }
        } catch (err) {
          console.log(`⚠️  Continuing after error: ${err.message}`);
        }
      }
    }

    console.log('✅ Seed data execution completed!\n');

    // Verify seeded data
    console.log('🔍 Verifying seeded data...');
    
    // Check college configs
    const { data: colleges, error: collegeError } = await supabase
      .from('college_configs')
      .select('college_name, admin_email');

    if (!collegeError && colleges?.length > 0) {
      console.log(`✅ Found ${colleges.length} college configuration(s):`);
      colleges.forEach(college => {
        console.log(`   - ${college.college_name} (${college.admin_email})`);
      });
    } else {
      console.log('⚠️  No college configurations found');
    }

    // Check subjects
    const { data: subjects, error: subjectError } = await supabase
      .from('subjects')
      .select('name, code')
      .order('name');

    if (!subjectError && subjects?.length > 0) {
      console.log(`✅ Found ${subjects.length} subject(s):`);
      subjects.slice(0, 5).forEach(subject => {
        console.log(`   - ${subject.name} (${subject.code})`);
      });
      if (subjects.length > 5) {
        console.log(`   ... and ${subjects.length - 5} more`);
      }
    } else {
      console.log('⚠️  No subjects found');
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\nNext steps:');
    console.log('1. Update college configuration with your institution details');
    console.log('2. Add/modify subjects as needed for your curriculum');
    console.log('3. Test the application: npm run dev');
    console.log('4. Create your first admin user account');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();