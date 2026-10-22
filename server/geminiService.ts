import { GoogleGenAI, Type } from '@google/genai';
import { WebsiteDocument } from '../src/types/schema';
import { validateWebsiteDocument, ALLOWED_SECTION_TYPES } from './validator';
import { getPresetById } from '../src/types/presets';

export interface GenerationServiceError {
  status: number;
  code: string;
  message: string;
}

export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  totalTimeoutMs?: number;
}

export interface ErrorClassification {
  isTransient: boolean;
  isAuth: boolean;
  isInvalid: boolean;
  status: number;
  retryAfterMs?: number;
  message: string;
}

export class GeminiGenerationService {
  static get primaryModel(): string {
    return process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  }

  static get fallbackModel(): string | undefined {
    const configured = process.env.GEMINI_FALLBACK_MODEL;
    if (configured !== undefined) {
      return configured.trim() === 'none' || configured.trim() === '' ? undefined : configured.trim();
    }
    return 'gemini-3.8-flash';
  }

  /**
   * Classifies an error to determine whether it is transient and eligible for retry.
   */
  static classifyError(error: unknown): ErrorClassification {
    const rawMsg =
      error instanceof Error
        ? error.message
        : error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string'
        ? (error as any).message
        : String(error);

    const errorStatus =
      error && typeof error === 'object' && 'status' in error
        ? Number((error as any).status)
        : error && typeof error === 'object' && 'statusCode' in error
        ? Number((error as any).statusCode)
        : 500;

    let retryAfterMs: number | undefined;

    // Check for Retry-After header or property
    const headers =
      error && typeof error === 'object' && 'response' in error && (error as any).response && typeof (error as any).response === 'object'
        ? (error as any).response.headers
        : error && typeof error === 'object' && 'headers' in error
        ? (error as any).headers
        : undefined;

    let retryHeaderValue: string | undefined;
    if (headers) {
      if (typeof headers.get === 'function') {
        retryHeaderValue = headers.get('retry-after') || headers.get('Retry-After');
      } else if (typeof headers === 'object') {
        retryHeaderValue = headers['retry-after'] || headers['Retry-After'];
      }
    }
    if (!retryHeaderValue && error && typeof error === 'object' && 'retryAfter' in error) {
      retryHeaderValue = String((error as any).retryAfter);
    }

    if (retryHeaderValue) {
      const parsedSeconds = parseInt(retryHeaderValue, 10);
      if (!isNaN(parsedSeconds)) {
        retryAfterMs = parsedSeconds * 1000;
      } else {
        const parsedDate = new Date(retryHeaderValue).getTime();
        if (!isNaN(parsedDate)) {
          retryAfterMs = Math.max(0, parsedDate - Date.now());
        }
      }
    }

    const isAuth =
      errorStatus === 401 ||
      errorStatus === 403 ||
      /API_KEY_INVALID|PERMISSION_DENIED|UNAUTHENTICATED|UNAUTHORIZED|MISSING_API_KEY/i.test(rawMsg);

    const isInvalid =
      errorStatus === 400 ||
      /INVALID_ARGUMENT|BAD_REQUEST|PROMPT_TOO_LONG|EMPTY_PROMPT/i.test(rawMsg);

    const isTransient =
      !isAuth &&
      !isInvalid &&
      (errorStatus === 503 ||
        errorStatus === 429 ||
        errorStatus === 500 ||
        errorStatus === 502 ||
        errorStatus === 504 ||
        /503|unavailable|high demand|spikes in demand|overloaded|429|resource_exhausted|rate limit|quota|econnreset|etimedout|socket hang up|fetch failed|network error/i.test(
          rawMsg
        ));

    return {
      isTransient,
      isAuth,
      isInvalid,
      status: errorStatus,
      retryAfterMs,
      message: rawMsg,
    };
  }

  /**
   * Computes backoff delay using exponential backoff with jitter and respects Retry-After.
   */
  static calculateBackoffDelay(
    attempt: number,
    initialDelayMs: number = 1000,
    maxDelayMs: number = 8000,
    backoffMultiplier: number = 2,
    retryAfterMs?: number
  ): number {
    if (typeof retryAfterMs === 'number' && retryAfterMs > 0) {
      return Math.min(retryAfterMs, maxDelayMs);
    }
    const base = initialDelayMs * Math.pow(backoffMultiplier, attempt);
    const clamped = Math.min(base, maxDelayMs);
    // Add jitter between 0.8 and 1.2 (±20%)
    const jitter = 0.8 + Math.random() * 0.4;
    return Math.round(clamped * jitter);
  }

  /**
   * Executes a model generation operation with an automatic retry strategy
   * for transient errors (503, 429, 5xx) with exponential backoff and jitter,
   * respecting Retry-After headers, maximum retry count, and total time limits.
   * If the primary model remains unavailable, automatically attempts the configured fallback model.
   */
  static async callWithRetryAndFallback(
    operation: (modelName: string) => Promise<string>,
    customOptions?: {
      primaryModel?: string;
      fallbackModel?: string;
      retryConfig?: RetryConfig;
    }
  ): Promise<{ text: string; modelUsed: string }> {
    const primary = customOptions?.primaryModel || this.primaryModel;
    const fallback =
      customOptions?.fallbackModel !== undefined ? customOptions.fallbackModel : this.fallbackModel;

    const retryConfig: Required<RetryConfig> = {
      maxRetries: customOptions?.retryConfig?.maxRetries ?? (process.env.NODE_ENV === 'test' ? 2 : 2),
      initialDelayMs: customOptions?.retryConfig?.initialDelayMs ?? (process.env.NODE_ENV === 'test' ? 10 : 1000),
      maxDelayMs: customOptions?.retryConfig?.maxDelayMs ?? (process.env.NODE_ENV === 'test' ? 50 : 5000),
      backoffMultiplier: customOptions?.retryConfig?.backoffMultiplier ?? 2,
      totalTimeoutMs: customOptions?.retryConfig?.totalTimeoutMs ?? 50000,
    };

    const startTime = Date.now();
    const candidateModels: string[] = [primary];
    if (fallback && fallback !== primary && fallback !== 'none') {
      candidateModels.push(fallback);
    }

    let lastError: unknown = null;

    for (let modelIdx = 0; modelIdx < candidateModels.length; modelIdx++) {
      const currentModel = candidateModels[modelIdx];
      const isFallback = modelIdx > 0;

      if (isFallback) {
        console.warn(
          `[GeminiGenerationService] Primary model "${primary}" unavailable. Attempting fallback model: "${currentModel}"...`
        );
      }

      for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
        // Enforce total overall timeout
        const elapsed = Date.now() - startTime;
        if (elapsed >= retryConfig.totalTimeoutMs) {
          const timeoutErr = new Error(
            'The AI generation service timed out. Please try again shortly or with a more concise prompt.'
          );
          (timeoutErr as any).status = 504;
          (timeoutErr as any).code = 'GATEWAY_TIMEOUT';
          throw timeoutErr;
        }

        try {
          const text = await operation(currentModel);
          if (isFallback) {
            console.log(
              `[GeminiGenerationService] Successfully generated output using fallback model: "${currentModel}".`
            );
          }
          return { text, modelUsed: currentModel };
        } catch (err: unknown) {
          lastError = err;
          const classification = this.classifyError(err);

          // If error is fatal/non-retryable (invalid request, authentication error, prompt too long, etc.),
          // do not retry or fallback - fail immediately!
          if (classification.isAuth || classification.isInvalid) {
            this.handleFatalError(err);
          }

          // If not transient, do not retry this model
          if (!classification.isTransient) {
            break;
          }

          // Fast failover to next model if this model timed out or had high demand
          if (
            (classification.status === 504 ||
              classification.status === 503 ||
              classification.message.includes('high demand') ||
              classification.message.includes('timed out')) &&
            modelIdx < candidateModels.length - 1
          ) {
            console.warn(
              `[GeminiGenerationService] Model "${currentModel}" experienced high demand/timeout. Fast-failing over to "${candidateModels[modelIdx + 1]}"...`
            );
            break;
          }

          // If transient error and retries remain for this model
          if (attempt < retryConfig.maxRetries) {
            const delay = this.calculateBackoffDelay(
              attempt,
              retryConfig.initialDelayMs,
              retryConfig.maxDelayMs,
              retryConfig.backoffMultiplier,
              classification.retryAfterMs
            );

            // Check if delay fits within totalTimeoutMs
            const remaining = retryConfig.totalTimeoutMs - (Date.now() - startTime);
            if (remaining <= 0) {
              const timeoutErr = new Error(
                'The AI generation service timed out. Please try again shortly or with a more concise prompt.'
              );
              (timeoutErr as any).status = 504;
              (timeoutErr as any).code = 'GATEWAY_TIMEOUT';
              throw timeoutErr;
            }

            const safeDelay = Math.min(delay, Math.max(1, remaining - 50));
            const sanitizedMsg = this.sanitizeErrorMessage(err);
            console.warn(
              `[GeminiGenerationService] Transient error on model "${currentModel}" (attempt ${
                attempt + 1
              }/${retryConfig.maxRetries + 1}): ${sanitizedMsg}. Retrying in ${safeDelay}ms...`
            );

            await new Promise((res) => setTimeout(res, safeDelay));
          }
        }
      }
    }

    // Check if total timeout was exceeded
    if (Date.now() - startTime >= retryConfig.totalTimeoutMs) {
      const timeoutErr = new Error(
        'The AI generation service timed out. Please try again shortly or with a more concise prompt.'
      );
      (timeoutErr as any).status = 504;
      (timeoutErr as any).code = 'GATEWAY_TIMEOUT';
      throw timeoutErr;
    }

    // All models and retries exhausted
    this.handleFatalError(lastError);
  }

  /**
   * Initializes the Google GenAI client securely using server environment variables.
   */
  private static getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
      const err: GenerationServiceError = {
        status: 503,
        code: 'MISSING_API_KEY',
        message: 'GEMINI_API_KEY secret is not configured on the server. Please check your AI Studio secrets.',
      };
      throw err;
    }

    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  /**
   * Enforces a hard execution timeout on asynchronous promises to avoid hanging requests.
   */
  private static async withTimeout<T>(promise: Promise<T>, timeoutMs: number = 60000): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        const timeoutErr = new Error('The AI generation service timed out. Please try again with a more concise prompt.');
        (timeoutErr as any).status = 504;
        (timeoutErr as any).code = 'GATEWAY_TIMEOUT';
        reject(timeoutErr);
      }, timeoutMs);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer!);
    }
  }

  /**
   * Generates a canonical WebsiteDocument conforming to the canonical schema.
   */
  static async generateWebsite(prompt: string, presetId?: string): Promise<WebsiteDocument> {
    const trimmed = prompt.trim();
    if (!trimmed) {
      const err: GenerationServiceError = {
        status: 400,
        code: 'EMPTY_PROMPT',
        message: 'Prompt cannot be empty.',
      };
      throw err;
    }

    if (trimmed.length > 2500) {
      const err: GenerationServiceError = {
        status: 400,
        code: 'PROMPT_TOO_LONG',
        message: 'Prompt exceeds maximum allowed length of 2500 characters.',
      };
      throw err;
    }

    const ai = this.getClient();
    const preset = getPresetById(presetId);

    // Build context-aware system instruction incorporating canonical schema & preset
    const presetGuidance = preset
      ? `\nPRESET ACTIVE: "${preset.name}". Recommended section flow: ${preset.recommendedSections.join(
          ', '
        )}. Domain guidelines: ${preset.guidelines}`
      : '';

    const systemInstruction = `You are SiteForge AI's Principal Website Architect.
Transform natural language user prompts into a complete, canonical WebsiteDocument structured specification.${presetGuidance}

MANDATORY SPECIFICATION CONTRACT:
1. Category must be one of: 'business', 'portfolio', 'saas', 'agency', 'ecommerce', 'blog', 'other'.
2. Global theme:
   - Provide valid 6-character hex colors (primaryColor, secondaryColor, backgroundColor, surfaceColor, textColor, mutedTextColor, accentColor).
   - fontFamily, headingFont, and bodyFont must be chosen from: 'Plus Jakarta Sans', 'Outfit', 'Manrope', 'DM Sans', 'Bricolage Grotesque', 'Public Sans'.
   - borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'.
   - spacing: 'compact' | 'comfortable' | 'spacious'.
   - buttonStyle: 'rounded' | 'pill' | 'square' | 'outline'.
   - mode: 'light' | 'dark'.
3. Navigation structure:
   - brandName: matching the site title or company name.
   - items: list of 3-5 navigation links with clean labels and page/section hrefs (e.g. "/", "/about", "#features").
   - primaryCta: prominent navbar call to action (e.g., "Get Started", "Book a Demo").
4. Metadata & SEO:
   - title tag, description (1-2 sentences), keywords array, ogTitle, ogDescription.
5. Pages:
   - Exactly 1 homepage with path "/". Other page paths must start with "/" (e.g. "/about", "/services", "/contact").
   - Max 6 pages.
6. Sections:
   - Section 'type' must strictly be one of these supported types:
     ${ALLOWED_SECTION_TYPES.join(', ')}.
   - layout: 'centered' | 'split' | 'grid' | 'cards' | 'linear'.
   - 'content' must be rich, domain-authentic, professional copy matching the section type.
   - For 'testimonials': clearly provide realistic customer review placeholders without claiming verified living persons.
   - For 'pricing': provide realistic tier values without claiming real transaction availability.
   - For 'contact': include form field types (name, email, message) with submission notice.
   - For 'ecommerce': generate storefront product showcases only; do not invent real checkout or payment processing.
   - Never inject arbitrary HTML tags, <script> tags, or javascript: URLs. All URLs must be internal (/#...) or safe paths (/...).
7. Return strictly valid JSON conforming to the responseSchema.`;

    const responseSchema = this.getDocumentResponseSchema();

    // Execution with controlled retry on transient errors and schema recovery attempt
    let lastError: string | null = null;

    for (let schemaAttempt = 1; schemaAttempt <= 2; schemaAttempt++) {
      const userPrompt =
        schemaAttempt === 1
          ? `Create a canonical website specification for: "${trimmed}"`
          : `Your previous output had validation errors: ${lastError}. Please output strictly valid canonical WebsiteDocument JSON for: "${trimmed}"`;

      const { text } = await this.callWithRetryAndFallback(async (modelName) => {
        const response = await this.withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema,
              temperature: schemaAttempt === 1 ? 0.7 : 0.3,
            },
          }),
          25000
        );

        const responseText = response.text;
        if (!responseText) {
          throw new Error('Gemini returned an empty response.');
        }
        return responseText;
      });

      try {
        const parsed = JSON.parse(text.trim());
        const outcome = validateWebsiteDocument(parsed);

        if (outcome.valid) {
          outcome.document.presetId = presetId;
          return outcome.document;
        }

        lastError = outcome.error;
        console.warn(`[GeminiGenerationService] Validation attempt ${schemaAttempt} failed:`, outcome.error);
      } catch (parseErr) {
        lastError = parseErr instanceof Error ? parseErr.message : String(parseErr);
        console.warn(`[GeminiGenerationService] Parsing attempt ${schemaAttempt} failed:`, lastError);
      }
    }

    // If recovery attempt also failed, throw a descriptive validation error
    throw {
      status: 422,
      code: 'SCHEMA_VALIDATION_FAILED',
      message: lastError || 'Website specification failed runtime schema validation.',
    };
  }

  /**
   * Applies conversational edits to an existing WebsiteDocument while preserving
   * untouched content, layout, styling, and schema integrity.
   */
  static async editWebsite(
    instruction: string,
    currentDocument: WebsiteDocument,
    history: Array<{ sender: 'user' | 'assistant'; content: string }> = []
  ): Promise<{ document: WebsiteDocument; changeSummary: string }> {
    const trimmedInstruction = instruction.trim();
    if (!trimmedInstruction) {
      const err: GenerationServiceError = {
        status: 400,
        code: 'EMPTY_INSTRUCTION',
        message: 'Editing instruction cannot be empty.',
      };
      throw err;
    }

    if (trimmedInstruction.length > 2500) {
      const err: GenerationServiceError = {
        status: 400,
        code: 'INSTRUCTION_TOO_LONG',
        message: 'Instruction exceeds maximum allowed length of 2500 characters.',
      };
      throw err;
    }

    const ai = this.getClient();

    // Prepare conversational history context (last 6 messages max for tight token usage)
    const recentHistory = history
      .slice(-6)
      .map((h) => `${h.sender.toUpperCase()}: ${h.content}`)
      .join('\n');

    const historyContext = recentHistory ? `\n\nRecent conversation:\n${recentHistory}` : '';

    const systemInstruction = `You are SiteForge AI's Principal Website Editor.
Your job is to update an existing canonical WebsiteDocument based precisely on the user's editing instructions.

CRITICAL EDITING PRINCIPLES:
1. TARGETED MODIFICATION:
   - Only modify the fields, theme values, pages, or sections requested by the user.
   - PRESERVE all other existing sections, content, pages, navigation, and theme attributes verbatim.
   - Do NOT reset or replace the entire website unless explicitly commanded by the user (e.g. "completely restart with a bakery website").
2. SUPPORTED SECTION TYPES:
   - Supported section types are strictly: ${ALLOWED_SECTION_TYPES.join(', ')}.
   - If user requests adding a section (e.g. "add a testimonials section below features"), insert a new section with a unique id, correct type, appropriate layout, and rich placeholder content.
   - If user requests removing a section (e.g. "remove the pricing section"), remove that section from the target page.
   - If user requests reordering sections, reorder the sections array accordingly.
3. THEME EDITS:
   - When asked to change colors (e.g. "change primary color to dark blue"), provide a valid 6-char hex code (e.g. #1E3A8A). Ensure contrast is maintained.
   - When asked to change fonts (e.g. "use modern font"), pick from: 'Plus Jakarta Sans', 'Outfit', 'Manrope', 'DM Sans', 'Bricolage Grotesque', 'Public Sans'.
   - When asked to change button style or border radius (e.g. "make buttons rounded"), update buttonStyle ('rounded'|'pill'|'square'|'outline') and/or borderRadius ('none'|'sm'|'md'|'lg'|'full').
4. CONTENT & COPY EDITS:
   - When asked to change headlines, descriptions, CTAs, or list items, update the specific section's content object while preserving other properties in that section.
5. CHANGE SUMMARY:
   - Provide a clear, concise bulleted or 1-2 sentence explanation in the 'changeSummary' property detailing exactly what was updated (e.g., "Updated primary theme color to navy blue (#1E3A8A) and adjusted hero button to match.").
6. VALIDATION CONTRACT:
   - The returned document must strictly adhere to the WebsiteDocument JSON responseSchema. No markdown, no comments, no arbitrary HTML tags.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        changeSummary: {
          type: Type.STRING,
          description: 'A concise 1-2 sentence explanation of what changes were applied.',
        },
        document: this.getDocumentResponseSchema(),
      },
      required: ['changeSummary', 'document'],
    };

    let lastError: string | null = null;

    for (let schemaAttempt = 1; schemaAttempt <= 2; schemaAttempt++) {
      const userPrompt =
        schemaAttempt === 1
          ? `USER EDIT INSTRUCTION: "${trimmedInstruction}"${historyContext}

CURRENT WEBSITE DOCUMENT JSON:
${JSON.stringify(currentDocument, null, 2)}

Apply the requested instruction to the document, maintain all other existing properties, and provide a clear changeSummary.`
          : `Your previous edit attempt had validation issues: ${lastError}. Please return the updated document strictly conforming to the schema for: "${trimmedInstruction}"`;

      const { text } = await this.callWithRetryAndFallback(async (modelName) => {
        const response = await this.withTimeout(
          ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema,
              temperature: schemaAttempt === 1 ? 0.3 : 0.1, // Lower temperature for precision edits
            },
          }),
          25000
        );

        const responseText = response.text;
        if (!responseText) {
          throw new Error('Gemini returned an empty edit response.');
        }
        return responseText;
      });

      try {
        const parsed = JSON.parse(text.trim());
        const rawDoc = parsed.document || parsed;
        const changeSummary = parsed.changeSummary || 'Website document updated according to your instructions.';

        // Preserve current document id, createdAt, and presetId if not changed
        if (currentDocument.id && !rawDoc.id) {
          rawDoc.id = currentDocument.id;
        }
        if (currentDocument.createdAt && !rawDoc.createdAt) {
          rawDoc.createdAt = currentDocument.createdAt;
        }
        rawDoc.updatedAt = new Date().toISOString();

        const outcome = validateWebsiteDocument(rawDoc);

        if (outcome.valid) {
          return {
            document: outcome.document,
            changeSummary,
          };
        }

        lastError = outcome.error;
        console.warn(`[GeminiGenerationService] Edit validation attempt ${schemaAttempt} failed:`, outcome.error);
      } catch (parseErr) {
        lastError = parseErr instanceof Error ? parseErr.message : String(parseErr);
        console.warn(`[GeminiGenerationService] Edit parsing attempt ${schemaAttempt} failed:`, lastError);
      }
    }

    throw {
      status: 422,
      code: 'EDIT_VALIDATION_FAILED',
      message: lastError || 'Edited website document failed runtime schema validation.',
    };
  }

  /**
   * Reusable response schema for canonical WebsiteDocument
   */
  private static getDocumentResponseSchema() {
    return {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING, description: 'Website title or brand name.' },
        description: { type: Type.STRING, description: '1-2 sentence site summary.' },
        category: {
          type: Type.STRING,
          description: "One of: 'business', 'portfolio', 'saas', 'agency', 'ecommerce', 'blog', 'other'.",
        },
        theme: {
          type: Type.OBJECT,
          properties: {
            primaryColor: { type: Type.STRING, description: 'Hex code e.g. #0F172A' },
            secondaryColor: { type: Type.STRING, description: 'Hex code e.g. #334155' },
            backgroundColor: { type: Type.STRING, description: 'Hex code e.g. #FFFFFF' },
            surfaceColor: { type: Type.STRING, description: 'Hex code e.g. #F8FAFC' },
            textColor: { type: Type.STRING, description: 'Hex code e.g. #0F172A' },
            mutedTextColor: { type: Type.STRING, description: 'Hex code e.g. #64748B' },
            accentColor: { type: Type.STRING, description: 'Hex code e.g. #2563EB' },
            fontFamily: { type: Type.STRING, description: "e.g. 'Plus Jakarta Sans'" },
            headingFont: { type: Type.STRING, description: "e.g. 'Plus Jakarta Sans'" },
            bodyFont: { type: Type.STRING, description: "e.g. 'DM Sans'" },
            borderRadius: { type: Type.STRING, description: "'none' | 'sm' | 'md' | 'lg' | 'full'" },
            spacing: { type: Type.STRING, description: "'compact' | 'comfortable' | 'spacious'" },
            buttonStyle: { type: Type.STRING, description: "'rounded' | 'pill' | 'square' | 'outline'" },
            mode: { type: Type.STRING, description: "'light' | 'dark'" },
          },
          required: [
            'primaryColor',
            'secondaryColor',
            'backgroundColor',
            'surfaceColor',
            'textColor',
            'mutedTextColor',
            'accentColor',
          ],
        },
        navigation: {
          type: Type.OBJECT,
          properties: {
            brandName: { type: Type.STRING },
            logoText: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  href: { type: Type.STRING },
                },
                required: ['label', 'href'],
              },
            },
            primaryCta: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                href: { type: Type.STRING },
              },
              required: ['label', 'href'],
            },
          },
          required: ['brandName', 'items'],
        },
        seo: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            ogTitle: { type: Type.STRING },
            ogDescription: { type: Type.STRING },
          },
        },
        pages: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING, description: 'Page name e.g. Home' },
              path: { type: Type.STRING, description: 'Path starting with /' },
              seo: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
              },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: {
                      type: Type.STRING,
                      description: `Must be strictly one of: ${ALLOWED_SECTION_TYPES.join(', ')}`,
                    },
                    label: { type: Type.STRING },
                    layout: { type: Type.STRING, description: "'centered' | 'split' | 'grid' | 'cards' | 'linear'" },
                    content: {
                      type: Type.OBJECT,
                      description: 'Typed content object with heading, supporting text, items, CTAs, etc.',
                      properties: {
                        heading: { type: Type.STRING },
                        supportingText: { type: Type.STRING },
                        description: { type: Type.STRING },
                        story: { type: Type.STRING },
                        mission: { type: Type.STRING },
                        primaryCta: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            href: { type: Type.STRING },
                          },
                        },
                        secondaryCta: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            href: { type: Type.STRING },
                          },
                        },
                        buttonText: { type: Type.STRING },
                        buttonLink: { type: Type.STRING },
                        badge: { type: Type.STRING },
                        disclaimer: { type: Type.STRING },
                        email: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        items: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              title: { type: Type.STRING },
                              description: { type: Type.STRING },
                              value: { type: Type.STRING },
                              label: { type: Type.STRING },
                              quote: { type: Type.STRING },
                              author: { type: Type.STRING },
                              role: { type: Type.STRING },
                              company: { type: Type.STRING },
                              icon: { type: Type.STRING },
                              price: { type: Type.STRING },
                              badge: { type: Type.STRING },
                              imageAlt: { type: Type.STRING },
                              question: { type: Type.STRING },
                              answer: { type: Type.STRING },
                            },
                          },
                        },
                        plans: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              name: { type: Type.STRING },
                              price: { type: Type.STRING },
                              billingPeriod: { type: Type.STRING },
                              description: { type: Type.STRING },
                              features: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                              },
                              isPopular: { type: Type.BOOLEAN },
                              ctaText: { type: Type.STRING },
                            },
                          },
                        },
                        steps: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              stepNumber: { type: Type.INTEGER },
                              title: { type: Type.STRING },
                              description: { type: Type.STRING },
                            },
                          },
                        },
                        members: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              name: { type: Type.STRING },
                              role: { type: Type.STRING },
                              bio: { type: Type.STRING },
                            },
                          },
                        },
                        links: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              label: { type: Type.STRING },
                              href: { type: Type.STRING },
                            },
                          },
                        },
                        brandName: { type: Type.STRING },
                        copyrightText: { type: Type.STRING },
                      },
                      required: ['heading'],
                    },
                  },
                  required: ['type', 'content'],
                },
              },
            },
            required: ['name', 'path', 'sections'],
          },
        },
      },
      required: ['title', 'description', 'theme', 'pages'],
    };
  }

  /**
   * Cleans error messages to strictly prevent leaking API keys, secrets, or internal paths.
   */
  static sanitizeErrorMessage(error: unknown): string {
    if (!error) return 'An unexpected error occurred.';
    let msg =
      error instanceof Error
        ? error.message
        : error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string'
        ? (error as any).message
        : String(error);

    // Strip actual API key if present in error message
    const currentKey = process.env.GEMINI_API_KEY;
    if (currentKey && currentKey.length > 5) {
      msg = msg.split(currentKey).join('[REDACTED_API_KEY]');
    }

    // Strip any Google API key pattern
    msg = msg.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');

    // Strip Bearer authorization headers
    msg = msg.replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED_TOKEN]');

    // Strip key query parameters in URLs e.g. ?key=... or &key=...
    msg = msg.replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED]');

    // Strip local filesystem paths
    msg = msg.replace(/(?:\/[a-zA-Z0-9._-]+)+\.(?:ts|js|json|tsx|jsx)/g, '[INTERNAL_PATH]');

    // Strip V8 stack traces
    msg = msg.replace(/\s+at\s+.+/g, '');

    // Trim length to avoid dumping huge internal objects
    if (msg.length > 400) {
      msg = msg.slice(0, 397) + '...';
    }

    return msg.trim() || 'An unexpected error occurred.';
  }

  private static handleFatalError(error: unknown): never {
    const rawMsg =
      error instanceof Error
        ? error.message
        : error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string'
        ? (error as any).message
        : String(error);
    const sanitizedMsg = this.sanitizeErrorMessage(error);
    const errorCode = error && typeof error === 'object' && 'code' in error ? String((error as any).code) : '';
    const errorStatus = error && typeof error === 'object' && 'status' in error ? Number((error as any).status) : 500;

    if (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('403') || errorStatus === 401 || errorStatus === 403) {
      throw {
        status: 401,
        code: 'AUTH_FAILED',
        message: 'Authentication failed. Please verify your GEMINI_API_KEY secret in AI Studio.',
      };
    }

    if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('429') || rawMsg.includes('quota') || errorStatus === 429) {
      throw {
        status: 429,
        code: 'RATE_LIMIT',
        message: 'Gemini API quota or rate limit reached. Please wait a moment and try again.',
      };
    }

    if (
      rawMsg.includes('503') ||
      rawMsg.includes('UNAVAILABLE') ||
      rawMsg.includes('high demand') ||
      rawMsg.includes('spikes in demand') ||
      errorStatus === 503
    ) {
      throw {
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
        message:
          'This model is currently experiencing high demand. Spikes in demand are usually temporary. Please click Retry to try again.',
      };
    }

    if (
      errorCode === 'GATEWAY_TIMEOUT' ||
      errorStatus === 504 ||
      rawMsg.includes('DEADLINE_EXCEEDED') ||
      rawMsg.includes('timeout') ||
      rawMsg.includes('ETIMEDOUT')
    ) {
      throw {
        status: 504,
        code: 'GATEWAY_TIMEOUT',
        message: 'The AI generation service timed out. Please try again with a more concise prompt.',
      };
    }

    throw {
      status: errorStatus >= 400 && errorStatus < 600 ? errorStatus : 500,
      code: errorCode || 'GENERATION_FAILED',
      message: sanitizedMsg,
    };
  }

  /**
   * Returns metadata regarding the active Gemini configuration.
   */
  static getModelInfo(): {
    model: string;
    fallbackModel?: string;
    isConfigured: boolean;
    supportedSections: string[];
  } {
    const key = process.env.GEMINI_API_KEY;
    const isConfigured = Boolean(key && key.trim() !== '' && key !== 'MY_GEMINI_API_KEY');
    return {
      model: this.primaryModel,
      fallbackModel: this.fallbackModel,
      isConfigured,
      supportedSections: ALLOWED_SECTION_TYPES,
    };
  }
}
