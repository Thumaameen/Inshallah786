
import fs from 'fs';
import path from 'path';

export class SecureEnvLoader {
  /**
   * Read environment variables from file and immediately delete it
   */
  static async loadAndDeleteEnvFile(filePath: string): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        console.log('⚠️ No env file to delete');
        return;
      }

      console.log('🔐 Loading environment variables from file...');
      
      // Read file content
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Parse and set environment variables
      const lines = content.split('\n');
      let loadedCount = 0;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value;
            loadedCount++;
          }
        }
      }
      
      console.log(`✅ Loaded ${loadedCount} environment variables`);
      
      // Immediately delete the file for security
      fs.unlinkSync(filePath);
      console.log('🔒 Securely deleted environment file');
      
    } catch (error) {
      console.error('❌ Error loading environment file:', error);
    }
  }
  
  /**
   * Validate all required production API keys are present
   */
  static validateProductionKeys(): void {
    const requiredKeys = [
      'DHA_NPR_API_KEY',
      'DHA_ABIS_API_KEY',
      'SAPS_CRC_API_KEY',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY'
    ];
    
    const missingKeys: string[] = [];
    
    for (const key of requiredKeys) {
      if (!process.env[key]) {
        missingKeys.push(key);
      }
    }
    
    if (missingKeys.length > 0) {
      console.warn('⚠️ Missing production API keys:', missingKeys.join(', '));
    } else {
      console.log('✅ All critical API keys configured');
    }
  }
}
