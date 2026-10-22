import React, { useState } from 'react';
import { Project } from '../../types';
import { Button } from '../common/Button';
import {
  FolderKanban,
  Search,
  Plus,
  Clock,
  MessageSquare,
  Copy,
  Trash2,
  X,
  Check,
  Sparkles,
} from 'lucide-react';

interface ProjectSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (project: Project) => void;
  onCreateNewProject: () => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectSwitcherModal: React.FC<ProjectSwitcherModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateNewProject,
  onDuplicateProject,
  onDeleteProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.initialPrompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-switcher-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h2 id="project-switcher-title" className="text-base font-bold text-slate-900">
                Switch Project
              </h2>
              <p className="text-xs text-slate-500">
                Select a saved website or start a new builder session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onCreateNewProject();
              }}
            >
              New Website
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Close project switcher"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-200/80 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your saved projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No projects found matching "{searchQuery}".
            </div>
          ) : (
            filtered.map((proj) => {
              const isActive = proj.id === activeProjectId;
              const doc = proj.document || proj.specification;
              const versionsCount = proj.documentHistory?.length || (doc ? 1 : 0);

              return (
                <div
                  key={proj.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                    isActive
                      ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-200 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div
                    onClick={() => {
                      if (!isActive) {
                        onSelectProject(proj);
                        onClose();
                      }
                    }}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {proj.name}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full shrink-0">
                          <Check className="w-2.5 h-2.5" />
                          Active
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                        {proj.status === 'idle' ? 'Draft' : proj.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mb-2">
                      {proj.initialPrompt || 'Blank workspace session initialized without prompt.'}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(proj.updatedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </span>

                      {versionsCount > 0 && (
                        <span className="flex items-center gap-1 font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                          v{versionsCount}
                        </span>
                      )}

                      {doc && (
                        <span>
                          {doc.pages.length} {doc.pages.length === 1 ? 'page' : 'pages'} ·{' '}
                          {doc.pages.reduce((a, p) => a + p.sections.length, 0)} sections
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDuplicateProject(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Duplicate project"
                      aria-label="Duplicate project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {confirmDeleteId === proj.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteProject(proj.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(proj.id)}
                        disabled={projects.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        title={projects.length <= 1 ? 'Cannot delete the only project' : 'Delete project'}
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isActive && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          onSelectProject(proj);
                          onClose();
                        }}
                      >
                        Open
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span>{projects.length} total projects in local storage</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
