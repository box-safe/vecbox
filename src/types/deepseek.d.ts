declare module 'deepseek' {
  export class DeepSeek {
    constructor(options: { apiKey: string; baseURL?: string; timeout?: number });
    embeddings: {
      create: (options: { model: string; input: string | string[] }) => Promise<{
        data: Array<{ embedding: number[]; model: string }>;
        model: string;
        usage?: {
          prompt_tokens: number;
          total_tokens: number;
        };
      }>;
    };
  }
}
