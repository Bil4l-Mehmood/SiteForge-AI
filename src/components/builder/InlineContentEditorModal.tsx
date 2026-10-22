import React, { useState } from 'react';
import { WebsiteSection } from '../../types/schema';
import { Button } from '../common/Button';
import { X, Save, Edit3, Image, Link, Type } from 'lucide-react';

interface InlineContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: WebsiteSection | null;
  onSave: (updatedSection: WebsiteSection) => void;
}

export const InlineContentEditorModal: React.FC<InlineContentEditorModalProps> = ({
  isOpen,
  onClose,
  section,
  onSave,
}) => {
  if (!isOpen || !section) return null;

  const content = (section.content || {}) as Record<string, any>;

  const [heading, setHeading] = useState<string>(content.heading || content.title || '');
  const [supportingText, setSupportingText] = useState<string>(content.supportingText || content.description || '');
  const [badge, setBadge] = useState<string>(content.badge || '');
  const [buttonLabel, setButtonLabel] = useState<string>(
    content.primaryCta?.label || content.buttonLabel || ''
  );
  const [buttonLink, setButtonLink] = useState<string>(
    content.primaryCta?.link || content.buttonLink || ''
  );
  const [imageUrl, setImageUrl] = useState<string>(content.imageUrl || content.backgroundImageUrl || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedContent: Record<string, any> = {
      ...content,
      heading: heading.trim(),
      supportingText: supportingText.trim(),
    };

    if (badge.trim()) updatedContent.badge = badge.trim();
    if (imageUrl.trim()) updatedContent.imageUrl = imageUrl.trim();

    if (buttonLabel.trim()) {
      if (content.primaryCta) {
        updatedContent.primaryCta = {
          ...content.primaryCta,
          label: buttonLabel.trim(),
          link: buttonLink.trim() || '#',
        };
      } else {
        updatedContent.buttonLabel = buttonLabel.trim();
        updatedContent.buttonLink = buttonLink.trim() || '#';
      }
    }

    onSave({
      ...section,
      content: updatedContent,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white capitalize">
                Edit {section.type} Section Content
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">ID: {section.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Badge */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Eyebrow / Badge Text (Optional)
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. NEW FEATURE"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* Heading */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Main Section Heading *
            </label>
            <input
              type="text"
              required
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Section heading"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
            />
          </div>

          {/* Subheading / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supporting Text / Subtitle
            </label>
            <textarea
              rows={3}
              value={supportingText}
              onChange={(e) => setSupportingText(e.target.value)}
              placeholder="Descriptive copy supporting this section..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* Primary CTA Button */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CTA Button Label
              </label>
              <input
                type="text"
                value={buttonLabel}
                onChange={(e) => setButtonLabel(e.target.value)}
                placeholder="e.g. Get Started"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Button Destination
              </label>
              <input
                type="text"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                placeholder="e.g. #contact or /pricing"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Media Image URL (Optional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono text-[11px]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Section Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
