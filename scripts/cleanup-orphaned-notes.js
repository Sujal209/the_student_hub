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

async function cleanupOrphanedNotes() {
  console.log('🔍 Checking for orphaned notes (database records without actual files)...\n');

  try {
    // Get all notes from database
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id, title, file_path, file_name')
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('❌ Error fetching notes:', notesError);
      return;
    }

    console.log(`📊 Found ${notes.length} notes in database`);

    if (notes.length === 0) {
      console.log('✅ No notes to check.');
      return;
    }

    // Check storage bucket files
    console.log('\n📁 Checking storage bucket...');
    const { data: files, error: storageError } = await supabase.storage
      .from('student-notes')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (storageError) {
      console.error('❌ Error checking storage:', storageError);
    } else {
      console.log(`📁 Found ${files.length} files in storage bucket`);
    }

    // Check each note to see if its file exists
    const orphanedNotes = [];
    const validNotes = [];

    console.log('\n🔍 Checking each note...');
    
    for (const note of notes) {
      try {
        // Try to get file info from storage
        const { data: fileData, error: fileError } = await supabase.storage
          .from('student-notes')
          .getPublicUrl(note.file_path);

        // Try to create a signed URL to verify the file exists
        const { data: signedData, error: signedError } = await supabase.storage
          .from('student-notes')
          .createSignedUrl(note.file_path, 60);

        if (signedError && signedError.message.includes('Object not found')) {
          orphanedNotes.push(note);
          console.log(`❌ ${note.title} - File not found in storage`);
        } else {
          validNotes.push(note);
          console.log(`✅ ${note.title} - File exists`);
        }
      } catch (error) {
        orphanedNotes.push(note);
        console.log(`❌ ${note.title} - Error checking file: ${error.message}`);
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   ✅ Valid notes (file exists): ${validNotes.length}`);
    console.log(`   ❌ Orphaned notes (no file): ${orphanedNotes.length}`);

    if (orphanedNotes.length > 0) {
      console.log(`\n🗑️  Removing ${orphanedNotes.length} orphaned notes from database...`);
      
      const orphanedIds = orphanedNotes.map(note => note.id);
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .in('id', orphanedIds);

      if (deleteError) {
        console.error('❌ Error removing orphaned notes:', deleteError);
      } else {
        console.log('✅ Successfully removed orphaned notes!');
        
        orphanedNotes.forEach(note => {
          console.log(`   🗑️  Removed: ${note.title}`);
        });
      }
    }

    // Final status
    console.log('\n🎉 Cleanup complete!');
    if (validNotes.length > 0) {
      console.log(`Your database now has ${validNotes.length} valid notes with actual files:`);
      validNotes.forEach(note => {
        console.log(`   📄 ${note.title}`);
      });
    } else {
      console.log('📭 Your database is clean but has no notes with actual files.');
      console.log('   Ready for new uploads!');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupOrphanedNotes();