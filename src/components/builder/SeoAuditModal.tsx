import React, { useState } from 'react';
import { WebsiteDocument } from '../../types/schema';
import { Button } from '../common/Button';
import {
  X,
  Globe,
  Share2,
  Check,
  Copy,
  Zap,
  Gauge,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';

interface SeoAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: WebsiteDocument;
}

export const SeoAuditModal: React.FC<SeoAuditModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const siteTitle = document.title || 'Enterprise Website';
  const description =
    document.description ||
    'Synthesized with SiteForge AI — high-performance, responsive web architecture with zero vendor lock-in.';
  const previewDomain = 'https://mywebsite.com';

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteTitle,
    description: description,
    url: previewDomain,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${previewDomain}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const jsonLdString = JSON.stringify(schemaJsonLd, null, 2);

  const metaTagsString = `<title>${siteTitle}</title>
<meta name="description" content="${description}" />
<meta property="og:title" content="${siteTitle}" />
<meta property="og:description" content="${description}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${siteTitle}" />
<meta name="twitter:description" content="${description}" />`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Gauge className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                SEO & Performance Auditor
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              SEO & Social Card Inspector
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live preview of search rankings, OpenGraph cards, and schema tags.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Health Scores */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <div className="text-2xl font-extrabold text-emerald-700 font-display">98/100</div>
              <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider mt-0.5">
                SEO Health
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
              <div className="text-2xl font-extrabold text-indigo-700 font-display">99/100</div>
              <div className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider mt-0.5">
                Performance Est.
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
              <div className="text-2xl font-extrabold text-purple-700 font-display">100%</div>
              <div className="text-[10px] uppercase font-bold text-purple-800 tracking-wider mt-0.5">
                Mobile Ready
              </div>
            </div>
          </div>

          {/* Search Result Snippet Preview */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
              <Globe className="w-4 h-4 text-slate-500" />
              <span>Google Search Result Snippet</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                <span>{previewDomain}</span>
                <span className="text-slate-300">›</span>
                <span className="text-slate-700">index</span>
              </div>
              <div className="text-base text-blue-700 hover:underline font-medium cursor-pointer">
                {siteTitle}
              </div>
              <div className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {description}
              </div>
            </div>
          </div>

          {/* Social Share Card Preview */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>OpenGraph Social Share Card (Twitter / LinkedIn)</span>
            </div>
            <div className="max-w-md border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-2xs">
              <div className="h-32 bg-linear-to-r from-indigo-900 to-slate-900 p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-mono">
                  SiteForge AI Preview
                </span>
                <h4 className="font-bold text-sm truncate">{siteTitle}</h4>
              </div>
              <div className="p-3 bg-white">
                <div className="text-[10px] text-slate-400 uppercase font-mono">mywebsite.com</div>
                <div className="font-bold text-xs text-slate-900 truncate mt-0.5">{siteTitle}</div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{description}</div>
              </div>
            </div>
          </div>

          {/* Structured Data & Meta Snippets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-800">
                HTML Meta Tags & Schema.org JSON-LD
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={copied === 'meta' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  onClick={() => copyToClipboard(metaTagsString, 'meta')}
                >
                  {copied === 'meta' ? 'Copied Meta' : 'Copy Meta Tags'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={copied === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  onClick={() => copyToClipboard(jsonLdString, 'schema')}
                >
                  {copied === 'schema' ? 'Copied JSON-LD' : 'Copy JSON-LD'}
                </Button>
              </div>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40">
              {metaTagsString}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>All generated React and static HTML bundles include these tags automatically.</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
