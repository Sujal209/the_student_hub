#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Diagnosing Supabase Connection Issues...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`   Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`   Anon Key: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
console.log(`   Service Key: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Missing required environment variables');
  process.exit(1);
}

// Parse URL to get project info
let projectRef = '';
try {
  const url = new URL(supabaseUrl);
  projectRef = url.hostname.split('.')[0];
  console.log(`   Project Ref: ${projectRef}`);
} catch (error) {
  console.log(`   ❌ Invalid Supabase URL format`);
}

console.log('');

async function testConnections() {
  // Test 1: Basic HTTP connectivity to Supabase
  console.log('🌐 Testing HTTP connectivity...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      }
    });
    
    if (response.ok) {
      console.log('   ✅ HTTP connection successful');
    } else {
      console.log(`   ⚠️  HTTP response: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ HTTP connection failed: ${error.message}`);
  }

  // Test 2: Supabase client with anon key
  console.log('\n🔑 Testing Supabase client (anon key)...');
  try {
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test simple query
    const { data, error } = await supabaseAnon
      .from('subjects')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`   ⚠️  Query error: ${error.message}`);
    } else {
      console.log('   ✅ Anon client working');
    }
  } catch (error) {
    console.log(`   ❌ Anon client failed: ${error.message}`);
  }

  // Test 3: Supabase client with service key
  if (supabaseServiceKey) {
    console.log('\n🔧 Testing Supabase client (service key)...');
    try {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data, error } = await supabaseService
        .from('subjects')
        .select('count')
        .limit(1);

      if (error) {
        console.log(`   ⚠️  Query error: ${error.message}`);
      } else {
        console.log('   ✅ Service client working');
      }
    } catch (error) {
      console.log(`   ❌ Service client failed: ${error.message}`);
    }
  }

  // Test 4: Auth endpoint specifically
  console.log('\n🔐 Testing Auth endpoint...');
  try {
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      }
    });
    
    if (authResponse.ok || authResponse.status === 401) {
      console.log('   ✅ Auth endpoint reachable');
    } else {
      console.log(`   ⚠️  Auth endpoint response: ${authResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Auth endpoint failed: ${error.message}`);
  }

  // Test 5: Storage endpoint
  console.log('\n📁 Testing Storage endpoint...');
  try {
    const storageResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      }
    });
    
    if (storageResponse.ok) {
      console.log('   ✅ Storage endpoint reachable');
    } else {
      console.log(`   ⚠️  Storage endpoint response: ${storageResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Storage endpoint failed: ${error.message}`);
  }

  // Recommendations
  console.log('\n💡 Troubleshooting Tips:');
  console.log('   1. Check if your Supabase project is paused (free tier limitation)');
  console.log('   2. Verify your internet connection');
  console.log('   3. Check Supabase status: https://status.supabase.com/');
  console.log('   4. Try refreshing your browser or restarting the dev server');
  console.log('   5. Check if you have any firewall/antivirus blocking connections');
}

testConnections().catch(console.error);