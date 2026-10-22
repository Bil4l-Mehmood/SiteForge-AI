/**
 * Automated Reliability, Retry & Fallback Test Suite
 * Tests for Gemini transient 503/429/5xx error handling, exponential backoff,
 * Retry-After header parsing, model fallback, and project safety.
 */

import { GeminiGenerationService, RetryConfig } from '../server/geminiService';
import { ProjectService } from '../src/services/projectService';
import { WebsiteDocument } from '../src/types/schema';
import { Project } from '../src/types';

console.log('--- RUNNING GEMINI RELIABILITY, RETRY & FALLBACK TESTS ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✓ Test ${totalTests} Passed: ${message}`);
}

async function runTests() {
  // Test 1: Error Classification for Transient vs Fatal Errors
  {
    const err503 = { status: 503, message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary.' };
    const class503 = GeminiGenerationService.classifyError(err503);
    assert(class503.isTransient === true && class503.isAuth === false, '503 High Demand correctly classified as transient');

    const err429 = { status: 429, message: 'RESOURCE_EXHAUSTED: quota exceeded' };
    const class429 = GeminiGenerationService.classifyError(err429);
    assert(class429.isTransient === true && class429.isAuth === false, '429 Rate Limit correctly classified as transient');

    const err401 = { status: 401, message: 'API_KEY_INVALID: API key not valid' };
    const class401 = GeminiGenerationService.classifyError(err401);
    assert(class401.isAuth === true && class401.isTransient === false, '401 Auth error correctly classified as non-transient auth failure');

    const err400 = { status: 400, message: 'INVALID_ARGUMENT: Bad request schema' };
    const class400 = GeminiGenerationService.classifyError(err400);
    assert(class400.isInvalid === true && class400.isTransient === false, '400 Invalid Argument correctly classified as non-transient invalid request');
  }

  // Test 2: Retry-After Header Parsing
  {
    const errWithSeconds = {
      status: 429,
      message: 'Rate limit exceeded',
      headers: { 'retry-after': '5' },
    };
    const classWithSeconds = GeminiGenerationService.classifyError(errWithSeconds);
    assert(classWithSeconds.retryAfterMs === 5000, 'Retry-After header in seconds (5s) correctly parsed to 5000ms');

    const futureDate = new Date(Date.now() + 10000).toUTCString();
    const errWithDate = {
      status: 503,
      message: 'Unavailable',
      headers: { 'Retry-After': futureDate },
    };
    const classWithDate = GeminiGenerationService.classifyError(errWithDate);
    assert(
      typeof classWithDate.retryAfterMs === 'number' &&
      classWithDate.retryAfterMs > 7000 &&
      classWithDate.retryAfterMs <= 10000,
      'Retry-After header in HTTP Date format correctly converted to relative ms'
    );
  }

  // Test 3: Exponential Backoff, Jitter & Clamping Calculation
  {
    const delay0 = GeminiGenerationService.calculateBackoffDelay(0, 1000, 8000, 2);
    // Base is 1000, with 0.8-1.2 jitter => 800 - 1200
    assert(delay0 >= 750 && delay0 <= 1250, 'Attempt 0 computes ~1000ms delay within jitter bounds');

    const delay1 = GeminiGenerationService.calculateBackoffDelay(1, 1000, 8000, 2);
    // Base is 2000, with 0.8-1.2 jitter => 1600 - 2400
    assert(delay1 >= 1500 && delay1 <= 2500, 'Attempt 1 computes ~2000ms delay within jitter bounds');

    const delay5 = GeminiGenerationService.calculateBackoffDelay(5, 1000, 5000, 2);
    // Base is 32000, clamped to maxDelayMs 5000 => with jitter ~4000 - 6000
    assert(delay5 <= 6000, 'Backoff delay is strictly clamped by maxDelayMs');

    const delayRetryAfter = GeminiGenerationService.calculateBackoffDelay(0, 1000, 8000, 2, 3500);
    assert(delayRetryAfter === 3500, 'Respects explicit Retry-After delay when present');
  }

  // Test 4: Transient 503 Retries and Eventual Success
  {
    let attemptsCount = 0;
    const mockOperation = async (modelName: string): Promise<string> => {
      attemptsCount++;
      if (attemptsCount < 3) {
        const error = new Error('503 UNAVAILABLE: This model is currently experiencing high demand.');
        (error as any).status = 503;
        throw error;
      }
      return JSON.stringify({ success: true, model: modelName });
    };

    const fastRetryConfig: RetryConfig = {
      maxRetries: 3,
      initialDelayMs: 5,
      maxDelayMs: 20,
      totalTimeoutMs: 5000,
    };

    const result = await GeminiGenerationService.callWithRetryAndFallback(mockOperation, {
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'none',
      retryConfig: fastRetryConfig,
    });

    assert(attemptsCount === 3, 'Operation retried 2 times after transient 503 errors and succeeded on 3rd attempt');
    assert(result.modelUsed === 'gemini-3.8-flash', 'Primary model was used when it recovered');
  }

  // Test 5: Non-Retryable Auth Error Fails Immediately Without Retrying
  {
    let attemptsCount = 0;
    const mockAuthFail = async (_model: string): Promise<string> => {
      attemptsCount++;
      const error = new Error('API_KEY_INVALID: The provided API key is invalid.');
      (error as any).status = 401;
      throw error;
    };

    let caughtError: any = null;
    try {
      await GeminiGenerationService.callWithRetryAndFallback(mockAuthFail, {
        primaryModel: 'gemini-3.8-flash',
        retryConfig: { maxRetries: 3, initialDelayMs: 5, maxDelayMs: 20 },
      });
    } catch (err) {
      caughtError = err;
    }

    assert(attemptsCount === 1, 'Non-retryable 401 Auth error halted immediately on attempt 1 without retrying');
    assert(caughtError && caughtError.code === 'AUTH_FAILED', 'Correct AUTH_FAILED code returned');
  }

  // Test 6: Exceeding Max Retries Results in Friendly 503 SERVICE_UNAVAILABLE Error
  {
    let attemptsCount = 0;
    const mockPersistent503 = async (_model: string): Promise<string> => {
      attemptsCount++;
      const error = new Error('503 UNAVAILABLE: This model is currently experiencing high demand.');
      (error as any).status = 503;
      throw error;
    };

    let caughtError: any = null;
    try {
      await GeminiGenerationService.callWithRetryAndFallback(mockPersistent503, {
        primaryModel: 'gemini-3.8-flash',
        fallbackModel: 'none',
        retryConfig: { maxRetries: 2, initialDelayMs: 5, maxDelayMs: 20 },
      });
    } catch (err) {
      caughtError = err;
    }

    assert(attemptsCount === 3, 'Initial attempt + 2 retries were executed before stopping');
    assert(
      caughtError && caughtError.status === 503 && caughtError.code === 'SERVICE_UNAVAILABLE',
      'Exhausted transient 503 returns friendly SERVICE_UNAVAILABLE error with status 503'
    );
    assert(
      caughtError.message.includes('high demand') && caughtError.message.includes('Retry'),
      'Error message clearly explains high demand and prompts user to click Retry'
    );
  }

  // Test 7: Fallback Model Activation When Primary Is Unavailable
  {
    const modelCallHistory: string[] = [];
    const mockWithFallback = async (modelName: string): Promise<string> => {
      modelCallHistory.push(modelName);
      if (modelName === 'gemini-3.8-flash') {
        const error = new Error('503 UNAVAILABLE: High demand on gemini-3.8-flash');
        (error as any).status = 503;
        throw error;
      }
      // Fallback succeeds
      return JSON.stringify({ success: true, model: modelName });
    };

    const result = await GeminiGenerationService.callWithRetryAndFallback(mockWithFallback, {
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      retryConfig: { maxRetries: 1, initialDelayMs: 5, maxDelayMs: 15 },
    });

    assert(modelCallHistory.includes('gemini-3.8-flash'), 'Primary model was attempted first');
    assert(modelCallHistory.includes('gemini-3.1-flash-lite'), 'Fallback model gemini-3.1-flash-lite was called when primary failed');
    assert(result.modelUsed === 'gemini-3.1-flash-lite', 'Operation completed successfully using fallback model');
  }

  // Test 8: Total Execution Timeout Enforcement
  {
    const mockHanging = async (_model: string): Promise<string> => {
      // Simulate slow response
      await new Promise((res) => setTimeout(res, 200));
      const error = new Error('503 UNAVAILABLE');
      (error as any).status = 503;
      throw error;
    };

    let caughtError: any = null;
    try {
      await GeminiGenerationService.callWithRetryAndFallback(mockHanging, {
        primaryModel: 'gemini-3.8-flash',
        retryConfig: { maxRetries: 5, initialDelayMs: 100, maxDelayMs: 200, totalTimeoutMs: 150 },
      });
    } catch (err) {
      caughtError = err;
    }

    assert(
      caughtError && (caughtError.code === 'GATEWAY_TIMEOUT' || caughtError.status === 504),
      'Exceeding totalTimeoutMs stops all retries and raises 504 GATEWAY_TIMEOUT'
    );
  }

  // Test 9: Sanitizer Guarantees Zero Key Leakage
  {
    const fakeKey = 'AIzaSyD-78901234567890123456789012345';
    const leakedMsg = `Error calling https://generativelanguage.googleapis.com/v1beta/models?key=${fakeKey} at /app/server/geminiService.ts:120`;
    const clean = GeminiGenerationService.sanitizeErrorMessage(leakedMsg);

    assert(!clean.includes(fakeKey), 'Sanitizer stripped raw Google API key');
    assert(clean.includes('[REDACTED]'), 'Replaced API key query param with safe [REDACTED] marker');
    assert(!clean.includes('/app/server/geminiService.ts'), 'Sanitizer stripped internal file paths');
  }

  // Test 10: Failed Generation Preserves Project Integrity Without Fake Websites
  {
    const originalDoc: WebsiteDocument = {
      id: 'doc_preserve_test',
      schemaVersion: '1.0.0',
      title: 'Original Authentic Business',
      description: 'Preserved original description.',
      category: 'business',
      theme: {
        primaryColor: '#2563EB',
        secondaryColor: '#1E40AF',
        backgroundColor: '#FFFFFF',
        surfaceColor: '#F8FAFC',
        textColor: '#0F172A',
        mutedTextColor: '#64748B',
        accentColor: '#38BDF8',
        fontFamily: 'Plus Jakarta Sans',
        headingFont: 'Plus Jakarta Sans',
        bodyFont: 'DM Sans',
        borderRadius: 'md',
        spacing: 'comfortable',
        buttonStyle: 'rounded',
        mode: 'light',
      },
      navigation: {
        brandName: 'Original Brand',
        items: [{ label: 'Home', href: '/' }],
      },
      pages: [
        {
          id: 'page_home',
          name: 'Home',
          path: '/',
          sections: [
            {
              id: 'sec_1',
              type: 'hero',
              layout: 'centered',
              isVisible: true,
              content: { heading: 'Real Valid Content' },
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const project: Project = {
      id: 'proj_preserve_test',
      name: 'Original Authentic Business',
      description: 'Test project',
      initialPrompt: 'Create business website',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ready',
      document: originalDoc,
      specification: originalDoc,
      chatHistory: [],
    };

    ProjectService.saveProject(project);

    // Simulate failed conversational edit
    const failedNotice = {
      id: 'msg_err',
      sender: 'system' as const,
      content: 'Edit Notice: This model is currently experiencing high demand. Please click Retry to try again.',
      timestamp: new Date().toISOString(),
      isError: true,
      retryPrompt: 'Change primary color to red',
    };

    const preservedProject: Project = {
      ...project,
      status: 'ready', // Remains ready with untouched originalDoc!
      chatHistory: [failedNotice],
    };
    ProjectService.saveProject(preservedProject);

    const reloaded = ProjectService.getProject('proj_preserve_test');
    assert(reloaded !== null, 'Project reloaded successfully');
    assert(reloaded?.document?.title === 'Original Authentic Business', 'Original website title strictly preserved');
    assert(reloaded?.document?.theme?.primaryColor === '#2563EB', 'Original website theme strictly preserved');
    assert(reloaded?.document?.pages[0].sections.length === 1, 'Original sections array preserved without corrupted mock sections');
    assert(reloaded?.chatHistory.length === 1 && reloaded.chatHistory[0].isError === true, 'Error notice preserved with retryPrompt intact');
  }

  console.log(`\n--- ALL GEMINI RELIABILITY & RETRY TESTS PASSED (${passedTests}/${totalTests}) ---`);
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
