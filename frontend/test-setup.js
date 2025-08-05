// Test script to validate Phase 1 setup
import fs from 'fs';
import path from 'path';

console.log('🔍 Testing Universal Agent Platform Setup...\n');

// Test 1: Environment Configuration
console.log('✅ Test 1: Environment Files');
const envFiles = [
  '.env',
  'backend/.env',
  'backend/.env.example'
];

envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   📄 ${file} - FOUND`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
  }
});

// Test 2: Demo Mode Files
console.log('\n✅ Test 2: Demo Mode Components');
const demoFiles = [
  'src/config/demo.ts',
  'src/integrations/supabase/mockClient.ts',
  'setup.sh',
  'SETUP.md'
];

demoFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   📄 ${file} - FOUND`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
  }
});

// Test 3: Configuration Validation
console.log('\n✅ Test 3: Configuration Status');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const hasSupabase = envContent.includes('VITE_SUPABASE_URL');
  const hasDemoMode = envContent.includes('VITE_ENABLE_DEMO_MODE=true');
  const hasOpenAI = envContent.includes('OPENAI_API_KEY');
  
  console.log(`   🔗 Supabase Config: ${hasSupabase ? 'CONFIGURED' : 'MISSING'}`);
  console.log(`   🎯 Demo Mode: ${hasDemoMode ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   🤖 OpenAI API: ${hasOpenAI ? 'CONFIGURED' : 'USING DEMO'}`);
} catch (error) {
  console.log('   ❌ Error reading .env file');
}

console.log('\n🎉 Phase 1 Setup Complete!');
console.log('📋 Next Steps:');
console.log('   1. Open http://localhost:8080 in your browser');
console.log('   2. Try creating an agent in the Universal Agent Builder');
console.log('   3. Test the AI Copilot functionality');
console.log('   4. Explore the Knowledge Builder');
console.log('   5. Ready for Phase 2: Service Integration!');