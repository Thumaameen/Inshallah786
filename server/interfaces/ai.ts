import { ChatCompletionChunk, ChatCompletion } from 'openai/resources';
import { Stream } from 'openai/streaming';

export type AIResponse = {
  success: boolean;
  provider: 'openai' | 'anthropic' | 'custom';
  content?: string;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: string;
};

export type AIStreamResponse = Stream<ChatCompletionChunk>;

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export type AICompletion = ChatCompletion | Stream<ChatCompletionChunk>;