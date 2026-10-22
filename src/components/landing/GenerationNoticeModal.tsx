import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface GenerationNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  onProceedToBuilder: () => void;
}

export const GenerationNoticeModal: React.FC<GenerationNoticeModalProps> = ({
  isOpen,
  onClose,
  prompt,
  onProceedToBuilder,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Generation Not Connected Yet"
      description="Notice regarding modular development status"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Stay on Landing Page
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={onProceedToBuilder}
          >
            Continue to Builder with Prompt
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold block mb-0.5">Prompt Preserved</span>
            The live AI generation engine will be connected in a later development task.
            Your prompt has been validated and will be handed off into the Builder Workspace draft session.
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Submitted Prompt
          </span>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 italic whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
            {prompt}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          In the Builder Workspace, you can review this prompt in the chat history, test responsive
          device toggles, and inspect the preview canvas layout.
        </p>
      </div>
    </Modal>
  );
};
