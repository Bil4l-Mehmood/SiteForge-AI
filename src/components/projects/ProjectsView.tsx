import React, { useState, useRef } from 'react';
import { Project } from '../../types';
import { Button } from '../common/Button';
import { ProjectService } from '../../services/projectService';
import {
  FolderPlus,
  FolderCode,
  ArrowRight,
  Trash2,
  Search,
  Clock,
  MessageSquare,
  Sparkles,
  Copy,
  Download,
  Upload,
  Check,
  Edit2,
  Layers,
  History,
  AlertCircle,
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onCreateNewProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject?: (projectId: string) => void;
  onRenameProject?: (projectId: string, newName: string) => void;
  onImportProject?: (project: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onOpenProject,
  onCreateNewProject,
  onDeleteProject,
  onDuplicateProject,
  onRenameProject,
  onImportProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.initialPrompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveRename = (projectId: string) => {
    const trimmed = editName.trim();
    if (trimmed && onRenameProject) {
      onRenameProject(projectId, trimmed);
    }
    setEditingId(null);
  };

  const handleExportJson = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const jsonStr = ProjectService.exportProjectAsJson(project);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${project.name.toLowerCase().replace(/\s+/g, '-')}-backup.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = ProjectService.importProjectFromJson(text);
        if (result.success && result.project) {
          if (onImportProject) {
            onImportProject(result.project);
          }
        } else {
          setImportError(result.error || 'Failed to import project.');
        }
      } catch (err: any) {
        setImportError(`File reading error: ${err.message || 'Invalid format'}`);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Projects</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your AI-crafted websites, restore historical revisions, and organize your designs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            <Button
              variant="outline"
              size="md"
              icon={<Upload className="w-4 h-4 text-slate-500" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Import JSON
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={<FolderPlus className="w-4 h-4" />}
              onClick={onCreateNewProject}
            >
              New Website
            </Button>
          </div>
        </div>

        {/* Import Error Notice */}
        {importError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{importError}</span>
            </div>
            <button
              onClick={() => setImportError(null)}
              className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Area */}
        {projects.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mx-auto mb-4">
              <FolderCode className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              No projects created yet
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Start building your first website in seconds using natural language prompts. Every
              project gives you a live canvas, responsive device switcher, and full version history.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                icon={<Sparkles className="w-4 h-4 text-indigo-400" />}
                onClick={onCreateNewProject}
              >
                Create First Website
              </Button>
            </div>
          </div>
        ) : (
          /* Populated Projects Grid */
          <div className="pt-8 space-y-6">
            {/* Search Filter & Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="max-w-md w-full">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search projects by name or prompt..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all shadow-2xs"
                  />
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'} saved
              </span>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm bg-white rounded-xl border border-slate-200 p-8">
                No projects matched "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.map((proj) => {
                  const doc = proj.document || proj.specification;
                  const versionsCount = proj.documentHistory?.length || (doc ? 1 : 0);
                  const isRenaming = editingId === proj.id;

                  return (
                    <div
                      key={proj.id}
                      className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Title & Status */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          {isRenaming ? (
                            <div className="flex items-center gap-1 w-full">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRename(proj.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                autoFocus
                                className="text-sm font-semibold text-slate-900 bg-white border border-indigo-400 rounded px-2 py-0.5 w-full focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(proj.id)}
                                className="p-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h3
                                onClick={() => onOpenProject(proj)}
                                className="font-semibold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer"
                                title={proj.name}
                              >
                                {proj.name}
                              </h3>
                              <button
                                type="button"
                                onClick={() => startRename(proj)}
                                className="text-slate-300 hover:text-slate-600 p-0.5 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Rename project"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                            {proj.status === 'idle' ? 'Draft' : proj.status}
                          </span>
                        </div>

                        {/* Description / Prompt */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                          {proj.initialPrompt || 'Blank workspace session initialized without prompt.'}
                        </p>

                        {/* Visual Indicators: Pages & Theme */}
                        {doc && (
                          <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 mb-4 text-[11px] text-slate-600">
                            <span className="flex items-center gap-1 truncate">
                              <Layers className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span>{doc.pages.length} pages · {doc.pages.reduce((a, p) => a + p.sections.length, 0)} sections</span>
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                className="w-3 h-3 rounded-full border border-black/10 inline-block shadow-2xs"
                                style={{ backgroundColor: doc.theme.primaryColor }}
                                title={`Primary: ${doc.theme.primaryColor}`}
                              />
                              <span
                                className="w-3 h-3 rounded-full border border-black/10 inline-block shadow-2xs"
                                style={{ backgroundColor: doc.theme.secondaryColor }}
                                title={`Secondary: ${doc.theme.secondaryColor}`}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions & Metadata */}
                      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2.5">
                          <span className="flex items-center gap-1" title="Last updated">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {new Date(proj.updatedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </span>

                          {versionsCount > 0 && (
                            <span
                              className="flex items-center gap-0.5 text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-semibold"
                              title={`${versionsCount} saved revisions`}
                            >
                              <History className="w-2.5 h-2.5" />
                              <span>v{versionsCount}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Duplicate */}
                          {onDuplicateProject && (
                            <button
                              type="button"
                              onClick={() => onDuplicateProject(proj.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Duplicate project"
                              aria-label={`Duplicate ${proj.name}`}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Export JSON */}
                          <button
                            type="button"
                            onClick={(e) => handleExportJson(proj, e)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Export project JSON"
                            aria-label={`Export ${proj.name}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          {confirmDeleteId === proj.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteProject(proj.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2 py-0.5 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(proj.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Delete project"
                              aria-label={`Delete ${proj.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Open Button */}
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<ArrowRight className="w-3 h-3" />}
                            onClick={() => onOpenProject(proj)}
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
