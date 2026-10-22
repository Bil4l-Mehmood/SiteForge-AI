import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Project } from '../../types';
import {
  ExportService,
  ExportFormat,
  ExportProgress,
} from '../../services/exportService';
import {
  Download,
  Code2,
  FileCode,
  FileJson,
  Check,
  Copy,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  FolderArchive,
  ExternalLink,
  Info,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('react-vite');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successFilename, setSuccessFilename] = useState<string | null>(null);

  const doc = project.document || project.specification;
  const hasWebsite = Boolean(doc);

  const handleStartExport = async () => {
    if (!hasWebsite || !doc) {
      setErrorMessage('Please generate a website before exporting.');
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);
    setSuccessFilename(null);

    try {
      const { blob, filename } = await ExportService.exportWebsite(
        project,
        selectedFormat,
        (p) => setProgress(p)
      );

      ExportService.triggerDownload(blob, filename);
      setSuccessFilename(filename);
    } catch (err: any) {
      setErrorMessage(err.message || 'Export failed. Please check your document state.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyJson = () => {
    if (!doc) return;
    navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Website Project"
      description="Download complete, production-ready source code or static website packages."
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          {hasWebsite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyJson}
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied Blueprint' : 'Copy JSON'}
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isExporting}>
              Close
            </Button>

            {hasWebsite && (
              <Button
                variant="primary"
                size="sm"
                icon={
                  isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )
                }
                onClick={handleStartExport}
                disabled={isExporting}
              >
                {isExporting ? 'Packaging...' : 'Download Export Package'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-rose-900">Export Error</span>
              <p className="text-rose-800/90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Notice */}
        {successFilename && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Successfully downloaded <strong>{successFilename}</strong>!
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Ready to extract & run</span>
          </div>
        )}

        {/* Empty State when no website has been created */}
        {!doc ? (
          <div className="py-12 text-center text-slate-500 max-w-sm mx-auto">
            <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Website Generated Yet</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Describe the website you want in the builder chat panel first. Once the AI synthesizes your website, you can export full React source code or static HTML.
            </p>
          </div>
        ) : (
          <>
            {/* Website Summary Chip */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-slate-900 truncate">{doc.title}</span>
                <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded shrink-0">
                  {doc.category}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 shrink-0 text-[11px]">
                <span>{doc.pages.length} pages</span>
                <span>·</span>
                <span>{doc.pages.reduce((a, p) => a + p.sections.length, 0)} sections</span>
              </div>
            </div>

            {/* Export Format Selector Tabs */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Choose Export Format
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Option A: React + Vite */}
                <div
                  onClick={() => setSelectedFormat('react-vite')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedFormat === 'react-vite'
                      ? 'bg-indigo-50/60 border-indigo-600 ring-1 ring-indigo-600 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      Source
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">React 19 + Vite</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Standalone React source project with Tailwind CSS & Lucide icons.
                  </p>
                </div>

                {/* Option B: Static HTML */}
                <div
                  onClick={() => setSelectedFormat('static-html')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedFormat === 'static-html'
                      ? 'bg-indigo-50/60 border-indigo-600 ring-1 ring-indigo-600 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Zero Build
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Static HTML Site</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Multi-page standalone HTML. Double-click to open or host anywhere.
                  </p>
                </div>

                {/* Option C: JSON Blueprint */}
                <div
                  onClick={() => setSelectedFormat('json')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedFormat === 'json'
                      ? 'bg-indigo-50/60 border-indigo-600 ring-1 ring-indigo-600 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                      <FileJson className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      Data
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Website Blueprint</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Canonical WebsiteDocument JSON for API or backup integration.
                  </p>
                </div>
              </div>
            </div>

            {/* Package File Structure Preview */}
            <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                <span>Included Files Preview</span>
                <span>{selectedFormat === 'react-vite' ? 'React Source Tree' : selectedFormat === 'static-html' ? 'Static HTML Tree' : 'JSON File'}</span>
              </div>

              {selectedFormat === 'react-vite' && (
                <div className="space-y-0.5 text-slate-300">
                  <div className="text-indigo-400 font-bold">📦 {doc.title.toLowerCase().replace(/\s+/g, '-')}-react-vite-source.zip</div>
                  <div className="pl-3">├── 📄 package.json <span className="text-slate-500">(React 19, Vite, Tailwind v4)</span></div>
                  <div className="pl-3">├── 📄 vite.config.ts</div>
                  <div className="pl-3">├── 📄 tsconfig.json</div>
                  <div className="pl-3">├── 📄 index.html <span className="text-slate-500">(SEO meta & Google Fonts)</span></div>
                  <div className="pl-3">├── 📄 README.md <span className="text-slate-500">(Run instructions: npm run dev)</span></div>
                  <div className="pl-3">└── 📁 src/</div>
                  <div className="pl-6">├── 📄 main.tsx</div>
                  <div className="pl-6">├── 📄 App.tsx <span className="text-slate-500">(Multi-page routing & renderer)</span></div>
                  <div className="pl-6">├── 📄 index.css <span className="text-slate-500">(Tailwind & custom theme variables)</span></div>
                  <div className="pl-6">├── 📁 data/</div>
                  <div className="pl-9">└── 📄 websiteData.ts</div>
                  <div className="pl-6">└── 📁 components/</div>
                  <div className="pl-9">├── 📄 Navbar.tsx <span className="text-slate-500">(Responsive navigation)</span></div>
                  <div className="pl-9">├── 📄 Footer.tsx</div>
                  <div className="pl-9">└── 📄 SectionRenderer.tsx <span className="text-slate-500">(All section types)</span></div>
                </div>
              )}

              {selectedFormat === 'static-html' && (
                <div className="space-y-0.5 text-slate-300">
                  <div className="text-emerald-400 font-bold">📦 {doc.title.toLowerCase().replace(/\s+/g, '-')}-static-website.zip</div>
                  <div className="pl-3">├── 📄 index.html <span className="text-slate-500">(Homepage with responsive header & sections)</span></div>
                  {doc.pages.filter(p => p.path !== '/').map(p => (
                    <div key={p.id} className="pl-3">
                      ├── 📄 {p.path.replace(/^\//, '')}.html <span className="text-slate-500">({p.name} page)</span>
                    </div>
                  ))}
                  <div className="pl-3">├── 📄 404.html <span className="text-slate-500">(Graceful fallback error page)</span></div>
                  <div className="pl-3">└── 📄 README.md <span className="text-slate-500">(Deploy to Netlify, GitHub Pages, Vercel)</span></div>
                </div>
              )}

              {selectedFormat === 'json' && (
                <div className="space-y-0.5 text-slate-300">
                  <div className="text-amber-400 font-bold">📄 {doc.title.toLowerCase().replace(/\s+/g, '-')}-blueprint.json</div>
                  <div className="pl-3 text-slate-400">// Formatted canonical WebsiteDocument matching schema v{doc.schemaVersion || '1.0.0'}</div>
                </div>
              )}
            </div>

            {/* Packaging Progress Bar */}
            {isExporting && progress && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between font-semibold">
                  <span>{progress.message}</span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="w-full bg-indigo-200/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
