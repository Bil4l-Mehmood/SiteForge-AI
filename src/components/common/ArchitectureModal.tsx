import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Layers, Cpu, Database, ShieldCheck, Download } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const modules = [
    {
      title: 'Foundation & App Shell (Active)',
      status: 'Implemented',
      desc: 'Modular navigation, responsive canvas simulator, project state contracts, and chat workspace layout.',
      icon: Layers,
      color: 'text-indigo-600',
    },
    {
      title: 'AI Generation Engine',
      status: 'Milestone 2',
      desc: 'Gemini 2.5 Flash / Pro pipeline to synthesize clean React & Tailwind components from natural language.',
      icon: Cpu,
      color: 'text-slate-500',
    },
    {
      title: 'Persistent Database & Cloud Storage',
      status: 'Milestone 3',
      desc: 'Firestore or PostgreSQL persistence replacing the local storage repository placeholder.',
      icon: Database,
      color: 'text-slate-500',
    },
    {
      title: 'User Authentication & Multi-Project RBAC',
      status: 'Milestone 4',
      desc: 'Secure session handling, user accounts, and project sharing.',
      icon: ShieldCheck,
      color: 'text-slate-500',
    },
    {
      title: 'Export & Live Deployment Pipeline',
      status: 'Milestone 5',
      desc: 'One-click ZIP downloads, GitHub push, and Cloud Run / Vercel deployment automation.',
      icon: Download,
      color: 'text-slate-500',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SiteForge AI — Architecture Roadmap"
      description="Modular system architecture overview."
      maxWidth="lg"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Got it
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          SiteForge AI is constructed with clean boundary interfaces. The current application shell
          establishes design tokens, viewport simulators, and state types so future modules can be
          attached without restructuring.
        </p>

        <div className="space-y-2.5">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3"
              >
                <div className="p-2 bg-white rounded-md border border-slate-200 mt-0.5 shrink-0">
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900">{m.title}</span>
                    <span className="text-[11px] font-mono text-slate-500">{m.status}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
