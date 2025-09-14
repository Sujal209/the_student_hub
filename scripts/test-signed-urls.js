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

async function testSignedUrls() {
  console.log('🔍 Testing signed URL generation...\n');

  try {
    // Get notes from database
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, title, file_path, file_name')
      .limit(5);

    if (notesError) {
      console.error('❌ Error fetching notes:', notesError);
      return;
    }

    console.log(`📊 Testing ${notes.length} notes:\n`);

    for (const note of notes) {
      console.log(`📄 Testing: ${note.title}`);
      console.log(`   File path: ${note.file_path}`);
      
      // Test 1: Try to get public URL
      try {
        const { data: publicUrl } = supabase.storage
          .from('student-notes')
          .getPublicUrl(note.file_path);
        console.log(`   ✅ Public URL: ${publicUrl.publicUrl}`);
      } catch (error) {
        console.log(`   ❌ Public URL failed: ${error.message}`);
      }

      // Test 2: Try to create signed URL
      try {
        const { data: signedData, error: signedError } = await supabase.storage
          .from('student-notes')
          .createSignedUrl(note.file_path, 3600);

        if (signedError) {
          console.log(`   ❌ Signed URL error: ${signedError.message}`);
        } else {
          console.log(`   ✅ Signed URL: ${signedData.signedUrl}`);
        }
      } catch (error) {
        console.log(`   ❌ Signed URL failed: ${error.message}`);
      }

      // Test 3: Try to list files to see actual structure
      try {
        // Extract directory from file path
        const pathParts = note.file_path.split('/');
        const directory = pathParts.slice(0, -1).join('/');
        
        console.log(`   🔍 Checking directory: ${directory || '(root)'}`);
        
        const { data: dirFiles, error: listError } = await supabase.storage
          .from('student-notes')
          .list(directory || '', { limit: 10 });

        if (listError) {
          console.log(`   ❌ List error: ${listError.message}`);
        } else {
          console.log(`   📁 Files in directory: ${dirFiles.length}`);
          dirFiles.forEach(file => {
            console.log(`      - ${file.name}`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Directory listing failed: ${error.message}`);
      }

      console.log(''); // Empty line for readability
    }

    // Test 4: List all files in bucket root
    console.log('🗂️  All files in bucket root:');
    try {
      const { data: allFiles, error: allError } = await supabase.storage
        .from('student-notes')
        .list('', { limit: 20 });

      if (allError) {
        console.log(`❌ Error listing all files: ${allError.message}`);
      } else {
        console.log(`📁 Found ${allFiles.length} items in root:`);
        allFiles.forEach(file => {
          console.log(`   ${file.name} (${file.id ? 'file' : 'directory'})`);
        });
      }
    } catch (error) {
      console.log(`❌ Failed to list all files: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testSignedUrls();