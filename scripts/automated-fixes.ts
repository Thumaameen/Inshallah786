import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class AutomatedFixer {
  private readonly rootDir: string;

  constructor() {
    this.rootDir = process.cwd();
  }

  async runAllFixes() {
    console.log('🔧 Starting automated fixes...');

    try {
      await this.fixTypescriptErrors();
      await this.fixBuildScripts();
      await this.fixAIServices();
      await this.validateFixes();

      console.log('✅ All fixes applied successfully!');
    } catch (error) {
      console.error('❌ Fix process failed:', error);
      process.exit(1);
    }
  }

  private async fixTypescriptErrors() {
    console.log('📝 Fixing TypeScript errors...');
    const aiServicePath = path.join(this.rootDir, 'server/services/ultra-queen-ai.ts');
    const aiServiceFix = `
import { Request, Response } from 'express';
import { OpenAIApi } from 'openai';
import { AnthropicAI } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class UltraQueenAI {
  private openai: OpenAIApi;
  private anthropic: AnthropicAI;
  private googleAI: GoogleGenerativeAI;

  constructor() {
    this.initializeAIServices();
  }

  private initializeAIServices() {
    try {
      this.openai = new OpenAIApi({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      this.anthropic = new AnthropicAI({
        apiKey: process.env.ANTHROPIC_API_KEY
      });

      this.googleAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);
    } catch (error) {
      console.error('AI service initialization failed:', error);
    }
  }

  async handleRequest(req: Request, res: Response) {
    try {
      const { prompt, service } = req.body;
      
      switch(service) {
        case 'openai':
          return await this.handleOpenAI(prompt);
        case 'anthropic':
          return await this.handleAnthropic(prompt);
        case 'google':
          return await this.handleGoogleAI(prompt);
        default:
          throw new Error('Invalid AI service specified');
      }
    } catch (error) {
      console.error('AI request failed:', error);
      throw error;
    }
  }

  private async handleOpenAI(prompt: string) {
    const response = await this.openai.createCompletion({
      model: 'gpt-4-1106-preview',
      prompt,
      max_tokens: 2048
    });
    return response.data;
  }

  private async handleAnthropic(prompt: string) {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    });
    return response;
  }

  private async handleGoogleAI(prompt: string) {
    const model = this.googleAI.getGenerativeModel({ model: 'gemini-pro' });
    const response = await model.generateContent(prompt);
    return response;
  }
}

export const ultraQueenAIService = new UltraQueenAI();`;

    fs.writeFileSync(aiServicePath, aiServiceFix);
  }

  private async validateFixes() {
    console.log('🔍 Validating fixes...');
    try {
      execSync('npm run build:server', { stdio: 'inherit' });
      console.log('✅ Server build validated');
      
      execSync('cd client && npm run build', { stdio: 'inherit' });
      console.log('✅ Client build validated');
      
      console.log('✅ All fixes validated successfully!');
    } catch (error) {
      console.error('❌ Fix validation failed:', error);
      throw error;
    }
  }
}

// Run the fixer
const fixer = new AutomatedFixer();
fixer.runAllFixes().catch(console.error);
