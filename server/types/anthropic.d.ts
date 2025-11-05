declare module '@anthropic-ai/sdk' {
    export class Claude {
        constructor(config: { apiKey: string });
        messages: {
            create(params: {
                model: string;
                max_tokens: number;
                messages: Array<{ role: string; content: string }>;
                temperature?: number;
                system?: string;
                metadata?: any;
            }): Promise<any>;
        };
    }
}