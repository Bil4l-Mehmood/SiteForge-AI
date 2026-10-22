import React, { useState } from 'react';
import { WebsiteDocument, SectionType } from '../../types/schema';
import {
  Sparkles,
  Layers,
  Palette,
  CheckCircle2,
  Cpu,
  Type as TypeIcon,
  HelpCircle,
  Mail,
  DollarSign,
  Quote,
  Users,
  GitCommit,
  Image,
  BarChart3,
  ExternalLink,
  Compass,
  Search,
  Code2,
  Copy,
  Check,
  Globe,
  Tag,
  ArrowRight,
} from 'lucide-react';

export interface SpecificationPreviewStateProps {
  document?: WebsiteDocument;
  specification?: WebsiteDocument; // Alias for backward compatibility
}

export const SpecificationPreviewState: React.FC<SpecificationPreviewStateProps> = ({
  document,
  specification,
}) => {
  const doc = document || specification;
  const [activeTab, setActiveTab] = useState<'blueprint' | 'navigation-seo' | 'json'>('blueprint');
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-sm">
        No specification data available.
      </div>
    );
  }

  const activePage = doc.pages[activePageIndex] || doc.pages[0];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const sectionTypeMeta: Record<
    SectionType,
    { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
  > = {
    hero: { label: 'Hero Banner', icon: Sparkles, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    features: { label: 'Features Grid', icon: Layers, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    about: { label: 'About Story', icon: TypeIcon, color: 'bg-slate-100 text-slate-700 border-slate-200' },
    services: { label: 'Services List', icon: Layers, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    statistics: { label: 'Statistics', icon: BarChart3, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    testimonials: { label: 'Testimonials', icon: Quote, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    pricing: { label: 'Pricing Plans', icon: DollarSign, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    gallery: { label: 'Media Gallery', icon: Image, color: 'bg-pink-50 text-pink-700 border-pink-200' },
    team: { label: 'Team Members', icon: Users, color: 'bg-teal-50 text-teal-700 border-teal-200' },
    process: { label: 'Step Process', icon: GitCommit, color: 'bg-violet-50 text-violet-700 border-violet-200' },
    faq: { label: 'FAQ Accordion', icon: HelpCircle, color: 'bg-sky-50 text-sky-700 border-sky-200' },
    contact: { label: 'Contact Form', icon: Mail, color: 'bg-rose-50 text-rose-700 border-rose-200' },
    cta: { label: 'Call to Action', icon: Sparkles, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    footer: { label: 'Site Footer', icon: Layers, color: 'bg-slate-100 text-slate-700 border-slate-300' },
    header: { label: 'Site Header', icon: Compass, color: 'bg-sky-50 text-sky-700 border-sky-300' },
  };

  return (
    <div className="flex-1 bg-white p-4 sm:p-6 lg:p-8 overflow-y-auto text-left select-text">
      {/* Top Banner: Canonical Schema Validation Status */}
      <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-emerald-950">
                Canonical WebsiteDocument Validated
              </h3>
              <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                v{doc.schemaVersion}
              </span>
              {doc.category && (
                <span className="text-[11px] font-medium uppercase tracking-wider bg-white text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {doc.category}
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
              Synthesized and strictly validated against the canonical schema. Ready for component
              rendering in the next roadmap stage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 shrink-0">
          <Cpu className="w-4 h-4" />
          <span>
            {doc.pages.length} Pages · {activePage?.sections?.length || 0} Sections
          </span>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-6">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'blueprint'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Blueprint Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('navigation-seo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'navigation-seo'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Navigation & SEO</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-600" />
            <span>JSON Schema</span>
          </button>
        </div>

        {activeTab === 'json' && (
          <button
            type="button"
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs rounded-lg transition-colors cursor-pointer"
          >
            {copiedJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy JSON Document</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* TAB 1: BLUEPRINT OVERVIEW */}
      {activeTab === 'blueprint' && (
        <>
          {/* Website Meta & Theme Tokens */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-5 border-b border-slate-200">
              {/* Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-slate-400">ID: {doc.id}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Updated{' '}
                    {new Date(doc.updatedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {doc.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {doc.description}
                </p>

                {/* Design Presets Badges */}
                <div className="flex items-center gap-2 flex-wrap mt-3 text-[11px] text-slate-600">
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">
                    Font: {doc.theme.fontFamily}
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">
                    Headings: {doc.theme.headingFont}
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">
                    Body: {doc.theme.bodyFont}
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">
                    Radius: {doc.theme.borderRadius}
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">
                    Spacing: {doc.theme.spacing}
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono capitalize">
                    Style: {doc.theme.buttonStyle}
                  </span>
                </div>
              </div>

              {/* Theme Palette Cards */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shrink-0 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Theme Swatches</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 capitalize">
                    {doc.theme.mode}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                  <div>
                    <div
                      className="w-10 h-7 rounded border border-slate-200 shadow-2xs mx-auto mb-1"
                      style={{ backgroundColor: doc.theme.primaryColor }}
                    />
                    <span className="font-mono text-slate-600 block text-[9px] truncate">
                      {doc.theme.primaryColor}
                    </span>
                    <span className="text-slate-400 text-[9px]">Primary</span>
                  </div>

                  <div>
                    <div
                      className="w-10 h-7 rounded border border-slate-200 shadow-2xs mx-auto mb-1"
                      style={{ backgroundColor: doc.theme.accentColor }}
                    />
                    <span className="font-mono text-slate-600 block text-[9px] truncate">
                      {doc.theme.accentColor}
                    </span>
                    <span className="text-slate-400 text-[9px]">Accent</span>
                  </div>

                  <div>
                    <div
                      className="w-10 h-7 rounded border border-slate-200 shadow-2xs mx-auto mb-1"
                      style={{ backgroundColor: doc.theme.backgroundColor }}
                    />
                    <span className="font-mono text-slate-600 block text-[9px] truncate">
                      {doc.theme.backgroundColor}
                    </span>
                    <span className="text-slate-400 text-[9px]">Canvas</span>
                  </div>

                  <div>
                    <div
                      className="w-10 h-7 rounded border border-slate-200 shadow-2xs mx-auto mb-1"
                      style={{ backgroundColor: doc.theme.textColor }}
                    />
                    <span className="font-mono text-slate-600 block text-[9px] truncate">
                      {doc.theme.textColor}
                    </span>
                    <span className="text-slate-400 text-[9px]">Text</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Summary Bar */}
            {doc.navigation && (
              <div className="pt-4 border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-600" />
                      {doc.navigation.brandName}
                    </span>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-2">
                      {doc.navigation.items.map((it, idx) => (
                        <span key={idx} className="text-slate-600 text-[11px] font-mono">
                          {it.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  {doc.navigation.primaryCta && (
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-medium">
                      CTA: {doc.navigation.primaryCta.label}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Page Switcher Tabs */}
            <div className="pt-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Pages:</span>
                {doc.pages.map((page, idx) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => setActivePageIndex(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      activePageIndex === idx
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <span>{page.name}</span>
                    <span className="font-mono text-[10px] opacity-70 font-normal">({page.path})</span>
                  </button>
                ))}
              </div>

              {activePage?.seo?.description && (
                <p className="text-[11px] text-slate-500 mt-2 italic">
                  Page SEO: {activePage.seo.description}
                </p>
              )}
            </div>
          </div>

          {/* Sections Architecture Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Sections on "{activePage?.name || 'Home'}" ({activePage?.sections?.length || 0})
                </span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">Canonical Flow</span>
            </div>

            <div className="space-y-3">
              {activePage?.sections?.map((section, sIdx) => {
                const meta = sectionTypeMeta[section.type] || {
                  label: section.type,
                  icon: Layers,
                  color: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                const Icon = meta.icon;
                const content = section.content as Record<string, any>;

                const heading = content.heading || content.brandName || `${meta.label} Section`;
                const supporting =
                  content.supportingText || content.description || content.story;

                return (
                  <div
                    key={section.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    {/* Section Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono flex items-center justify-center font-bold shrink-0">
                          {sIdx + 1}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${meta.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{meta.label}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 border border-slate-100 bg-slate-50 px-1.5 py-0.5 rounded capitalize">
                          Layout: {section.layout || 'grid'}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900 ml-1">{heading}</h5>
                      </div>

                      {/* Primary CTA button label if present */}
                      {(content.primaryCta || content.buttonText) && (
                        <span className="text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded self-start shrink-0">
                          Action: {content.primaryCta?.label || content.buttonText}
                          {(content.primaryCta?.href || content.buttonLink) && (
                            <span className="font-mono text-slate-400 ml-1">
                              ({content.primaryCta?.href || content.buttonLink})
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Supporting description */}
                    {supporting && (
                      <p className="text-xs text-slate-600 mb-2 leading-relaxed ml-7">
                        {supporting}
                      </p>
                    )}

                    {/* Disclaimers if testimonials or pricing */}
                    {content.disclaimer && (
                      <p className="text-[10px] text-amber-700/80 mb-2 leading-relaxed ml-7 font-mono">
                        ℹ️ {content.disclaimer}
                      </p>
                    )}

                    {/* Form Notice if contact section */}
                    {content.submissionNotice && (
                      <p className="text-[10px] text-slate-500 mb-2 leading-relaxed ml-7 font-mono">
                        🔒 {content.submissionNotice}
                      </p>
                    )}

                    {/* Pricing Plans */}
                    {Array.isArray(content.plans) && content.plans.length > 0 && (
                      <div className="mt-3 ml-7 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {content.plans.map((plan: any, pIdx: number) => (
                          <div
                            key={plan.id || pIdx}
                            className={`p-3 rounded-lg border text-xs ${
                              plan.isPopular
                                ? 'border-indigo-400 bg-indigo-50/40 shadow-xs'
                                : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900">{plan.name}</span>
                              {plan.isPopular && (
                                <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-medium">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="font-mono font-bold text-base text-slate-900 mb-1">
                              {plan.price}
                              <span className="text-[10px] text-slate-400 font-normal">
                                {plan.billingPeriod}
                              </span>
                            </div>
                            {Array.isArray(plan.features) && (
                              <ul className="text-[10px] text-slate-600 space-y-0.5 mt-2 pt-2 border-t border-slate-200/60">
                                {plan.features.slice(0, 4).map((f: string, fIdx: number) => (
                                  <li key={fIdx}>✓ {f}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Process Steps */}
                    {Array.isArray(content.steps) && content.steps.length > 0 && (
                      <div className="mt-3 ml-7 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {content.steps.map((st: any, sIdx: number) => (
                          <div
                            key={st.id || sIdx}
                            className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                          >
                            <span className="text-[10px] font-mono font-bold text-indigo-600 block mb-0.5">
                              Step {st.stepNumber || sIdx + 1}
                            </span>
                            <span className="font-semibold text-slate-800 block mb-1">
                              {st.title}
                            </span>
                            <p className="text-[11px] text-slate-500 leading-snug">
                              {st.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Team Members */}
                    {Array.isArray(content.members) && content.members.length > 0 && (
                      <div className="mt-3 ml-7 pt-2.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {content.members.map((m: any, mIdx: number) => (
                          <div
                            key={m.id || mIdx}
                            className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                          >
                            <span className="font-semibold text-slate-800 block">{m.name}</span>
                            <span className="text-[10px] text-slate-500 block mb-1">{m.role}</span>
                            {m.bio && <p className="text-[10px] text-slate-400 line-clamp-2">{m.bio}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Generic items (features, services, testimonials, gallery, stats) */}
                    {Array.isArray(content.items) && content.items.length > 0 && (
                      <div className="mt-3 ml-7 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {content.items.map((item: any, itIdx: number) => (
                          <div
                            key={item.id || itIdx}
                            className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-semibold text-slate-800 truncate">
                                {item.title ||
                                  item.question ||
                                  item.label ||
                                  item.author ||
                                  item.imageAlt ||
                                  `Item ${itIdx + 1}`}
                              </span>
                              {item.value && (
                                <span className="font-mono font-bold text-slate-900 text-xs">
                                  {item.value}
                                </span>
                              )}
                              {item.badge && (
                                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-medium">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {(item.description || item.answer || item.quote) && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                                {item.description || item.answer || `"${item.quote}"`}
                              </p>
                            )}
                            {item.role && (
                              <span className="text-[10px] text-slate-400 block mt-1">
                                {item.role} {item.company ? `· ${item.company}` : ''}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* TAB 2: NAVIGATION & SEO */}
      {activeTab === 'navigation-seo' && (
        <div className="space-y-6">
          {/* Navigation Structure Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Global Navigation Structure</span>
            </h4>

            {doc.navigation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Brand / Logo Text
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {doc.navigation.brandName}
                    </span>
                    {doc.navigation.logoText && (
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Logo: {doc.navigation.logoText}
                      </span>
                    )}
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Primary Navbar CTA
                    </span>
                    {doc.navigation.primaryCta ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">
                          {doc.navigation.primaryCta.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          {doc.navigation.primaryCta.href}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No navbar CTA specified</span>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                    Navbar Menu Links ({doc.navigation.items.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {doc.navigation.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-slate-800">{item.label}</span>
                        <span className="font-mono text-[10px] text-slate-400">{item.href}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No global navigation defined.</p>
            )}
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Metadata & SEO Specifications</span>
            </h4>

            {doc.seo ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Meta Title Tag
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {doc.seo.title || doc.title}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Meta Description
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {doc.seo.description || doc.description}
                    </p>
                  </div>

                  {Array.isArray(doc.seo.keywords) && doc.seo.keywords.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                        Target Keywords
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {doc.seo.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(doc.seo.ogTitle || doc.seo.ogDescription) && (
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                          og:title
                        </span>
                        <span className="text-slate-800">{doc.seo.ogTitle || doc.title}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                          og:description
                        </span>
                        <span className="text-slate-600 truncate block">
                          {doc.seo.ogDescription || doc.description}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Per-Page SEO list */}
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                    Page-Level Route SEO
                  </span>
                  <div className="space-y-2">
                    {doc.pages.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 bg-slate-50 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{p.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">({p.path})</span>
                        </div>
                        <span className="text-[11px] text-slate-500 italic">
                          {p.seo?.description || doc.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No global SEO data configured.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: JSON SCHEMA INSPECTOR */}
      {activeTab === 'json' && (
        <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-md">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
            <span>canonical-website-document.json</span>
            <span>Schema v{doc.schemaVersion} · Validated</span>
          </div>
          <pre className="text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
            {JSON.stringify(doc, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
