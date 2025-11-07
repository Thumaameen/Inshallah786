declare module '@anthropic-ai/sdk' {
  export class Anthropic {
    constructor(config: { apiKey: string });
    messages: {
      create(params: {
        model: string;
        messages: Array<{ role: string; content: string }>;
        maxTokens?: number;
        temperature?: number;
      }): Promise<{
        content: Array<{ text: string }>;
      }>;
    };
  }
}