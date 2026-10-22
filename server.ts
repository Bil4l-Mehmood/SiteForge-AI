import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GeminiGenerationService } from './server/geminiService';
import { GENERATION_PRESETS } from './src/types/presets';
import { ExportService } from './src/services/exportService';
import { validateWebsiteDocument } from './server/validator';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory sliding-window rate limiter for expensive AI generation endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function aiRateLimiter(req: Request, res: Response, next: () => void) {
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 30; // Max 30 generation/edit requests per minute

  const record = rateLimitMap.get(clientIp);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
    next();
  } else if (record.count < maxRequests) {
    record.count++;
    next();
  } else {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Rate limit exceeded. Please wait a moment before sending another AI generation request.',
    });
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Security Headers Middleware
  app.use((_req: Request, res: Response, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  // JSON request body parser with safety limit (2MB)
  app.use(express.json({ limit: '2mb' }));

  // Health and AI status check endpoint
  app.get('/api/ai/status', (_req: Request, res: Response) => {
    const info = GeminiGenerationService.getModelInfo();
    res.json({
      success: true,
      status: 'online',
      configured: info.isConfigured,
      model: info.model,
      fallbackModel: info.fallbackModel,
      supportedSections: info.supportedSections,
    });
  });

  // Presets list endpoint
  app.get('/api/presets', (_req: Request, res: Response) => {
    res.json({
      success: true,
      presets: Object.values(GENERATION_PRESETS),
    });
  });

  // Server-side in-memory contact queries store
  const serverContactQueries: any[] = [];

  // Contact inquiry submission endpoint
  app.post('/api/contact', (req: Request, res: Response) => {
    try {
      const { name, email, message, category, subject, phone, websiteTitle, projectId } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ success: false, message: 'Name is required.' });
        return;
      }
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        res.status(400).json({ success: false, message: 'Valid email is required.' });
        return;
      }
      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ success: false, message: 'Message is required.' });
        return;
      }

      const queryRecord = {
        id: `query_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 100),
        phone: phone ? String(phone).trim().slice(0, 50) : undefined,
        category: category || 'General Inquiry',
        subject: subject ? String(subject).trim().slice(0, 200) : 'General Inquiry',
        message: message.trim().slice(0, 5000),
        websiteTitle: websiteTitle || 'SiteForge AI',
        projectId: projectId || 'siteforge_app',
        submittedAt: new Date().toISOString(),
        status: 'new',
      };

      serverContactQueries.unshift(queryRecord);
      if (serverContactQueries.length > 500) {
        serverContactQueries.pop();
      }

      res.status(201).json({
        success: true,
        message: 'Inquiry received successfully.',
        query: queryRecord,
      });
    } catch {
      res.status(500).json({ success: false, message: 'Failed to process inquiry.' });
    }
  });

  // Retrieve contact inquiries endpoint
  app.get('/api/contact', (_req: Request, res: Response) => {
    res.json({
      success: true,
      queries: serverContactQueries,
    });
  });

  // Website generation endpoint using real Gemini API (rate-limited)
  app.post('/api/generate-website', aiRateLimiter, async (req: Request, res: Response) => {
    try {
      const { prompt, presetId } = req.body;

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        res.status(400).json({
          success: false,
          code: 'INVALID_INPUT',
          message: 'Please provide a non-empty prompt describing your website.',
        });
        return;
      }

      const trimmed = prompt.trim();
      if (trimmed.length > 2500) {
        res.status(400).json({
          success: false,
          code: 'PROMPT_TOO_LONG',
          message: 'The website description must be under 2500 characters.',
        });
        return;
      }

      // Generate structured canonical WebsiteDocument via server Gemini service
      const document = await GeminiGenerationService.generateWebsite(trimmed, presetId);

      res.json({
        success: true,
        document,
        specification: document, // Backward-compatible alias
        message: 'WebsiteDocument synthesized and validated successfully.',
      });
    } catch (err: unknown) {
      const errorObj = err as { status?: number; code?: string; message?: string };
      const status = errorObj.status || 500;
      const code = errorObj.code || 'INTERNAL_ERROR';
      const rawMessage = errorObj.message || 'An unexpected error occurred during website generation.';
      const sanitizedMessage = GeminiGenerationService.sanitizeErrorMessage(rawMessage);

      res.status(status).json({
        success: false,
        code,
        message: sanitizedMessage,
      });
    }
  });

  // Website editing endpoint using real Gemini API (rate-limited and pre-validated)
  app.post('/api/edit-website', aiRateLimiter, async (req: Request, res: Response) => {
    try {
      const { instruction, currentDocument, history } = req.body;

      if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
        res.status(400).json({
          success: false,
          code: 'INVALID_INSTRUCTION',
          message: 'Please provide an editing instruction.',
        });
        return;
      }

      const trimmedInstruction = instruction.trim();
      if (trimmedInstruction.length > 2500) {
        res.status(400).json({
          success: false,
          code: 'INSTRUCTION_TOO_LONG',
          message: 'Editing instruction exceeds maximum allowed length of 2500 characters.',
        });
        return;
      }

      if (!currentDocument || typeof currentDocument !== 'object') {
        res.status(400).json({
          success: false,
          code: 'MISSING_DOCUMENT',
          message: 'Existing website document must be provided for conversational editing.',
        });
        return;
      }

      // Server-side pre-validation of current document to preserve integrity
      const docValidation = validateWebsiteDocument(currentDocument);
      if (!docValidation.valid) {
        res.status(400).json({
          success: false,
          code: 'INVALID_DOCUMENT',
          message: `The provided website document failed validation: ${docValidation.error}`,
        });
        return;
      }

      // Validate history array size and contents
      const sanitizedHistory = Array.isArray(history)
        ? history.slice(-20).map((h) => ({
            sender: h.sender === 'user' ? 'user' : 'assistant',
            content: typeof h.content === 'string' ? h.content.slice(0, 2000) : '',
          }))
        : [];

      // Execute conversational edit through Gemini service
      const result = await GeminiGenerationService.editWebsite(
        trimmedInstruction,
        docValidation.document,
        sanitizedHistory as any
      );

      res.json({
        success: true,
        document: result.document,
        specification: result.document, // Backward-compatible alias
        changeSummary: result.changeSummary,
        message: result.changeSummary || 'Website updated successfully.',
      });
    } catch (err: unknown) {
      const errorObj = err as { status?: number; code?: string; message?: string };
      const status = errorObj.status || 500;
      const code = errorObj.code || 'INTERNAL_ERROR';
      const rawMessage = errorObj.message || 'An unexpected error occurred during website editing.';
      const sanitizedMessage = GeminiGenerationService.sanitizeErrorMessage(rawMessage);

      res.status(status).json({
        success: false,
        code,
        message: sanitizedMessage,
      });
    }
  });

  // Website export inspection endpoint
  app.post('/api/export-website', async (req: Request, res: Response) => {
    try {
      const { document, format = 'react-vite' } = req.body;
      if (!document || typeof document !== 'object') {
        res.status(400).json({
          success: false,
          code: 'MISSING_DOCUMENT',
          message: 'Website document is required for export.',
        });
        return;
      }

      const allowedFormats = ['react-vite', 'static-html', 'json'];
      if (!allowedFormats.includes(format)) {
        res.status(400).json({
          success: false,
          code: 'INVALID_FORMAT',
          message: `Export format "${format}" is not supported. Must be one of: ${allowedFormats.join(', ')}`,
        });
        return;
      }

      // Validate before export
      const docValidation = validateWebsiteDocument(document);
      if (!docValidation.valid) {
        res.status(400).json({
          success: false,
          code: 'INVALID_DOCUMENT',
          message: `Website document is invalid: ${docValidation.error}`,
        });
        return;
      }

      const { filename, files } = await ExportService.exportWebsite(
        docValidation.document,
        format as any
      );

      res.json({
        success: true,
        filename,
        format,
        fileCount: files.length,
        files,
        message: `Package ${filename} synthesized successfully with ${files.length} files.`,
      });
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : 'Export failed.';
      const sanitizedMsg = GeminiGenerationService.sanitizeErrorMessage(rawMsg);
      res.status(400).json({
        success: false,
        code: 'EXPORT_FAILED',
        message: sanitizedMsg,
      });
    }
  });

  // Vite middleware for dev / static serving for production
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SiteForge AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SiteForge AI] Failed to start server:', GeminiGenerationService.sanitizeErrorMessage(err));
  process.exit(1);
});
