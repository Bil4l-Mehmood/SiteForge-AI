import React, { useState } from 'react';
import { LeadService, LeadSubmission } from '../../services/leadService';
import { AuthService } from '../../services/authService';
import { Button } from '../common/Button';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  HelpCircle,
  Building,
  ShieldAlert,
} from 'lucide-react';

interface ContactPageProps {
  onStartBuilding: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onStartBuilding }) => {
  const currentUser = AuthService.getCurrentUser();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    category: 'General Inquiry' as LeadSubmission['category'],
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid business email address.');
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setError('Please enter a message with at least 10 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      await LeadService.submitLead({
        projectId: 'siteforge_app',
        websiteTitle: 'SiteForge AI Platform Inquiry',
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        category: formData.category,
        subject: formData.subject.trim() || `${formData.category} from ${formData.name}`,
        message: formData.message.trim(),
      });

      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setIsSubmitting(false);
      setError('An error occurred submitting your message. Please try again or email us directly.');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-12 sm:py-20 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-4">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>24/7 Global Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-950 mb-3">
            Contact SiteForge AI
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Have a question, need enterprise API scaling, or looking for dedicated support?
            Our engineering and customer success teams are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Direct Contact Info & Value Props */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Direct Contact Channels
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Email Inquiries</div>
                    <a
                      href="mailto:bilal@pctsc.com"
                      className="text-indigo-600 hover:underline font-mono text-[11px]"
                    >
                      bilal@pctsc.com
                    </a>
                    <div className="text-slate-400 text-[10px] mt-0.5">Response SLA within 24 hours</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Operating Hours</div>
                    <div className="text-slate-600">Monday – Friday: 08:00 – 20:00 UTC</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">Emergency AI support 24/7</div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Global Engineering Office</div>
                    <div className="text-slate-600">PCTSC Global Technology Center</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">Worldwide Cloud Infrastructure</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Enterprise Tier Benefits
                </div>
                Dedicated Gemini API rate allocation, custom domain white-labeling, and custom section schema tailoring.
              </div>
            </div>

            {/* Quick builder jump */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white text-center">
              <h3 className="font-bold text-sm mb-1.5">Want to test the AI immediately?</h3>
              <p className="text-xs text-slate-400 mb-4">
                You can generate a full website draft right now with zero setup.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
                onClick={onStartBuilding}
              >
                Launch Builder Workspace
              </Button>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-slate-900 mb-2">
                    Message Sent Successfully
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-8">
                    Thank you, <span className="font-semibold text-slate-900">{formData.name}</span>. We received your query regarding{' '}
                    <span className="font-semibold text-slate-900">{formData.category}</span>. A team member will respond to{' '}
                    <span className="font-semibold text-slate-900">{formData.email}</span> within 24 hours.
                  </p>

                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData((prev) => ({ ...prev, subject: '', message: '' }));
                      }}
                    >
                      Send Another Message
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={onStartBuilding}
                    >
                      Return to Builder
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      Send Us a Message
                    </h2>
                    <p className="text-xs text-slate-500">
                      Fill out the form below and we will route your request to the right department.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Bilal Ahmed"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Business Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. bilal@pctsc.com"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 019-2834"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Inquiry Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value as LeadSubmission['category'] })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Enterprise / API Access">Enterprise / API Access</option>
                        <option value="Client Inquiry">Client Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief topic summary..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your project requirements or question in detail..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-y"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSubmitting}
                      icon={<Send className="w-4 h-4" />}
                      className="w-full sm:w-auto"
                    >
                      Submit Inquiry
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
