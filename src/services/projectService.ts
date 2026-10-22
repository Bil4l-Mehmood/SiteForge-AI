/**
 * Project Persistence & Version History Service
 *
 * Provides a resilient, browser-local persistence layer backed by localStorage
 * with graceful fallback to in-memory storage, strict schema validation,
 * quota recovery, version history tracking, project duplication, and JSON export/import.
 */

import { Project, DocumentVersion, WebsiteDocument } from '../types';
import { WebsiteDocumentSchema, CURRENT_SCHEMA_VERSION } from '../types/schema';

const STORAGE_KEY = 'siteforge_projects_v1';
const ACTIVE_PROJECT_KEY = 'siteforge_active_project_id_v1';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type SaveStatusListener = (status: SaveStatus, message?: string) => void;

export class ProjectService {
  private static inMemoryStore: Project[] = [];
  private static listeners: Set<SaveStatusListener> = new Set();
  private static currentStatus: SaveStatus = 'saved';

  private static getStorage(): Storage | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
    return null;
  }

  /**
   * Subscribe to save status updates (e.g. 'saving' -> 'saved' or 'error').
   */
  static subscribeSaveStatus(listener: SaveStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.currentStatus);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyStatus(status: SaveStatus, message?: string) {
    this.currentStatus = status;
    this.listeners.forEach((listener) => {
      try {
        listener(status, message);
      } catch {
        // Guard against subscriber errors
      }
    });
  }

  /**
   * Validates and normalizes a project object.
   * Ensures corrupt or older documents do not crash the application.
   */
  static sanitizeProject(raw: unknown): Project | null {
    if (!raw || typeof raw !== 'object') return null;

    const p = raw as Partial<Project>;
    if (!p.id || typeof p.id !== 'string') return null;

    const timestamp = new Date().toISOString();
    const createdAt = p.createdAt && !isNaN(Date.parse(p.createdAt)) ? p.createdAt : timestamp;
    const updatedAt = p.updatedAt && !isNaN(Date.parse(p.updatedAt)) ? p.updatedAt : timestamp;

    let validatedDoc: WebsiteDocument | undefined = undefined;

    // Check either document or legacy specification
    const rawDoc = p.document || p.specification;
    if (rawDoc && typeof rawDoc === 'object') {
      const parsed = WebsiteDocumentSchema.safeParse(rawDoc);
      if (parsed.success) {
        validatedDoc = parsed.data;
      }
    }

    // Sanitize document history
    const sanitizedHistory: DocumentVersion[] = [];
    if (Array.isArray(p.documentHistory)) {
      p.documentHistory.forEach((v, idx) => {
        if (v && typeof v === 'object' && v.document) {
          const vParsed = WebsiteDocumentSchema.safeParse(v.document);
          if (vParsed.success) {
            sanitizedHistory.push({
              id: v.id || `ver_${idx + 1}_${Math.random().toString(36).slice(2, 7)}`,
              versionNumber: v.versionNumber ?? (idx + 1),
              document: vParsed.data,
              timestamp: v.timestamp || updatedAt,
              label: typeof v.label === 'string' ? v.label.slice(0, 100) : `Revision #${idx + 1}`,
              summary: typeof v.summary === 'string' ? v.summary.slice(0, 500) : undefined,
              changeType: v.changeType || 'edit',
            });
          }
        }
      });
    }

    // If validated document exists but history is empty, synthesize initial version
    if (validatedDoc && sanitizedHistory.length === 0) {
      sanitizedHistory.push({
        id: 'ver_init',
        versionNumber: 1,
        document: validatedDoc,
        timestamp: createdAt,
        label: 'Initial Generation',
        summary: `Created ${validatedDoc.title || 'website'}`,
        changeType: 'generation',
      });
    }

    return {
      id: p.id,
      name: p.name && p.name.trim() ? p.name.trim() : (validatedDoc?.title || 'Untitled Website'),
      description: p.description || p.initialPrompt?.slice(0, 100) || 'Website builder project',
      initialPrompt: p.initialPrompt || '',
      createdAt,
      updatedAt,
      status: p.status || (validatedDoc ? 'ready' : 'idle'),
      document: validatedDoc,
      specification: validatedDoc,
      selectedPresetId: p.selectedPresetId,
      currentPagePath: p.currentPagePath || '/',
      chatHistory: Array.isArray(p.chatHistory) ? p.chatHistory : [],
      documentHistory: sanitizedHistory,
      activeVersionId: p.activeVersionId || sanitizedHistory[sanitizedHistory.length - 1]?.id,
      schemaVersion: p.schemaVersion || CURRENT_SCHEMA_VERSION,
    };
  }

  /**
   * Retrieves all projects from storage, sorted by last updated descending.
   */
  static getProjects(): Project[] {
    try {
      const storage = this.getStorage();
      if (storage) {
        const raw = storage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const valid = parsed
              .map((item) => this.sanitizeProject(item))
              .filter((p): p is Project => p !== null)
              .sort(
                (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              );
            return valid;
          }
        }
      }
    } catch (err) {
      console.warn('[ProjectService] Error reading projects from localStorage:', err);
    }
    return this.inMemoryStore;
  }

  /**
   * Retrieves a single project by ID.
   */
  static getProject(id: string): Project | null {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id) || null;
  }

  /**
   * Saves or updates a project in persistence.
   * Handles localStorage quota exceptions gracefully.
   */
  static saveProject(project: Project): void {
    this.notifyStatus('saving', 'Saving changes...');

    const timestamp = new Date().toISOString();
    const cleanProject: Project = {
      ...project,
      updatedAt: timestamp,
      schemaVersion: project.schemaVersion || CURRENT_SCHEMA_VERSION,
    };

    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === cleanProject.id);

    if (index >= 0) {
      projects[index] = cleanProject;
    } else {
      projects.unshift(cleanProject);
    }

    const success = this.persist(projects);
    if (success) {
      this.notifyStatus('saved', 'All changes saved locally');
    } else {
      this.notifyStatus('error', 'Storage failed. Fallback to memory.');
    }
  }

  /**
   * Creates a new blank or prompt-initialized project.
   */
  static createProject(
    initialPrompt: string = '',
    customName?: string,
    presetId?: string
  ): Project {
    const timestamp = new Date().toISOString();
    const id = 'proj_' + Math.random().toString(36).substring(2, 9);

    let generatedName = customName;
    if (!generatedName) {
      if (initialPrompt.trim().length > 0) {
        const words = initialPrompt.trim().split(/\s+/).slice(0, 4).join(' ');
        generatedName = words.charAt(0).toUpperCase() + words.slice(1);
      } else {
        generatedName = 'Untitled Website';
      }
    }

    const newProject: Project = {
      id,
      name: generatedName,
      description: initialPrompt ? initialPrompt.slice(0, 100) : 'Blank website project',
      initialPrompt,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'idle',
      selectedPresetId: presetId,
      currentPagePath: '/',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      chatHistory: initialPrompt
        ? [
            {
              id: 'msg_' + Math.random().toString(36).substring(2, 9),
              sender: 'user',
              content: initialPrompt,
              timestamp,
            },
          ]
        : [],
      documentHistory: [],
    };

    this.saveProject(newProject);
    this.setActiveProjectId(newProject.id);
    return newProject;
  }

  /**
   * Duplicates an existing project with all its document versions.
   */
  static duplicateProject(projectId: string): Project | null {
    const existing = this.getProject(projectId);
    if (!existing) return null;

    const timestamp = new Date().toISOString();
    const newId = 'proj_' + Math.random().toString(36).substring(2, 9);

    const duplicated: Project = {
      ...existing,
      id: newId,
      name: `Copy of ${existing.name}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      // Duplicate version IDs to keep them unique
      documentHistory: existing.documentHistory?.map((ver, idx) => ({
        ...ver,
        id: `ver_dup_${newId}_${idx + 1}`,
      })),
      activeVersionId: existing.activeVersionId
        ? `ver_dup_${newId}_${existing.documentHistory?.findIndex((v) => v.id === existing.activeVersionId) ?? 0 + 1}`
        : undefined,
    };

    this.saveProject(duplicated);
    return duplicated;
  }

  /**
   * Deletes a project by ID.
   */
  static deleteProject(id: string): void {
    const projects = this.getProjects().filter((p) => p.id !== id);
    this.persist(projects);
  }

  /**
   * Renames a project and persists the change.
   */
  static renameProject(id: string, newName: string): Project | null {
    const project = this.getProject(id);
    if (!project) return null;

    const trimmed = newName.trim() || 'Untitled Website';
    const updated: Project = {
      ...project,
      name: trimmed,
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updated);
    return updated;
  }

  /**
   * Records a new DocumentVersion in the project's document history.
   */
  static addVersion(
    projectId: string,
    document: WebsiteDocument,
    label: string,
    summary?: string,
    changeType: 'generation' | 'edit' | 'revert' | 'manual' = 'edit'
  ): { project: Project; version: DocumentVersion } | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    const timestamp = new Date().toISOString();
    const history = project.documentHistory || [];
    const nextVersionNum = history.length + 1;

    const newVersion: DocumentVersion = {
      id: 'ver_' + Math.random().toString(36).substring(2, 9),
      versionNumber: nextVersionNum,
      document,
      timestamp,
      label,
      summary,
      changeType,
    };

    const updatedHistory = [...history, newVersion];
    const updatedProject: Project = {
      ...project,
      document,
      specification: document,
      status: 'ready',
      documentHistory: updatedHistory,
      activeVersionId: newVersion.id,
      updatedAt: timestamp,
    };

    this.saveProject(updatedProject);
    return { project: updatedProject, version: newVersion };
  }

  /**
   * Restores an earlier version safely without corrupting project state.
   */
  static restoreVersion(
    projectId: string,
    versionId: string
  ): { project: Project; restoredVersion: DocumentVersion } | null {
    const project = this.getProject(projectId);
    if (!project || !project.documentHistory) return null;

    const targetVersion = project.documentHistory.find((v) => v.id === versionId);
    if (!targetVersion || !targetVersion.document) return null;

    // Security & Reliability Guard: Validate snapshot before restoring
    const validation = WebsiteDocumentSchema.safeParse(targetVersion.document);
    if (!validation.success) {
      console.warn('[ProjectService] Refusing to restore invalid/corrupted version snapshot:', validation.error);
      return null;
    }

    const timestamp = new Date().toISOString();
    const restoreLabel = `Restored v${targetVersion.versionNumber || ''}: ${targetVersion.label}`;

    // Create an explicit restore history entry so user can also undo a restoration
    const restoredVersion: DocumentVersion = {
      id: 'ver_restore_' + Math.random().toString(36).substring(2, 9),
      versionNumber: (project.documentHistory.length || 0) + 1,
      document: targetVersion.document,
      timestamp,
      label: restoreLabel,
      summary: `Restored to state from ${new Date(targetVersion.timestamp).toLocaleTimeString()}`,
      changeType: 'revert',
    };

    const updatedHistory = [...project.documentHistory, restoredVersion];

    const updatedProject: Project = {
      ...project,
      document: targetVersion.document,
      specification: targetVersion.document,
      activeVersionId: restoredVersion.id,
      documentHistory: updatedHistory,
      updatedAt: timestamp,
    };

    this.saveProject(updatedProject);
    return { project: updatedProject, restoredVersion };
  }

  /**
   * Stores the last opened project ID in local storage.
   */
  static setActiveProjectId(id: string): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(ACTIVE_PROJECT_KEY, id);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Retrieves the last opened project ID.
   */
  static getActiveProjectId(): string | null {
    try {
      const storage = this.getStorage();
      if (storage) {
        return storage.getItem(ACTIVE_PROJECT_KEY);
      }
    } catch {
      // Ignore
    }
    return null;
  }

  /**
   * Serializes a project to formatted JSON for backup / export.
   */
  static exportProjectAsJson(project: Project): string {
    return JSON.stringify(
      {
        siteforge_export_version: '1.0.0',
        exportedAt: new Date().toISOString(),
        project,
      },
      null,
      2
    );
  }

  /**
   * Imports a project from JSON string with strict validation.
   */
  static importProjectFromJson(jsonString: string): {
    success: boolean;
    project?: Project;
    error?: string;
  } {
    try {
      const parsed = JSON.parse(jsonString);
      const rawProject = parsed.project || parsed;
      const sanitized = this.sanitizeProject(rawProject);

      if (!sanitized) {
        return {
          success: false,
          error: 'The provided file does not match a valid SiteForge AI project format.',
        };
      }

      // Generate a fresh unique ID to avoid overwriting existing project
      const importedProject: Project = {
        ...sanitized,
        id: 'proj_imp_' + Math.random().toString(36).substring(2, 9),
        name: `${sanitized.name} (Imported)`,
        updatedAt: new Date().toISOString(),
      };

      this.saveProject(importedProject);
      return { success: true, project: importedProject };
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to parse project JSON: ${err.message || 'Malformed file'}`,
      };
    }
  }

  /**
   * Helper to write to storage with QuotaExceeded recovery and memory fallback.
   */
  private static persist(projects: Project[]): boolean {
    this.inMemoryStore = projects;
    const storage = this.getStorage();
    if (!storage) {
      return true;
    }

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(projects));
      return true;
    } catch (err: any) {
      console.warn('[ProjectService] localStorage write error:', err);

      // Check for QuotaExceededError
      if (
        err.name === 'QuotaExceededError' ||
        err.code === 22 ||
        err.code === 1014 ||
        err.number === -2147024882
      ) {
        console.warn('[ProjectService] Quota exceeded. Attempting graceful pruning of non-critical chat logs...');
        try {
          // Prune chat history in older projects (keep last 6 messages per project)
          const pruned = projects.map((p, idx) => {
            if (idx === 0) return p; // Preserve active project completely
            return {
              ...p,
              chatHistory: p.chatHistory.slice(-6),
            };
          });

          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
          this.inMemoryStore = pruned;
          return true;
        } catch {
          // Secondary fallback: Keep top 5 most recent projects only
          try {
            const topProjects = projects.slice(0, 5);
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(topProjects));
            this.inMemoryStore = topProjects;
            return true;
          } catch {
            return false;
          }
        }
      }

      return false;
    }
  }
}
