import React, { useState, useEffect, useRef } from 'react';
import { ViewportMode, Project } from '../../types';
import { DevicePreviewControls } from './DevicePreviewControls';
import { Button } from '../common/Button';
import { ProjectService, SaveStatus } from '../../services/projectService';
import {
  ArrowLeft,
  Edit2,
  Check,
  Download,
  ExternalLink,
  History,
  FolderKanban,
  Plus,
  CloudCheck,
  Loader2,
  AlertCircle,
  MoreVertical,
  Copy,
  FileCode,
  FileJson,
  Trash2,
  Palette,
  Layers,
  Inbox,
  Gauge,
} from 'lucide-react';

interface BuilderToolbarProps {
  project: Project;
  viewportMode: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  onRenameProject: (name: string) => void;
  onExportClick: () => void;
  onBackToProjects: () => void;
  onOpenHistory?: () => void;
  onOpenSwitcher?: () => void;
  onCreateNewProject?: () => void;
  onDuplicateProject?: () => void;
  onDeleteProject?: () => void;
  onManualSave?: () => void;
  onOpenThemes?: () => void;
  onOpenOutline?: () => void;
  onOpenLeads?: () => void;
  onOpenSeoAudit?: () => void;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  project,
  viewportMode,
  onViewportChange,
  onRenameProject,
  onExportClick,
  onBackToProjects,
  onOpenHistory,
  onOpenSwitcher,
  onCreateNewProject,
  onDuplicateProject,
  onDeleteProject,
  onManualSave,
  onOpenThemes,
  onOpenOutline,
  onOpenLeads,
  onOpenSeoAudit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project.name || 'Untitled Website');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [saveMessage, setSaveMessage] = useState<string>('All changes saved locally');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync project name if external updates occur
  useEffect(() => {
    setProjectName(project.name || 'Untitled Website');
  }, [project.name]);

  // Subscribe to live save status updates from ProjectService
  useEffect(() => {
    const unsubscribe = ProjectService.subscribeSaveStatus((status, msg) => {
      setSaveStatus(status);
      if (msg) setSaveMessage(msg);
    });
    return unsubscribe;
  }, []);

  // Close more menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSaveName = () => {
    const trimmed = projectName.trim();
    if (trimmed && trimmed !== project.name) {
      onRenameProject(trimmed);
    } else {
      setProjectName(project.name || 'Untitled Website');
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === 'Escape') {
      setProjectName(project.name || 'Untitled Website');
      setIsEditing(false);
    }
  };

  const handleExportJson = () => {
    const jsonStr = ProjectService.exportProjectAsJson(project);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${(project.name || 'project').toLowerCase().replace(/\s+/g, '-')}-backup.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsMenuOpen(false);
  };

  const versionsCount = project.documentHistory?.length || (project.document ? 1 : 0);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 shrink-0 select-none z-20">
      {/* Left: Back / Projects Switcher, Project Name & Save Status */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onBackToProjects}
          className="flex items-center gap-1.5 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title="Back to All Projects"
          aria-label="Back to All Projects"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xl:inline text-xs font-medium text-slate-600">Projects</span>
        </button>

        {/* Project Switcher button */}
        {onOpenSwitcher && (
          <button
            type="button"
            onClick={onOpenSwitcher}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 text-xs font-medium transition-colors cursor-pointer shrink-0"
            title="Switch project"
            aria-label="Switch project"
          >
            <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Switch</span>
          </button>
        )}

        <div className="hidden sm:block w-px h-5 bg-slate-200 shrink-0" />

        {/* Project Name (Inline Editable) */}
        <div className="flex items-center gap-1.5 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <label htmlFor="project-name-input" className="sr-only">
                Edit Project Name
              </label>
              <input
                id="project-name-input"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveName}
                autoFocus
                className="text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-indigo-400 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[140px] sm:max-w-[200px]"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="p-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                title="Save name"
                aria-label="Save name"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 group min-w-0">
              <span
                onClick={() => setIsEditing(true)}
                className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-[110px] sm:max-w-[180px] md:max-w-[220px] cursor-pointer hover:text-indigo-600 transition-colors"
                title="Click to rename"
              >
                {project.name || 'Untitled Website'}
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                title="Rename website"
                aria-label="Rename website"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Real Live Save Status Indicator */}
          <div
            onClick={onManualSave}
            className="flex items-center gap-1 text-[11px] shrink-0 pl-1 cursor-pointer select-none"
            title={`${saveMessage} (Click to save immediately)`}
          >
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-1 text-indigo-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden xl:inline">Saving...</span>
              </span>
            ) : saveStatus === 'error' ? (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="w-3 h-3" />
                <span className="hidden xl:inline">Storage full</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CloudCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden xl:inline">Saved locally</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center: Device Controls */}
      <div className="flex items-center justify-center">
        <DevicePreviewControls
          viewportMode={viewportMode}
          onViewportChange={onViewportChange}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Themes Palette Button (Option 2) */}
        {onOpenThemes && (
          <button
            type="button"
            onClick={onOpenThemes}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
            title="Curated designer theme presets"
            aria-label="Themes"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Themes</span>
          </button>
        )}

        {/* Outline & CMS Manager Button (Option 3) */}
        {onOpenOutline && (
          <button
            type="button"
            onClick={onOpenOutline}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
            title="Page outline, reorder, duplicate & insert sections"
            aria-label="Page outline"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Outline</span>
          </button>
        )}

        {/* Leads & Inquiries Button (Option 4) */}
        {onOpenLeads && (
          <button
            type="button"
            onClick={onOpenLeads}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
            title="View form submissions and captured leads"
            aria-label="Leads and inquiries"
          >
            <Inbox className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">Leads</span>
          </button>
        )}

        {/* Version History Button */}
        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
            title="Browse version history & restore revisions"
            aria-label="Version history"
          >
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Revisions</span>
            {versionsCount > 0 && (
              <span className="font-mono text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded-full">
                {versionsCount}
              </span>
            )}
          </button>
        )}

        {/* Export Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportClick}
          icon={<Download className="w-3.5 h-3.5 text-slate-500" />}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 hidden sm:inline-flex"
        >
          <span>Export</span>
        </Button>

        {/* Project Actions More Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="More project actions"
            aria-label="More project actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Project Actions
                </span>
                <span className="text-xs font-semibold text-slate-900 truncate block">
                  {project.name}
                </span>
              </div>

              {onDuplicateProject && (
                <button
                  type="button"
                  onClick={() => {
                    onDuplicateProject();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Duplicate Project</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportJson}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5 text-indigo-500" />
                <span>Export Project JSON</span>
              </button>

              {onOpenSeoAudit && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenSeoAudit();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                  <span>SEO & Social Audit</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onExportClick();
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer sm:hidden"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export Website Code</span>
              </button>

              {onDeleteProject && (
                <>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteProject();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete Project</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
