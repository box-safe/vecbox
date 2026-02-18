import { logger } from './logger';

/**
 * Simple HTTP client for Llama.cpp API communication
 * No mocks - real HTTP requests only
 */
export class HttpClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl?: string, timeout: number = 30000) {
    this.baseUrl = baseUrl || '';
    this.timeout = timeout;
  }

  async post(endpoint: string, data: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    logger.debug(`HTTP POST to: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      logger.debug(`HTTP response received from: ${url}`);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`HTTP request timeout after ${this.timeout}ms`);
      }
      
      logger.error(`HTTP request failed to ${url}: ${error}`);
      throw error;
    }
  }

  async get(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    logger.debug(`HTTP GET to: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      logger.debug(`HTTP response received from: ${url}`);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`HTTP request timeout after ${this.timeout}ms`);
      }
      
      logger.error(`HTTP request failed to ${url}: ${error}`);
      throw error;
    }
  }

  async healthCheck(endpoint: string): Promise<boolean> {
    try {
      await this.get(endpoint);
      return true;
    } catch (error) {
      logger.debug(`Health check failed: ${error}`);
      return false;
    }
  }
}
