declare module '@xenova/transformers' {
  export function pipeline(task: string, model: string): Promise<unknown>;
  export const env: {
    cacheDir: string;
    allowLocalModels: boolean;
  };
}
