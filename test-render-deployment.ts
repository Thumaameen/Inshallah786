
#!/usr/bin/env tsx

/**
 * 🧪 COMPREHENSIVE RENDER DEPLOYMENT TEST
 * 
 * Tests all critical functionality before pushing to GitHub
 * Ensures 100% deployment readiness for Render
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<boolean>,
  critical: boolean = false
): Promise<void> {
  try {
    console.log(`\n🔍 Testing: ${name}...`);
    const passed = await testFn();
    
    results.push({
      name,
      passed,
      message: passed ? 'PASSED' : 'FAILED',
      critical
    });
    
    if (passed) {
      console.log(`✅ ${name}: PASSED`);
    } else {
      console.log(`❌ ${name}: FAILED`);
    }
  } catch (error) {
    console.error(`❌ ${name}: ERROR - ${error.message}`);
    results.push({
      name,
      passed: false,
      message: `ERROR: ${error.message}`,
      critical
    });
  }
}

// Test 1: Dependencies Install
async function testDependenciesInstall(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('npm install --legacy-peer-deps --no-optional');
    return !stdout.includes('error') && !stdout.includes('ENOENT');
  } catch (error) {
    return false;
  }
}

// Test 2: TypeScript Compiler Available
async function testTypeScriptAvailable(): Promise<boolean> {
  try {
    await execAsync('npx tsc --version');
    return true;
  } catch (error) {
    return false;
  }
}

// Test 3: TSX Available
async function testTsxAvailable(): Promise<boolean> {
  try {
    await execAsync('npx tsx --version');
    return true;
  } catch (error) {
    return false;
  }
}

// Test 4: Client Build
async function testClientBuild(): Promise<boolean> {
  try {
    const { stdout, stderr } = await execAsync('cd client && npm install --legacy-peer-deps && npm run build');
    
    // Check if dist/public exists and has index.html
    const distPath = path.join(process.cwd(), 'client', 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    return fs.existsSync(indexPath);
  } catch (error) {
    console.error('Client build error:', error.message);
    return false;
  }
}

// Test 5: Server Build
async function testServerBuild(): Promise<boolean> {
  try {
    await execAsync('npx tsc -p tsconfig.json --skipLibCheck');
    
    // Check if dist/server/index-minimal.js exists
    const serverPath = path.join(process.cwd(), 'dist', 'server', 'index-minimal.js');
    
    return fs.existsSync(serverPath);
  } catch (error) {
    console.error('Server build error:', error.message);
    return false;
  }
}

// Test 6: Production Files Exist
async function testProductionFilesExist(): Promise<boolean> {
  const criticalFiles = [
    'dist/server/index-minimal.js',
    'client/dist/index.html',
    'render-build-production.sh',
    'render-start-production.sh',
    'render.yaml'
  ];
  
  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing critical file: ${file}`);
      return false;
    }
  }
  
  return true;
}

// Test 7: Environment Variables
async function testEnvironmentVariables(): Promise<boolean> {
  const requiredVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'DATABASE_URL'
  ];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.warn(`Warning: ${varName} not set`);
    }
  }
  
  // Non-blocking - return true
  return true;
}

// Test 8: Server Starts Successfully
async function testServerStarts(): Promise<boolean> {
  return new Promise((resolve) => {
    const serverProcess = exec('node dist/server/index-minimal.js');
    
    let serverStarted = false;
    
    serverProcess.stdout?.on('data', (data) => {
      if (data.includes('Server running')) {
        serverStarted = true;
        serverProcess.kill();
        resolve(true);
      }
    });
    
    serverProcess.stderr?.on('data', (data) => {
      console.error('Server error:', data);
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (!serverStarted) {
        serverProcess.kill();
        resolve(false);
      }
    }, 10000);
  });
}

// Test 9: Health Endpoint Works
async function testHealthEndpoint(): Promise<boolean> {
  try {
    // Start server in background
    const serverProcess = exec('node dist/server/index-minimal.js');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test health endpoint
    const response = await fetch('http://localhost:5000/api/health');
    const isHealthy = response.ok;
    
    serverProcess.kill();
    return isHealthy;
  } catch (error) {
    return false;
  }
}

// Test 10: Render.yaml Configuration Valid
async function testRenderYamlValid(): Promise<boolean> {
  try {
    const renderYamlPath = path.join(process.cwd(), 'render.yaml');
    const content = fs.readFileSync(renderYamlPath, 'utf-8');
    
    // Check critical configurations
    const checks = [
      content.includes('buildCommand:'),
      content.includes('startCommand:'),
      content.includes('healthCheckPath:'),
      content.includes('NODE_ENV'),
      content.includes('PORT')
    ];
    
    return checks.every(check => check === true);
  } catch (error) {
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 COMPREHENSIVE RENDER DEPLOYMENT TEST');
  console.log('========================================\n');
  
  await runTest('Dependencies Install', testDependenciesInstall, true);
  await runTest('TypeScript Compiler Available', testTypeScriptAvailable, true);
  await runTest('TSX Available', testTsxAvailable, true);
  await runTest('Client Build', testClientBuild, true);
  await runTest('Server Build', testServerBuild, true);
  await runTest('Production Files Exist', testProductionFilesExist, true);
  await runTest('Environment Variables', testEnvironmentVariables, false);
  await runTest('Server Starts Successfully', testServerStarts, true);
  await runTest('Health Endpoint Works', testHealthEndpoint, true);
  await runTest('Render.yaml Configuration Valid', testRenderYamlValid, true);
  
  // Print results
  console.log('\n\n📊 TEST RESULTS');
  console.log('========================================\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const criticalFailed = results.filter(r => !r.passed && r.critical).length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : result.critical ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });
  
  console.log('\n========================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🔴 Critical Failures: ${criticalFailed}`);
  console.log('========================================\n');
  
  if (criticalFailed > 0) {
    console.log('❌ DEPLOYMENT NOT READY - Fix critical failures before pushing to GitHub');
    process.exit(1);
  } else {
    console.log('✅ DEPLOYMENT READY - Safe to push to GitHub for Render deployment!');
    process.exit(0);
  }
}

runAllTests().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});
