
/**
 * Comprehensive API Health Check
 * Tests all API connections to ensure they work on Render
 */

import { Router } from 'express';
import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

const router = Router();

router.get('/api/health/full', async (req, res) => {
  const results: any = {
    timestamp: new Date().toISOString(),
    platform: process.env.RENDER ? 'Render' : 'Replit',
    environment: process.env.NODE_ENV,
    tests: {}
  };

  // Test OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      await openai.models.list();
      results.tests.openai = { status: '✅', message: 'Connected' };
    } catch (error) {
      results.tests.openai = { status: '❌', error: error instanceof Error ? error.message : 'Failed' };
    }
  } else {
    results.tests.openai = { status: '⚪', message: 'Not configured' };
  }

  // Test Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      });
      results.tests.anthropic = { status: '✅', message: 'Connected' };
    } catch (error) {
      results.tests.anthropic = { status: '❌', error: error instanceof Error ? error.message : 'Failed' };
    }
  } else {
    results.tests.anthropic = { status: '⚪', message: 'Not configured' };
  }

  // Test Database
  if (process.env.DATABASE_URL) {
    results.tests.database = { status: '✅', message: 'URL configured' };
  } else {
    results.tests.database = { status: '❌', message: 'Not configured' };
  }

  // Count configured services
  const total = Object.keys(results.tests).length;
  const healthy = Object.values(results.tests).filter((t: any) => t.status === '✅').length;

  results.summary = {
    total,
    healthy,
    percentage: Math.round((healthy / total) * 100)
  };

  res.json(results);
});

export default router;
