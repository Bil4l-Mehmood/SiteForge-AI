/**
 * Core type definitions for SiteForge AI
 *
 * Re-exports the canonical WebsiteDocument schema, presets, and domain models.
 */

export * from './schema';
export * from './presets';
export * from './migration';

import { WebsiteDocument } from './schema';

export type GenerationStatus = 'idle' | 'queued' | 'generating' | 'ready' | 'error';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile' | 'custom';

export type DeviceOrientation = 'portrait' | 'landscape';

export type ZoomLevel = 'fit' | 100 | 75 | 50;

export type ViewMode = 'preview' | 'code';

export type AppView = 'home' | 'projects' | 'builder' | 'about' | 'contact';

// Alias for backwards compatibility with earlier milestones
export type WebsiteSpecification = WebsiteDocument;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isPlaceholder?: boolean;
  isError?: boolean;
  retryPrompt?: string;
}

export interface DocumentVersion {
  id: string;
  versionNumber?: number;
  document: WebsiteDocument;
  timestamp: string;
  label: string; // e.g. "Initial Generation" or "Edit: Change primary color..."
  summary?: string; // Summary of changes made in this version
  changeType?: 'generation' | 'edit' | 'revert' | 'manual';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  initialPrompt: string;
  createdAt: string;
  updatedAt: string;
  status: GenerationStatus;
  document?: WebsiteDocument;
  specification?: WebsiteDocument;
  selectedPresetId?: string;
  currentPagePath?: string;
  chatHistory: ChatMessage[];
  documentHistory?: DocumentVersion[];
  activeVersionId?: string;
  schemaVersion?: string;
}

export interface ExamplePrompt {
  id: string;
  category: 'Business' | 'Portfolio' | 'SaaS' | 'E-Commerce';
  title: string;
  prompt: string;
  tagline: string;
  presetId?: string;
}
