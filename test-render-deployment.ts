import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testRenderDeployment() {
  try {
    console.log('🚀 Testing Render deployment configuration...');

    // Check Node.js version
    const { stdout: nodeVersion } = await execAsync('node -v');
    const requiredVersion = '20.19.1';
    if (!nodeVersion.includes(requiredVersion)) {
      throw new Error(`Node.js version ${requiredVersion} is required. Found: ${nodeVersion}`);
    }
    console.log('✅ Node.js version check passed');

    // Verify package.json
    const { stdout: packageJson } = await execAsync('cat package.json');
    const pkg = JSON.parse(packageJson);
    if (pkg.engines?.node !== requiredVersion) {
      throw new Error('package.json engines.node version mismatch');
    }
    console.log('✅ package.json configuration check passed');

    // Test production build
    console.log('🔨 Testing production build...');
    await execAsync('npm run build:production');
    console.log('✅ Production build successful');

    // Verify dist directory
    await execAsync('test -d dist');
    console.log('✅ dist directory exists');

    // Check for required files
    const requiredFiles = [
      'dist/server/index-minimal.js',
      'dist/public/index.html',
      'render.yaml',
      'render-build-production.sh',
      'render-start-production.sh'
    ];

    for (const file of requiredFiles) {
      await execAsync(`test -f ${file}`);
      console.log(`✅ Found required file: ${file}`);
    }

    // Verify start script
    const startScript = pkg.scripts?.start;
    if (!startScript?.includes('index-minimal.js')) {
      throw new Error('Invalid start script in package.json');
    }
    console.log('✅ Start script configuration check passed');

    // All tests passed
    console.log('🎉 All Render deployment tests passed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Render deployment test failed:', error.message);
    process.exit(1);
  }
}

testRenderDeployment();