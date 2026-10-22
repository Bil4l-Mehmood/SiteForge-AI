import React, { useState, useEffect } from 'react';
import { LeadService, LeadSubmission } from '../../services/leadService';
import { Button } from '../common/Button';
import {
  X,
  Download,
  Mail,
  User,
  Calendar,
  MessageSquare,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Inbox,
  Filter,
} from 'lucide-react';

interface LeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  websiteTitle?: string;
}

export const LeadsModal: React.FC<LeadsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  websiteTitle,
}) => {
  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'archived'>('all');
  const [selectedLead, setSelectedLead] = useState<LeadSubmission | null>(null);

  const reloadLeads = () => {
    const data = LeadService.getLeads();
    setLeads(data);
    if (data.length > 0 && !selectedLead) {
      setSelectedLead(data[0]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadLeads();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = leads.filter((l) => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  const handleStatusChange = (leadId: string, status: LeadSubmission['status']) => {
    LeadService.updateStatus(leadId, status);
    reloadLeads();
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status });
    }
  };

  const handleDelete = (leadId: string) => {
    LeadService.deleteLead(leadId);
    reloadLeads();
    if (selectedLead?.id === leadId) {
      setSelectedLead(null);
    }
  };

  const handleExportCsv = () => {
    const csv = LeadService.exportAsCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${websiteTitle || 'siteforge'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Inbox className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                Lead Capture Engine
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Inquiries & Form Submissions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and manage visitors who contacted you through website forms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              className="bg-slate-800 border-slate-700 text-slate-200 hover:text-white"
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {(['all', 'new', 'contacted', 'archived'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                  filter === st
                    ? 'bg-white border border-slate-300 text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st} ({st === 'all' ? leads.length : leads.filter((l) => l.status === st).length})
              </button>
            ))}
          </div>
          <span className="text-slate-400 text-[11px] font-mono">
            {filtered.length} submission{filtered.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* 2-Column Leads Workspace */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left: Leads List */}
          <div className="w-2/5 border-r border-slate-200 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No inquiries matching this filter.
              </div>
            ) : (
              filtered.map((lead) => {
                const isSelected = selectedLead?.id === lead.id;
                return (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => setSelectedLead(lead)}
                    className={`w-full text-left p-4 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {lead.name}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          lead.status === 'new'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.status === 'contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 truncate mb-1">
                      {lead.subject || lead.message}
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span className="truncate">{lead.email}</span>
                      <span>{new Date(lead.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Lead Detail View */}
          <div className="w-3/5 p-6 overflow-y-auto bg-slate-50/30">
            {selectedLead ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedLead.name}
                    </h3>
                    <div className="text-xs text-indigo-600 font-mono mt-0.5">
                      {selectedLead.email}
                      {selectedLead.phone && ` • ${selectedLead.phone}`}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Submitted on {new Date(selectedLead.submittedAt).toLocaleString()} via{' '}
                      <span className="font-medium text-slate-600">{selectedLead.websiteTitle}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(
                          selectedLead.id,
                          selectedLead.status === 'contacted' ? 'new' : 'contacted'
                        )
                      }
                      title="Toggle contacted status"
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 shadow-2xs cursor-pointer"
                    >
                      {selectedLead.status === 'contacted' ? 'Mark New' : 'Mark Contacted'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedLead.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {selectedLead.category && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Inquiry Category
                    </span>
                    <div className="text-xs font-semibold text-slate-800 mt-0.5">
                      {selectedLead.category}
                    </div>
                  </div>
                )}

                {selectedLead.subject && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Subject
                    </span>
                    <div className="text-xs font-semibold text-slate-800 mt-0.5">
                      {selectedLead.subject}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Message Body
                  </span>
                  <div className="mt-1.5 p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap shadow-2xs">
                    {selectedLead.message}
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`mailto:${selectedLead.email}?subject=Re: ${encodeURIComponent(
                      selectedLead.subject || 'Your Inquiry'
                    )}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs">
                Select an inquiry on the left to read its message.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
