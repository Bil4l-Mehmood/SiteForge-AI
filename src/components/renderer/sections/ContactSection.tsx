import React, { useState } from 'react';
import { WebsiteSection } from '../../../types/schema';
import { ThemeStyles } from '../themeUtils';
import { LeadService } from '../../../services/leadService';
import { Mail, Send, CheckCircle2, Lock } from 'lucide-react';

interface ContactSectionProps {
  section: WebsiteSection;
  themeStyles: ThemeStyles;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  section,
  themeStyles,
}) => {
  const content = (section.content || {}) as Record<string, any>;
  const heading = content.heading || 'Get in Touch';
  const supportingText = content.supportingText || content.description || 'Send us a message and our team will get back to you.';
  const email = content.email;
  const formFields = Array.isArray(content.formFields) && content.formFields.length > 0
    ? content.formFields
    : ['name', 'email', 'message'];
  const submissionNotice = content.submissionNotice || 'Form preview interface. Submissions will be wired to your custom inbox in production.';

  const [formData, setFormData] = useState<Record<string, string>>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic required field validation
    if (formFields.includes('name') && !formData.name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (formFields.includes('email') && (!formData.email.trim() || !formData.email.includes('@'))) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (formFields.includes('message') && !formData.message.trim()) {
      setErrorMessage('Please enter your message.');
      return;
    }

    // Record submission into LeadService
    LeadService.submitLead({
      projectId: section.id || 'generated_website',
      websiteTitle: heading,
      name: formData.name.trim() || 'Website Visitor',
      email: formData.email.trim() || 'visitor@example.com',
      phone: formData.phone.trim() || undefined,
      subject: formData.subject.trim() || `Inquiry for ${heading}`,
      category: 'Client Inquiry',
      message: formData.message.trim() || 'No message provided',
    }).catch(() => {});

    setSubmitted(true);
  };

  return (
    <section
      id={section.id}
      data-section-type="contact"
      className={`${themeStyles.spacingClass} px-4 sm:px-6 lg:px-8 border-t border-slate-100/60`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2
            className="text-2xl sm:text-4xl font-bold tracking-tight mb-3"
            style={{ color: themeStyles.colors.text }}
          >
            {heading}
          </h2>
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: themeStyles.colors.muted }}
          >
            {supportingText}
          </p>

          {email && (
            <div className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium" style={{ color: themeStyles.colors.primary }}>
              <Mail className="w-3.5 h-3.5" />
              <span>{email}</span>
            </div>
          )}
        </div>

        {/* Contact Form Card */}
        <div
          className={`${themeStyles.cardClass} p-6 sm:p-8 max-w-xl mx-auto shadow-sm`}
          style={themeStyles.cardStyle}
        >
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: themeStyles.colors.primary }}
              />
              <h3 className="text-base font-bold mb-1.5" style={{ color: themeStyles.colors.text }}>
                Form Field Validated
              </h3>
              <p className="text-xs max-w-sm mx-auto leading-relaxed mb-6" style={{ color: themeStyles.colors.muted }}>
                Input passed client-side validation. In a published deployment, your backend form submission handler will process and email these entries.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className={themeStyles.buttonClass('outline')}
                style={themeStyles.buttonInlineStyle('outline')}
              >
                Reset Preview Form
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                  {errorMessage}
                </div>
              )}

              {formFields.includes('name') && (
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold mb-1" style={{ color: themeStyles.colors.text }}>
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 bg-white border-slate-300"
                  />
                </div>
              )}

              {formFields.includes('email') && (
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold mb-1" style={{ color: themeStyles.colors.text }}>
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 bg-white border-slate-300"
                  />
                </div>
              )}

              {formFields.includes('phone') && (
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-semibold mb-1" style={{ color: themeStyles.colors.text }}>
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 bg-white border-slate-300"
                  />
                </div>
              )}

              {formFields.includes('subject') && (
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-semibold mb-1" style={{ color: themeStyles.colors.text }}>
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Project Inquiry"
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 bg-white border-slate-300"
                  />
                </div>
              )}

              {formFields.includes('message') && (
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold mb-1" style={{ color: themeStyles.colors.text }}>
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your project or inquiry..."
                    className="w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 bg-white border-slate-300 resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className={`w-full ${themeStyles.buttonClass('primary')}`}
                style={themeStyles.buttonInlineStyle('primary')}
              >
                <span>Send Message</span>
                <Send className="w-3.5 h-3.5 ml-1.5" />
              </button>

              {/* Honest Notice */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 justify-center">
                <Lock className="w-3 h-3" />
                <span>{submissionNotice}</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
