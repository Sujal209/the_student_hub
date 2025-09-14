#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugStorage() {
  console.log('🔍 Debugging Supabase Storage...\n');

  try {
    // Check if storage buckets exist
    console.log('📁 Checking storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
    } else {
      console.log('✅ Available buckets:');
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }

    // Check if 'student-notes' bucket exists
    const notesBucket = buckets?.find(bucket => bucket.name === 'student-notes');
    if (!notesBucket) {
      console.log('\n🚨 "student-notes" bucket does not exist!');
      console.log('Creating bucket...');
      
      const { data: newBucket, error: createError } = await supabase.storage
        .createBucket('student-notes', {
          public: true
        });

      if (createError) {
        console.error('❌ Error creating bucket:', createError);
      } else {
        console.log('✅ Created "student-notes" bucket successfully!');
      }
    } else {
      console.log('✅ "student-notes" bucket exists!');
    }

    // Test file upload
    console.log('\n📤 Testing file upload...');
    const testContent = 'This is a test file for debugging upload functionality.';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    
    const testPath = `test/debug-${Date.now()}.txt`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('student-notes')
      .upload(testPath, testFile);

    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
    } else {
      console.log('✅ Test upload successful!');
      console.log(`   Path: ${testPath}`);
      
      // Clean up test file
      await supabase.storage.from('student-notes').remove([testPath]);
      console.log('🧹 Test file cleaned up');
    }

    // Check database tables
    console.log('\n🗄️  Checking database tables...');
    
    // Check if subjects table exists and has data
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name')
      .limit(5);

    if (subjectsError) {
      console.error('❌ Error fetching subjects:', subjectsError);
    } else {
      console.log(`✅ Subjects table: ${subjects.length} subjects available`);
      if (subjects.length > 0) {
        subjects.forEach(subject => {
          console.log(`   - ${subject.name} (ID: ${subject.id})`);
        });
      }
    }

    // Check if notes table exists
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('count')
      .limit(1);

    if (notesError) {
      console.error('❌ Notes table issue:', notesError);
    } else {
      console.log('✅ Notes table accessible');
    }

    console.log('\n🎉 Debug complete!');

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugStorage();