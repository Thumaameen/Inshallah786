// Quick DHA Keys Test
async function testKeys() {
    console.log('🔒 Testing DHA Service Keys...\n');

    const testResults = {
        dha: {},
        document: {},
        security: {}
    };

    // Test DHA Keys
    try {
        console.log('1. Testing DHA NPR Key...');
        if (process.env.DHA_NPR_API_KEY?.startsWith('dha_npr_live_')) {
            testResults.dha.npr = '✅ Valid';
            console.log('✅ NPR Key format valid');
        } else {
            testResults.dha.npr = '❌ Invalid format';
            console.log('❌ NPR Key format invalid');
        }
    } catch (error) {
        console.error('❌ NPR Key test failed:', error.message);
    }

    // Test ABIS Keys
    try {
        console.log('\n2. Testing DHA ABIS Key...');
        if (process.env.DHA_ABIS_API_KEY?.startsWith('dha_abis_live_')) {
            testResults.dha.abis = '✅ Valid';
            console.log('✅ ABIS Key format valid');
        } else {
            testResults.dha.abis = '❌ Invalid format';
            console.log('❌ ABIS Key format invalid');
        }
    } catch (error) {
        console.error('❌ ABIS Key test failed:', error.message);
    }

    // Test Document Keys
    try {
        console.log('\n3. Testing Document Generation Keys...');
        if (process.env.DOC_PKI_PRIVATE_KEY?.includes('PRIVATE KEY')) {
            testResults.document.pki = '✅ Valid';
            console.log('✅ PKI Key format valid');
        } else {
            testResults.document.pki = '❌ Invalid format';
            console.log('❌ PKI Key format invalid');
        }
    } catch (error) {
        console.error('❌ Document PKI test failed:', error.message);
    }

    // Test Security Keys
    try {
        console.log('\n4. Testing Security Keys...');
        if (process.env.QUANTUM_ENCRYPTION_KEY?.length >= 64) {
            testResults.security.quantum = '✅ Valid';
            console.log('✅ Quantum Encryption Key length valid');
        } else {
            testResults.security.quantum = '❌ Invalid length';
            console.log('❌ Quantum Encryption Key must be at least 64 characters');
        }
    } catch (error) {
        console.error('❌ Security key test failed:', error.message);
    }

    // Print Summary
    console.log('\n📊 Test Summary');
    console.log('=============');
    console.log('DHA NPR:', testResults.dha.npr || '❌ Not tested');
    console.log('DHA ABIS:', testResults.dha.abis || '❌ Not tested');
    console.log('Document PKI:', testResults.document.pki || '❌ Not tested');
    console.log('Quantum Security:', testResults.security.quantum || '❌ Not tested');
}

testKeys().catch(console.error);