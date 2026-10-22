import React, { useState } from 'react';
import { Project, DocumentVersion } from '../../types';
import { Button } from '../common/Button';
import {
  History,
  RotateCcw,
  Check,
  X,
  Clock,
  Layers,
  Palette,
  FileText,
  AlertTriangle,
  Download,
  Eye,
} from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onRestoreVersion: (versionId: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  project,
  onRestoreVersion,
}) => {
  const versions = project.documentHistory || [];
  const activeVersionId =
    project.activeVersionId || (versions.length > 0 ? versions[versions.length - 1].id : '');

  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    activeVersionId || (versions.length > 0 ? versions[versions.length - 1].id : '')
  );
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedVersion =
    versions.find((v) => v.id === selectedVersionId) ||
    versions[versions.length - 1];

  const handleConfirmRestore = () => {
    if (confirmRestoreId) {
      onRestoreVersion(confirmRestoreId);
      setConfirmRestoreId(null);
      onClose();
    }
  };

  const handleExportVersion = (version: DocumentVersion) => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(version.document, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${project.name.toLowerCase().replace(/\s+/g, '-')}-v${version.versionNumber || '1'}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-history-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 id="version-history-title" className="text-base font-bold text-slate-900">
                Version History & Revisions
              </h2>
              <p className="text-xs text-slate-500">
                {project.name} · {versions.length} {versions.length === 1 ? 'version' : 'versions'} saved locally
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close version history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {versions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <History className="w-10 h-10 text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No Revisions Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Once you generate or edit your website with AI, automatic revisions will appear here for safe instant restoring.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Left: Revisions Timeline List */}
            <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/40">
              <div className="p-3 border-b border-slate-200/80 bg-white">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Timeline ({versions.length})
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {[...versions].reverse().map((ver, rIdx) => {
                  const actualIdx = versions.length - 1 - rIdx;
                  const isCurrent = ver.id === activeVersionId;
                  const isSelected = ver.id === selectedVersionId;
                  const versionNum = ver.versionNumber || (actualIdx + 1);

                  return (
                    <div
                      key={ver.id}
                      onClick={() => setSelectedVersionId(ver.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                            v{versionNum}
                          </span>
                          {ver.changeType === 'generation' && (
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                              Initial
                            </span>
                          )}
                          {ver.changeType === 'revert' && (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                              Restored
                            </span>
                          )}
                        </div>

                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full">
                            <Check className="w-2.5 h-2.5" />
                            Current
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                        {ver.label}
                      </h4>

                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(ver.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(ver.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Version Details & Restore Action */}
            {selectedVersion && (
              <div className="flex-1 flex flex-col bg-white overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                        v{selectedVersion.versionNumber || '—'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Saved{' '}
                        {new Date(selectedVersion.timestamp).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedVersion.label}
                    </h3>
                    {selectedVersion.summary && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {selectedVersion.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Download className="w-3.5 h-3.5" />}
                      onClick={() => handleExportVersion(selectedVersion)}
                      title="Download this version JSON"
                    >
                      Export
                    </Button>

                    {selectedVersion.id === activeVersionId ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        Active Version
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<RotateCcw className="w-3.5 h-3.5" />}
                        onClick={() => setConfirmRestoreId(selectedVersion.id)}
                      >
                        Restore This Version
                      </Button>
                    )}
                  </div>
                </div>

                {/* Restoration Confirmation Alert */}
                {confirmRestoreId === selectedVersion.id && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col gap-3 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold text-amber-900">
                          Confirm Version Restoration
                        </p>
                        <p className="text-amber-800/90 mt-0.5">
                          Restoring this version will set your active website preview and builder state to v{selectedVersion.versionNumber}. A new revision entry will be created so your current work is never lost.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmRestoreId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<RotateCcw className="w-3.5 h-3.5" />}
                        onClick={handleConfirmRestore}
                        className="bg-amber-600 hover:bg-amber-700 text-white border-transparent"
                      >
                        Yes, Restore v{selectedVersion.versionNumber}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Document Snapshot Metadata */}
                <div className="mt-6 space-y-5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Website Snapshot
                  </h4>

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] font-medium text-slate-500 block">Title</span>
                      <span className="text-xs font-semibold text-slate-900 truncate block mt-0.5">
                        {selectedVersion.document.title}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] font-medium text-slate-500 block">Pages</span>
                      <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                        {selectedVersion.document.pages.length} pages
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] font-medium text-slate-500 block">Total Sections</span>
                      <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                        {selectedVersion.document.pages.reduce((a, p) => a + p.sections.length, 0)} sections
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] font-medium text-slate-500 block">Category</span>
                      <span className="text-xs font-semibold text-slate-900 capitalize block mt-0.5">
                        {selectedVersion.document.category}
                      </span>
                    </div>
                  </div>

                  {/* Theme Preview */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Theme Configuration</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 inline-block shrink-0 shadow-2xs"
                          style={{ backgroundColor: selectedVersion.document.theme.primaryColor }}
                        />
                        <span className="font-mono text-[11px] text-slate-700">
                          {selectedVersion.document.theme.primaryColor}
                        </span>
                        <span className="text-[10px] text-slate-400">Primary</span>
                      </div>

                      <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 inline-block shrink-0 shadow-2xs"
                          style={{ backgroundColor: selectedVersion.document.theme.secondaryColor }}
                        />
                        <span className="font-mono text-[11px] text-slate-700">
                          {selectedVersion.document.theme.secondaryColor}
                        </span>
                        <span className="text-[10px] text-slate-400">Secondary</span>
                      </div>

                      <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700">
                        <span className="text-[10px] text-slate-400 mr-1.5">Font:</span>
                        <span className="font-medium">{selectedVersion.document.theme.fontFamily}</span>
                      </div>

                      <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700">
                        <span className="text-[10px] text-slate-400 mr-1.5">Radius:</span>
                        <span className="font-medium capitalize">{selectedVersion.document.theme.borderRadius}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pages & Sections breakdown */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Pages & Structured Sections</span>
                    </div>
                    <div className="space-y-2">
                      {selectedVersion.document.pages.map((page) => (
                        <div
                          key={page.id}
                          className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{page.name}</span>
                              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {page.path}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {page.sections.length} sections
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {page.sections.map((sec) => (
                              <span
                                key={sec.id}
                                className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                              >
                                {sec.type}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Revisions are automatically captured when generating or editing.
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
