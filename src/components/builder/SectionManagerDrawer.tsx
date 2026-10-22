import React, { useState } from 'react';
import { WebsiteDocument, WebsitePage, WebsiteSection, SectionType } from '../../types/schema';
import { Button } from '../common/Button';
import {
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  Edit3,
  Sparkles,
  LayoutTemplate,
  ChevronRight,
} from 'lucide-react';

interface SectionManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: WebsiteDocument;
  currentPagePath: string;
  onUpdateSections: (updatedSections: WebsiteSection[], summary: string) => void;
  onOpenSectionEditor: (section: WebsiteSection) => void;
}

export const SectionManagerDrawer: React.FC<SectionManagerDrawerProps> = ({
  isOpen,
  onClose,
  document,
  currentPagePath,
  onUpdateSections,
  onOpenSectionEditor,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!isOpen) return null;

  // Find active page
  const page =
    document.pages.find((p) => p.path === currentPagePath) || document.pages[0];

  const sections = page?.sections || [];

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    onUpdateSections(
      updated,
      `Reordered section "${moved.type}" ${direction === 'up' ? 'upward' : 'downward'}`
    );
  };

  const handleDuplicate = (index: number) => {
    const target = sections[index];
    const duplicated: WebsiteSection = {
      ...target,
      id: `sec_${target.type}_${Date.now()}`,
      content: { ...target.content, heading: `${(target.content as any).heading || target.type} (Copy)` },
    };

    const updated = [...sections];
    updated.splice(index + 1, 0, duplicated);

    onUpdateSections(updated, `Duplicated section "${target.type}"`);
  };

  const handleDelete = (index: number) => {
    if (sections.length <= 1) {
      alert('A page must have at least one section.');
      return;
    }
    const target = sections[index];
    const updated = sections.filter((_, idx) => idx !== index);
    onUpdateSections(updated, `Deleted section "${target.type}"`);
  };

  const handleToggleVisibility = (index: number) => {
    const target = sections[index];
    const isVisible = target.isVisible !== false ? false : true;
    const updated = sections.map((s, idx) => (idx === index ? { ...s, isVisible } : s));
    onUpdateSections(
      updated,
      `${isVisible ? 'Showed' : 'Hidden'} section "${target.type}"`
    );
  };

  const handleAddSection = (type: SectionType) => {
    const newSection: WebsiteSection = {
      id: `sec_${type}_${Date.now()}`,
      type,
      layout: 'centered',
      content: getSampleContentForType(type, document.title),
      isVisible: true,
    };

    const updated = [...sections, newSection];
    onUpdateSections(updated, `Added new "${type}" section`);
    setShowAddMenu(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Page Outline & CMS</h3>
            <p className="text-[11px] text-slate-400">
              Editing: <span className="text-indigo-300 font-mono">{page?.name || 'Home'}</span> ({sections.length} sections)
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Section List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
        {sections.map((section, idx) => {
          const heading = (section.content as any)?.heading || (section.content as any)?.title || 'Untitled Section';
          const isVisible = section.isVisible !== false;

          return (
            <div
              key={section.id || idx}
              className={`p-3 rounded-xl border transition-all ${
                isVisible
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  : 'bg-slate-50/80 border-dashed border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono shrink-0">
                    {section.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 truncate" title={heading}>
                    {heading}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(idx)}
                    title={isVisible ? 'Hide section' : 'Show section'}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenSectionEditor(section)}
                    title="Edit content"
                    className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(idx)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 text-slate-600 cursor-pointer text-[10px]"
                    title="Duplicate section"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-rose-50 text-rose-600 cursor-pointer text-[10px]"
                    title="Delete section"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Section Library Trigger */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
        {showAddMenu ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Choose Section Type:</span>
              <button
                type="button"
                onClick={() => setShowAddMenu(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1">
              {[
                'features',
                'services',
                'about',
                'pricing',
                'testimonials',
                'faq',
                'contact',
                'cta',
                'statistics',
                'team',
                'gallery',
                'process',
              ].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAddSection(type as SectionType)}
                  className="px-2.5 py-1.5 text-left text-xs bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-lg capitalize font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  + {type}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            className="w-full justify-center"
            onClick={() => setShowAddMenu(true)}
          >
            Insert New Section
          </Button>
        )}
      </div>
    </div>
  );
};

function getSampleContentForType(type: SectionType, siteTitle: string): Record<string, any> {
  switch (type) {
    case 'features':
      return {
        heading: `Key Capabilities of ${siteTitle}`,
        supportingText: 'Engineered for seamless efficiency and high performance.',
        items: [
          { title: 'Lightning Fast', description: 'Optimized response times across all global edge nodes.' },
          { title: 'Enterprise Secure', description: 'Zero-trust architecture with end-to-end data encryption.' },
          { title: 'Full Autonomy', description: 'Complete source code export with zero vendor dependency.' },
        ],
      };
    case 'services':
      return {
        heading: 'Our Core Offerings',
        supportingText: 'Comprehensive digital solutions tailored for fast-moving businesses.',
        items: [
          { title: 'Strategy & Consultation', description: 'Roadmapping your next 5 years of growth.' },
          { title: 'Custom Implementation', description: 'Architecting bespoke systems with speed.' },
        ],
      };
    case 'about':
      return {
        heading: `About ${siteTitle}`,
        supportingText: 'Driven by innovation and passionate craft.',
        story: 'Founded with a vision to redefine what modern web applications can achieve.',
      };
    case 'pricing':
      return {
        heading: 'Transparent Pricing Plans',
        supportingText: 'Choose the plan that fits your growth trajectory.',
        plans: [
          { name: 'Starter', price: '$29', period: '/month', features: ['Core Features', 'Email Support'] },
          { name: 'Professional', price: '$89', period: '/month', isPopular: true, features: ['Unlimited Projects', 'Priority SLA', 'Dedicated API'] },
        ],
      };
    case 'faq':
      return {
        heading: 'Frequently Asked Questions',
        supportingText: 'Everything you need to know about getting started.',
        faqs: [
          { question: 'Can I export the full code?', answer: 'Yes! Download the complete standalone React and Vite project anytime.' },
          { question: 'Is hosting included?', answer: 'You can deploy anywhere including Vercel, Netlify, or your private cloud.' },
        ],
      };
    case 'testimonials':
      return {
        heading: 'Trusted by Industry Leaders',
        supportingText: 'See what our clients and partners have to say.',
        testimonials: [
          { quote: 'Transformed our launch timeline completely.', author: 'Alex Mercer', role: 'Head of Product' },
        ],
      };
    case 'contact':
      return {
        heading: 'Contact Us',
        supportingText: 'Get in touch with our specialists today.',
        formFields: ['name', 'email', 'message'],
      };
    case 'cta':
      return {
        heading: 'Start Your Journey Today',
        supportingText: 'Join thousands of teams crafting the modern web.',
        buttonLabel: 'Get Started Now',
        buttonLink: '#contact',
      };
    default:
      return {
        heading: `${type.toUpperCase()} Section`,
        supportingText: 'Configurable section content.',
      };
  }
}
