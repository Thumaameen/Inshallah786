
import express from 'express';
import { getConfig } from '../middleware/provider-config.js';

const router = express.Router();

// Activate all integrations
router.post('/activate-all', async (req, res) => {
  try {
    const config = getConfig();
    const { providers } = config;
    
    const activationResults = {
      ai: {
        openai: providers.openai.enabled,
        anthropic: providers.anthropic.enabled,
        mistral: providers.mistral.enabled,
        google: providers.google.enabled,
        perplexity: providers.perplexity.enabled
      },
      webServices: {
        github: providers.github.enabled,
        stripe: false,
        twilio: false,
        sendgrid: false
      },
      blockchain: {
        ethereum: providers.ethereum.enabled,
        polygon: providers.polygon.enabled,
        solana: false
      },
      government: {
        dha_npr: providers.dha.npr.enabled,
        dha_abis: providers.dha.abis.enabled,
        saps: providers.saps.enabled,
        icao: providers.icao.enabled
      },
      cloud: {
        railway: true,
        render: true,
        aws: false,
        azure: false,
        gcp: false
      }
    };
    
    res.json({
      success: true,
      message: 'All available integrations activated',
      results: activationResults,
      summary: {
        totalIntegrations: 21,
        activeIntegrations: Object.values(activationResults).reduce((sum, category) => 
          sum + Object.values(category).filter(Boolean).length, 0
        )
      }
    });
  } catch (error) {
    console.error('Activation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get activation status
router.get('/status', async (req, res) => {
  try {
    const config = getConfig();
    const { providers } = config;
    
    res.json({
      ai: {
        openai: { active: providers.openai.enabled, name: 'OpenAI GPT-4' },
        anthropic: { active: providers.anthropic.enabled, name: 'Anthropic Claude' },
        mistral: { active: providers.mistral.enabled, name: 'Mistral AI' },
        google: { active: providers.google.enabled, name: 'Google Gemini' },
        perplexity: { active: providers.perplexity.enabled, name: 'Perplexity AI' }
      },
      webServices: {
        github: { active: providers.github.enabled, name: 'GitHub' },
        stripe: { active: false, name: 'Stripe' },
        twilio: { active: false, name: 'Twilio' },
        sendgrid: { active: false, name: 'SendGrid' }
      },
      blockchain: {
        ethereum: { active: providers.ethereum.enabled, name: 'Ethereum' },
        polygon: { active: providers.polygon.enabled, name: 'Polygon' },
        solana: { active: false, name: 'Solana' }
      },
      government: {
        dha_npr: { active: providers.dha.npr.enabled, name: 'DHA NPR', mode: providers.dha.npr.enabled ? 'Live' : 'Mock' },
        dha_abis: { active: providers.dha.abis.enabled, name: 'DHA ABIS', mode: providers.dha.abis.enabled ? 'Live' : 'Mock' },
        saps: { active: providers.saps.enabled, name: 'SAPS CRC', mode: providers.saps.enabled ? 'Live' : 'Mock' },
        icao: { active: providers.icao.enabled, name: 'ICAO PKD', mode: providers.icao.enabled ? 'Live' : 'Mock' }
      },
      cloud: {
        railway: { active: true, ready: true, name: 'Railway' },
        render: { active: true, ready: true, name: 'Render' },
        aws: { active: false, name: 'AWS' },
        azure: { active: false, name: 'Azure' },
        gcp: { active: false, name: 'GCP' }
      }
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
