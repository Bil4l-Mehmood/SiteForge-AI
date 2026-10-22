/**
 * Client-Side AI Service
 *
 * Communicates with the secure server-side Gemini API proxy (/api/generate-website).
 * Strictly prevents any client-side exposure of API keys.
 */

import { WebsiteDocument } from '../types/schema';
import { GenerationPreset, GENERATION_PRESETS } from '../types/presets';

export interface GenerationRequest {
  prompt: string;
  projectId?: string;
  presetId?: string;
}

export interface GenerationResult {
  success: boolean;
  message: string;
  code?: string;
  document?: WebsiteDocument;
  specification?: WebsiteDocument; // Alias for backward compatibility
}

export interface EditRequest {
  instruction: string;
  currentDocument: WebsiteDocument;
  history?: Array<{ sender: 'user' | 'assistant'; content: string }>;
  projectId?: string;
}

export interface EditResult {
  success: boolean;
  message: string;
  changeSummary?: string;
  code?: string;
  document?: WebsiteDocument;
  specification?: WebsiteDocument;
}

export interface AIStatusInfo {
  status: 'online' | 'offline';
  configured: boolean;
  model: string;
  fallbackModel?: string;
  supportedSections?: string[];
}

export class AIService {
  /**
   * Calls the secure server-side API to generate a canonical WebsiteDocument.
   */
  static async generateWebsite(request: GenerationRequest): Promise<GenerationResult> {
    try {
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          projectId: request.projectId,
          presetId: request.presetId,
        }),
        signal: AbortSignal.timeout(45000),
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        if (response.status === 504) {
          return {
            success: false,
            code: 'GATEWAY_TIMEOUT',
            message: 'The AI generation request took too long to complete. Please click Retry to generate again.',
          };
        }
        if (response.status === 503) {
          return {
            success: false,
            code: 'SERVICE_UNAVAILABLE',
            message: 'The AI model is currently experiencing high demand. Please click Retry to try again.',
          };
        }
        return {
          success: false,
          code: 'SERVER_ERROR',
          message: `Generation failed (HTTP ${response.status}). Please click Retry to try again.`,
        };
      }

      if (!response.ok || !data.success) {
        return {
          success: false,
          code: data.code || 'SERVER_ERROR',
          message: data.message || 'Website generation failed on the server.',
        };
      }

      const doc = data.document || data.specification;

      return {
        success: true,
        message: data.message || 'WebsiteDocument synthesized and validated successfully.',
        document: doc,
        specification: doc,
      };
    } catch (err: unknown) {
      console.error('[AIService Frontend Error]', err);
      const isTimeout =
        (err instanceof Error && (err.name === 'TimeoutError' || err.message.includes('timeout'))) ||
        (err && typeof err === 'object' && (err as any).name === 'AbortError');
      return {
        success: false,
        code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout
          ? 'The AI generation request timed out. Please click Retry to try again.'
          : 'Unable to reach the SiteForge AI generation service. Please click Retry to try again.',
      };
    }
  }

  /**
   * Calls the secure server-side API to perform conversational edits on an existing WebsiteDocument.
   */
  static async editWebsite(request: EditRequest): Promise<EditResult> {
    try {
      const response = await fetch('/api/edit-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instruction: request.instruction,
          currentDocument: request.currentDocument,
          history: request.history || [],
          projectId: request.projectId,
        }),
        signal: AbortSignal.timeout(45000),
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        if (response.status === 504) {
          return {
            success: false,
            code: 'GATEWAY_TIMEOUT',
            message: 'The editing request took too long to complete. Please click Retry to try again.',
          };
        }
        return {
          success: false,
          code: 'SERVER_ERROR',
          message: `Editing failed (HTTP ${response.status}). Please click Retry to try again.`,
        };
      }

      if (!response.ok || !data.success) {
        return {
          success: false,
          code: data.code || 'SERVER_ERROR',
          message: data.message || 'Website editing failed on the server.',
        };
      }

      const doc = data.document || data.specification;

      return {
        success: true,
        message: data.message || 'Website updated successfully.',
        changeSummary: data.changeSummary,
        document: doc,
        specification: doc,
      };
    } catch (err: unknown) {
      console.error('[AIService Frontend Edit Error]', err);
      const isTimeout =
        (err instanceof Error && (err.name === 'TimeoutError' || err.message.includes('timeout'))) ||
        (err && typeof err === 'object' && (err as any).name === 'AbortError');
      return {
        success: false,
        code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout
          ? 'The AI editing request timed out. Please click Retry to try again.'
          : 'Unable to reach the SiteForge AI editing service. Please click Retry to try again.',
      };
    }
  }

  /**
   * Checks whether the server Gemini integration is operational.
   */
  static async checkStatus(): Promise<AIStatusInfo> {
    try {
      const res = await fetch('/api/ai/status');
      if (!res.ok) {
        return { status: 'offline', configured: false, model: 'gemini-3.8-flash' };
      }
      const data = await res.json();
      return {
        status: data.status || 'online',
        configured: Boolean(data.configured),
        model: data.model || 'gemini-3.8-flash',
        fallbackModel: data.fallbackModel,
        supportedSections: data.supportedSections,
      };
    } catch {
      return { status: 'offline', configured: false, model: 'gemini-3.8-flash' };
    }
  }

  /**
   * Returns available generation presets.
   */
  static getPresets(): GenerationPreset[] {
    return Object.values(GENERATION_PRESETS);
  }
}
