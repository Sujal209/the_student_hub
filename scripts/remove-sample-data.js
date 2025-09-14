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

async function removeSampleData() {
  console.log('🧹 Removing sample data from database...\n');

  try {
    // First, let's see what's in the database
    const { data: allNotes, error: queryError } = await supabase
      .from('notes')
      .select('id, title, file_path, created_at')
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('❌ Error querying notes:', queryError);
      return;
    }

    console.log(`📊 Found ${allNotes.length} total notes in database:`);
    allNotes.forEach((note, index) => {
      const isReal = !note.file_path.includes('sample-');
      console.log(`   ${index + 1}. ${note.title} ${isReal ? '(REAL)' : '(SAMPLE)'}`);
    });

    // Identify sample notes (those with file_path containing 'sample-')
    const sampleNotes = allNotes.filter(note => note.file_path.includes('sample-'));
    const realNotes = allNotes.filter(note => !note.file_path.includes('sample-'));

    console.log(`\n🎯 Analysis:`);
    console.log(`   - ${realNotes.length} real notes (will be kept)`);
    console.log(`   - ${sampleNotes.length} sample notes (will be removed)`);

    if (sampleNotes.length === 0) {
      console.log('✅ No sample data found to remove!');
      return;
    }

    // Remove sample notes
    console.log('\n🗑️  Removing sample notes...');
    const sampleIds = sampleNotes.map(note => note.id);
    
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .in('id', sampleIds);

    if (deleteError) {
      console.error('❌ Error removing sample notes:', deleteError);
      return;
    }

    console.log(`✅ Successfully removed ${sampleNotes.length} sample notes!`);

    // Verify the cleanup
    console.log('\n🔍 Verifying cleanup...');
    const { data: remainingNotes, error: verifyError } = await supabase
      .from('notes')
      .select('id, title, file_path')
      .order('created_at', { ascending: false });

    if (verifyError) {
      console.error('❌ Error verifying cleanup:', verifyError);
      return;
    }

    console.log(`📊 Database now contains ${remainingNotes.length} notes:`);
    if (remainingNotes.length === 0) {
      console.log('   (No notes in database - ready for real uploads!)');
    } else {
      remainingNotes.forEach((note, index) => {
        console.log(`   ${index + 1}. ${note.title}`);
      });
    }

    console.log('\n🎉 Sample data cleanup complete!');
    console.log('Your database now contains only real uploaded notes.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

removeSampleData();