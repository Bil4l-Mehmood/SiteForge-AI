/**
 * Runtime WebsiteDocument Validator & Security Guard
 *
 * Enforces canonical schema constraints, safe URLs, SSRF prevention,
 * unique paths/IDs, and section-specific content integrity using Zod and business rules.
 */

import { z } from 'zod';
import {
  WebsiteDocument,
  WebsiteDocumentSchema,
  SectionType,
  HEX_COLOR_REGEX,
} from '../src/types/schema';
import { migrateToWebsiteDocument, ALLOWED_SECTION_TYPES } from '../src/types/migration';

export { ALLOWED_SECTION_TYPES };

export interface ValidationSuccess {
  valid: true;
  document: WebsiteDocument;
  specification: WebsiteDocument; // Alias for backward compatibility
}

export interface ValidationFailure {
  valid: false;
  error: string;
  details?: z.ZodIssue[];
  document?: undefined;
  specification?: undefined;
}

export type ValidationOutcome = ValidationSuccess | ValidationFailure;

/**
 * Checks whether an IP or hostname is private/internal (SSRF defense)
 */
export function isInternalHost(hostname: string): boolean {
  if (!hostname || typeof hostname !== 'string') return true;
  const clean = hostname.toLowerCase().trim().replace(/^\[|\]$/g, '');

  if (
    clean === 'localhost' ||
    clean === '127.0.0.1' ||
    clean === '0.0.0.0' ||
    clean === '::1' ||
    clean === '::' ||
    clean === 'metadata.google.internal' ||
    clean === '169.254.169.254' ||
    clean.endsWith('.internal') ||
    clean.endsWith('.local') ||
    clean.endsWith('.localhost')
  ) {
    return true;
  }

  // Handle IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (clean.startsWith('::ffff:')) {
    const rest = clean.replace('::ffff:', '');
    if (
      rest.startsWith('7f') ||
      rest.startsWith('127.') ||
      rest.startsWith('10.') ||
      rest.startsWith('192.168.') ||
      rest.startsWith('172.') ||
      rest.startsWith('0.')
    ) {
      return true;
    }
    return isInternalHost(rest);
  }

  // Handle integer IP (e.g. 2130706433 is 127.0.0.1)
  if (/^\d+$/.test(clean)) {
    const num = Number(clean);
    if (!isNaN(num) && num >= 0 && num <= 4294967295) {
      const b1 = (num >>> 24) & 255;
      const b2 = (num >>> 16) & 255;
      return isInternalHost(`${b1}.${b2}.${(num >>> 8) & 255}.${num & 255}`);
    }
    return true;
  }

  // IPv4 private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, 127.0.0.0/8, 0.0.0.0/8)
  const parts = clean.split('.').map((p) => {
    // Handle hex/octal notation
    if (p.startsWith('0x') || p.startsWith('0X')) return parseInt(p, 16);
    if (p.startsWith('0') && p.length > 1) return parseInt(p, 8);
    return Number(p);
  });

  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 0) return true;
  }

  return false;
}

/**
 * Validates that a string is a safe URL.
 * Rejects javascript:, data:, vbscript:, file:, protocol-relative URLs,
 * and dangerous local network targets (SSRF).
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Strip control characters, zero-width chars, and null bytes
  const sanitized = url.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '').trim();
  if (!sanitized) return false;

  // Safe internal fragment anchors (e.g. #, #features, #contact)
  if (sanitized.startsWith('#')) {
    return /^#[a-zA-Z0-9_\-]*$/.test(sanitized);
  }

  // Protocol-relative URLs (e.g. //evil.com or /\evil.com) are unsafe
  if (sanitized.startsWith('//') || sanitized.startsWith('/\\') || sanitized.startsWith('\\/')) {
    return false;
  }

  // Safe internal path routes (e.g. /about, /#features, /services/cloud#team)
  if (sanitized.startsWith('/')) {
    return /^\/[a-zA-Z0-9_\-./#]*$/.test(sanitized) && !sanitized.includes('..');
  }

  // Check scheme
  const colonIndex = sanitized.indexOf(':');
  if (colonIndex !== -1) {
    const scheme = sanitized.substring(0, colonIndex).toLowerCase().trim();
    if (['javascript', 'vbscript', 'data', 'blob', 'file', 'about', 'ws', 'wss'].includes(scheme)) {
      return false;
    }
    if (scheme === 'mailto') {
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(sanitized.substring(7));
    }
    if (scheme === 'tel') {
      return /^\+?[0-9\s\-()]+$/.test(sanitized.substring(4));
    }
    if (scheme !== 'http' && scheme !== 'https') {
      return false;
    }
  } else {
    // Relative string without leading slash or hash is not a safe canonical URL
    return false;
  }

  // Parse HTTP/HTTPS URL
  try {
    const parsed = new URL(sanitized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    // SSRF defense: Prevent requests to local network, localhost, and cloud metadata
    if (isInternalHost(parsed.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates and normalizes raw AI output into a canonical WebsiteDocument.
 */
export function validateWebsiteDocument(rawInput: unknown): ValidationOutcome {
  if (!rawInput || typeof rawInput !== 'object') {
    return { valid: false, error: 'Input must be a valid JSON object.' };
  }

  // Reject malformed non-array pages if explicitly provided
  const rawObj = rawInput as Record<string, unknown>;
  if (rawObj.pages !== undefined && !Array.isArray(rawObj.pages)) {
    return { valid: false, error: 'The pages field must be an array.' };
  }

  // Reject invalid theme hex colors provided in raw input
  if (rawObj.theme && typeof rawObj.theme === 'object') {
    const rawTheme = rawObj.theme as Record<string, unknown>;
    for (const [key, val] of Object.entries(rawTheme)) {
      if (key.endsWith('Color') && typeof val === 'string') {
        if (!HEX_COLOR_REGEX.test(val.trim())) {
          return {
            valid: false,
            error: `Invalid theme color hex code "${val}" in ${key}. Must be a valid 3- or 6-character hex color.`,
          };
        }
      }
    }
  }

  // Pre-process and normalize raw structure (ensures IDs, defaults, and sanitization)
  const normalized = migrateToWebsiteDocument(rawInput);
  if (!normalized) {
    return {
      valid: false,
      error: 'Could not normalize input: title is missing or specification structure is invalid.',
    };
  }

  // Enforce theme hex color validation
  if (normalized.theme) {
    const colors = [
      normalized.theme.primaryColor,
      normalized.theme.secondaryColor,
      normalized.theme.backgroundColor,
      normalized.theme.surfaceColor,
      normalized.theme.textColor,
      normalized.theme.mutedTextColor,
      normalized.theme.accentColor,
    ];
    for (const c of colors) {
      if (typeof c === 'string' && !HEX_COLOR_REGEX.test(c.trim())) {
        return {
          valid: false,
          error: `Invalid theme color hex code "${c}". Must be a valid 3- or 6-character hex color.`,
        };
      }
    }
  }

  // Execute strict Zod schema validation
  const parseResult = WebsiteDocumentSchema.safeParse(normalized);
  if (!parseResult.success) {
    const formattedError = parseResult.error.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    return {
      valid: false,
      error: `Schema validation failed: ${formattedError}`,
      details: parseResult.error.issues,
    };
  }

  const doc = parseResult.data;

  // Semantic Rule 0: Maximum length bounds for untrusted text fields
  if (doc.title && doc.title.length > 200) {
    return { valid: false, error: 'Document title exceeds maximum length of 200 characters.' };
  }
  if (doc.description && doc.description.length > 1500) {
    return { valid: false, error: 'Document description exceeds maximum length of 1500 characters.' };
  }

  // Semantic Rule 1: Page Routes must be unique and normalized
  const seenPaths = new Set<string>();
  for (let i = 0; i < doc.pages.length; i++) {
    const page = doc.pages[i];
    if (page.name && page.name.length > 100) {
      return { valid: false, error: `Page name "${page.name.slice(0, 30)}..." exceeds 100 characters.` };
    }
    if (page.path && page.path.length > 100) {
      return { valid: false, error: `Page path "${page.path.slice(0, 30)}..." exceeds 100 characters.` };
    }
    let path = page.path.trim().toLowerCase();

    // Ensure first page is "/"
    if (i === 0 && path !== '/') {
      path = '/';
      page.path = '/';
    }

    if (seenPaths.has(path)) {
      return {
        valid: false,
        error: `Duplicate page route detected: "${path}". Every page must have a unique path.`,
      };
    }
    seenPaths.add(path);
  }

  // Semantic Rule 2: Section IDs and Page IDs must be unique
  const seenIds = new Set<string>();
  seenIds.add(doc.id);

  for (const page of doc.pages) {
    if (seenIds.has(page.id)) {
      page.id = `page_${Math.random().toString(36).substring(2, 9)}`;
    }
    seenIds.add(page.id);

    for (const section of page.sections) {
      // Validate section type is supported
      if (!ALLOWED_SECTION_TYPES.includes(section.type)) {
        return {
          valid: false,
          error: `Unsupported section type "${section.type}". Must be one of: ${ALLOWED_SECTION_TYPES.join(', ')}`,
        };
      }

      if (seenIds.has(section.id)) {
        section.id = `sec_${Math.random().toString(36).substring(2, 9)}`;
      }
      seenIds.add(section.id);

      // Validate safe URLs inside section content
      const content = section.content as Record<string, unknown>;
      if (typeof content.buttonLink === 'string' && !isSafeUrl(content.buttonLink)) {
        return {
          valid: false,
          error: `Unsafe or invalid URL detected in section ${section.type}: "${content.buttonLink}"`,
        };
      }
      if (content.primaryCta && typeof content.primaryCta === 'object') {
        const cta = content.primaryCta as Record<string, unknown>;
        if (typeof cta.href === 'string' && !isSafeUrl(cta.href)) {
          return {
            valid: false,
            error: `Unsafe or invalid CTA URL in section ${section.type}: "${cta.href}"`,
          };
        }
      }
      if (content.secondaryCta && typeof content.secondaryCta === 'object') {
        const cta = content.secondaryCta as Record<string, unknown>;
        if (typeof cta.href === 'string' && !isSafeUrl(cta.href)) {
          return {
            valid: false,
            error: `Unsafe or invalid secondary CTA URL in section ${section.type}: "${cta.href}"`,
          };
        }
      }
      if (Array.isArray(content.links)) {
        for (const link of content.links) {
          if (link && typeof link === 'object' && typeof link.href === 'string') {
            if (!isSafeUrl(link.href)) {
              return {
                valid: false,
                error: `Unsafe link URL in footer/section: "${link.href}"`,
              };
            }
          }
        }
      }
    }
  }

  // Semantic Rule 3: Navigation URLs must be safe
  if (doc.navigation) {
    if (Array.isArray(doc.navigation.items)) {
      for (const item of doc.navigation.items) {
        if (!isSafeUrl(item.href)) {
          return {
            valid: false,
            error: `Unsafe navigation link URL: "${item.href}"`,
          };
        }
      }
    }
    if (doc.navigation.primaryCta && !isSafeUrl(doc.navigation.primaryCta.href)) {
      return {
        valid: false,
        error: `Unsafe navigation CTA URL: "${doc.navigation.primaryCta.href}"`,
      };
    }
  }

  return { valid: true, document: doc, specification: doc };
}

// Backwards-compatible alias
export const validateWebsiteSpecification = validateWebsiteDocument;
