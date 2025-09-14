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

async function addSampleNotes() {
  console.log('📚 Adding sample notes to database...\n');

  try {
    // First, get a user and subject to use
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);

    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name')
      .limit(3);

    if (!users || users.length === 0) {
      console.log('⚠️  No users found. Please create a user account first.');
      return;
    }

    if (!subjects || subjects.length === 0) {
      console.log('⚠️  No subjects found. Please run seed-db script first.');
      return;
    }

    const user = users[0];
    console.log(`📝 Using user: ${user.email} (${user.id})`);

    // Sample notes data
    const sampleNotes = [
      {
        title: 'Introduction to React Hooks',
        description: 'Comprehensive guide covering useState, useEffect, and custom hooks with practical examples.',
        uploader_id: user.id,
        subject_id: subjects[0]?.id,
        file_name: 'react-hooks-guide.pdf',
        file_path: `${user.id}/sample-react-hooks.pdf`,
        file_size: 2500000,
        file_type: 'pdf',
        mime_type: 'application/pdf',
        semester: 'Fall 2024',
        year_of_study: 2,
        tags: ['react', 'hooks', 'javascript', 'frontend'],
        visibility: 'public',
        college_domain: 'general',
        status: 'active'
      },
      {
        title: 'Database Design Principles',
        description: 'Essential concepts for designing efficient and scalable database schemas.',
        uploader_id: user.id,
        subject_id: subjects[1]?.id,
        file_name: 'database-design.pdf',
        file_path: `${user.id}/sample-database-design.pdf`,
        file_size: 1800000,
        file_type: 'pdf',
        mime_type: 'application/pdf',
        semester: 'Spring 2024',
        year_of_study: 3,
        tags: ['database', 'sql', 'design', 'normalization'],
        visibility: 'public',
        college_domain: 'general',
        status: 'active'
      },
      {
        title: 'Machine Learning Basics',
        description: 'Introduction to machine learning algorithms and their practical applications.',
        uploader_id: user.id,
        subject_id: subjects[2]?.id,
        file_name: 'ml-basics.pdf',
        file_path: `${user.id}/sample-ml-basics.pdf`,
        file_size: 3200000,
        file_type: 'pdf',
        mime_type: 'application/pdf',
        semester: 'Fall 2024',
        year_of_study: 4,
        tags: ['machine-learning', 'ai', 'algorithms', 'python'],
        visibility: 'public',
        college_domain: 'general',
        status: 'active'
      },
      {
        title: 'JavaScript ES6 Features',
        description: 'Modern JavaScript features including arrow functions, destructuring, and async/await.',
        uploader_id: user.id,
        subject_id: subjects[0]?.id,
        file_name: 'es6-features.pdf',
        file_path: `${user.id}/sample-es6-features.pdf`,
        file_size: 1500000,
        file_type: 'pdf',
        mime_type: 'application/pdf',
        semester: 'Spring 2024',
        year_of_study: 2,
        tags: ['javascript', 'es6', 'programming', 'web-development'],
        visibility: 'public',
        college_domain: 'general',
        status: 'active'
      },
      {
        title: 'Calculus Study Guide',
        description: 'Complete study guide covering derivatives, integrals, and applications.',
        uploader_id: user.id,
        subject_id: subjects[1]?.id,
        file_name: 'calculus-study-guide.pdf',
        file_path: `${user.id}/sample-calculus.pdf`,
        file_size: 4100000,
        file_type: 'pdf',
        mime_type: 'application/pdf',
        semester: 'Fall 2024',
        year_of_study: 1,
        tags: ['calculus', 'mathematics', 'derivatives', 'integrals'],
        visibility: 'public',
        college_domain: 'general',
        status: 'active'
      }
    ];

    // Insert sample notes
    console.log(`📚 Inserting ${sampleNotes.length} sample notes...`);
    
    const { data: insertedNotes, error: insertError } = await supabase
      .from('notes')
      .insert(sampleNotes)
      .select();

    if (insertError) {
      console.error('❌ Error inserting sample notes:', insertError);
      return;
    }

    console.log(`✅ Successfully added ${insertedNotes.length} sample notes!`);
    
    insertedNotes.forEach((note, index) => {
      console.log(`   ${index + 1}. ${note.title} (ID: ${note.id})`);
    });

    // Verify notes can be queried
    console.log('\n🔍 Verifying notes can be retrieved...');
    const { data: allNotes, error: queryError } = await supabase
      .from('notes')
      .select('id, title, uploader_id, status, visibility')
      .eq('status', 'active');

    if (queryError) {
      console.error('❌ Error querying notes:', queryError);
    } else {
      console.log(`✅ Found ${allNotes.length} active notes in database`);
    }

    console.log('\n🎉 Sample data setup complete!');
    console.log('Now you can:');
    console.log('1. Visit http://localhost:3001');
    console.log('2. Browse the notes section');
    console.log('3. Test the search functionality');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addSampleNotes();