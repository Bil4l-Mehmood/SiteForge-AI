import React, { useState, useEffect, useRef } from 'react';
import { Project, ViewportMode, ChatMessage } from '../../types';
import { BuilderToolbar } from './BuilderToolbar';
import { ChatPanel } from './ChatPanel';
import { WebsitePreview } from './WebsitePreview';
import { ExportModal } from './ExportModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { ProjectSwitcherModal } from './ProjectSwitcherModal';
import { ProjectService } from '../../services/projectService';
import { AIService } from '../../services/aiService';
import { WebsiteDocumentSchema, WebsiteTheme, WebsiteSection, WebsiteDocument } from '../../types/schema';
import { ThemePresetsModal } from './ThemePresetsModal';
import { SectionManagerDrawer } from './SectionManagerDrawer';
import { LeadsModal } from './LeadsModal';
import { SeoAuditModal } from './SeoAuditModal';
import { InlineContentEditorModal } from './InlineContentEditorModal';
import { MessageSquare, LayoutTemplate } from 'lucide-react';

interface BuilderWorkspaceProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onBackToProjects: () => void;
  onSwitchProject?: (project: Project) => void;
  onCreateNewProject?: () => void;
}

export const BuilderWorkspace: React.FC<BuilderWorkspaceProps> = ({
  project,
  onUpdateProject,
  onBackToProjects,
  onSwitchProject,
  onCreateNewProject,
}) => {
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [mobileTab, setMobileTab] = useState<'chat' | 'preview'>('chat');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isSwitcherModalOpen, setIsSwitcherModalOpen] = useState<boolean>(false);
  const [isThemesModalOpen, setIsThemesModalOpen] = useState<boolean>(false);
  const [isOutlineDrawerOpen, setIsOutlineDrawerOpen] = useState<boolean>(false);
  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState<boolean>(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);
  const [editingSection, setEditingSection] = useState<WebsiteSection | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [allProjects, setAllProjects] = useState<Project[]>(() => ProjectService.getProjects());

  const autoTriggerRef = useRef(false);
  const requestSeqRef = useRef<number>(0);

  const handleApplyTheme = (newTheme: WebsiteTheme, presetName: string) => {
    const currentDoc = project.document || project.specification;
    if (!currentDoc) return;

    const updatedDoc: WebsiteDocument = {
      ...currentDoc,
      theme: newTheme,
      updatedAt: new Date().toISOString(),
    };

    const updatedProject: Project = {
      ...project,
      document: updatedDoc,
      specification: updatedDoc,
      updatedAt: new Date().toISOString(),
    };

    onUpdateProject(updatedProject);
    ProjectService.saveProject(updatedProject);
    ProjectService.addVersion(
      project.id,
      updatedDoc,
      `Applied ${presetName} Theme`,
      `Applied curated designer palette: ${presetName}`,
      'edit'
    );
  };

  const handleUpdateSections = (updatedSections: WebsiteSection[], summary: string) => {
    const currentDoc = project.document || project.specification;
    if (!currentDoc) return;

    const currentPath = project.currentPagePath || '/';
    const updatedPages = currentDoc.pages.map((p) =>
      p.path === currentPath ? { ...p, sections: updatedSections } : p
    );

    const updatedDoc: WebsiteDocument = {
      ...currentDoc,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };

    const updatedProject: Project = {
      ...project,
      document: updatedDoc,
      specification: updatedDoc,
      updatedAt: new Date().toISOString(),
    };

    onUpdateProject(updatedProject);
    ProjectService.saveProject(updatedProject);
    ProjectService.addVersion(project.id, updatedDoc, summary, summary, 'edit');
  };

  const handleSaveEditedSection = (updatedSection: WebsiteSection) => {
    const currentDoc = project.document || project.specification;
    if (!currentDoc) return;

    const currentPath = project.currentPagePath || '/';
    const updatedPages = currentDoc.pages.map((p) => {
      if (p.path === currentPath) {
        return {
          ...p,
          sections: p.sections.map((s) => (s.id === updatedSection.id ? updatedSection : s)),
        };
      }
      return p;
    });

    const updatedDoc: WebsiteDocument = {
      ...currentDoc,
      pages: updatedPages,
      updatedAt: new Date().toISOString(),
    };

    const updatedProject: Project = {
      ...project,
      document: updatedDoc,
      specification: updatedDoc,
      updatedAt: new Date().toISOString(),
    };

    onUpdateProject(updatedProject);
    ProjectService.saveProject(updatedProject);
    ProjectService.addVersion(
      project.id,
      updatedDoc,
      `Edited ${updatedSection.type} section`,
      `Direct content update for ${updatedSection.type}`,
      'edit'
    );
  };

  // Refresh local projects list when switching or saving
  const refreshProjectsList = () => {
    setAllProjects(ProjectService.getProjects());
  };

  // Auto-generate if arriving with a queued initial prompt and no specification yet
  useEffect(() => {
    if (
      project.initialPrompt &&
      !project.specification &&
      project.status === 'idle' &&
      !autoTriggerRef.current &&
      !isGenerating
    ) {
      autoTriggerRef.current = true;
      const alreadyHasPrompt = project.chatHistory.some(
        (m) => m.sender === 'user' && m.content.trim() === project.initialPrompt.trim()
      );
      handleSendMessage(project.initialPrompt, alreadyHasPrompt);
    }
  }, [project.id]);

  const handleRenameProject = (newName: string) => {
    const updated = ProjectService.renameProject(project.id, newName);
    if (updated) {
      onUpdateProject(updated);
      refreshProjectsList();
    }
  };

  const handleManualSave = () => {
    ProjectService.saveProject(project);
    refreshProjectsList();
  };

  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const handleSendMessage = async (content: string, skipAddingUserMessage: boolean = false) => {
    if (!content.trim() || isGenerating) return;

    const timestamp = new Date().toISOString();
    const currentSeq = ++requestSeqRef.current;

    const userMessage: ChatMessage = {
      id: 'msg_user_' + Math.random().toString(36).substring(2, 9),
      sender: 'user',
      content,
      timestamp,
    };

    // Prevent duplicate user message bubble if already present at the end of chat history
    const lastMsg = project.chatHistory[project.chatHistory.length - 1];
    const isDuplicate =
      !skipAddingUserMessage &&
      lastMsg &&
      lastMsg.sender === 'user' &&
      lastMsg.content.trim() === content.trim();
    const shouldSkip = skipAddingUserMessage || Boolean(isDuplicate);

    // Update conversation with user message immediately (unless retrying already logged message)
    const intermediateProject: Project = {
      ...project,
      chatHistory: shouldSkip ? project.chatHistory : [...project.chatHistory, userMessage],
      status: 'generating',
      updatedAt: timestamp,
    };
    onUpdateProject(intermediateProject);
    ProjectService.saveProject(intermediateProject);

    setIsGenerating(true);

    const currentDoc = project.document || project.specification;

    try {
      if (currentDoc) {
        // Conversational Website Editing Flow
        const conversationalHistory = project.chatHistory
          .filter((msg) => msg.sender === 'user' || msg.sender === 'assistant')
          .slice(-6)
          .map((msg) => ({
            sender: msg.sender as 'user' | 'assistant',
            content: msg.content,
          }));

        const result = await AIService.editWebsite({
          instruction: content,
          currentDocument: currentDoc,
          history: conversationalHistory,
          projectId: project.id,
        });

        // Discard stale responses if a newer request or restore occurred
        if (currentSeq !== requestSeqRef.current) return;

        const responseTime = new Date().toISOString();

        if (result.success && result.document) {
          setLastFailedPrompt(null);
          const updatedDoc = result.document;
          const summary = result.changeSummary || 'Website updated according to your instructions.';

          const assistantMessage: ChatMessage = {
            id: 'msg_asst_' + Math.random().toString(36).substring(2, 9),
            sender: 'assistant',
            content: `✓ **Updated Website**: ${summary}\n\nThe preview canvas has automatically updated with the changes.`,
            timestamp: responseTime,
          };

          // Save new version into documentHistory with sequential version number
          const existingHistory = project.documentHistory || [
            {
              id: 'ver_init',
              versionNumber: 1,
              document: currentDoc,
              timestamp: project.createdAt,
              label: 'Initial Generation',
              summary: 'Base website structure synthesized',
              changeType: 'generation' as const,
            },
          ];

          const newVersion = {
            id: 'ver_' + Math.random().toString(36).substring(2, 9),
            versionNumber: existingHistory.length + 1,
            document: updatedDoc,
            timestamp: responseTime,
            label: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
            summary,
            changeType: 'edit' as const,
          };

          const updatedProject: Project = {
            ...intermediateProject,
            name: updatedDoc.title || project.name,
            document: updatedDoc,
            specification: updatedDoc,
            status: 'ready',
            chatHistory: [...intermediateProject.chatHistory, assistantMessage],
            documentHistory: [...existingHistory, newVersion],
            activeVersionId: newVersion.id,
            updatedAt: responseTime,
          };

          onUpdateProject(updatedProject);
          ProjectService.saveProject(updatedProject);
          refreshProjectsList();

          if (window.innerWidth < 1024) {
            setMobileTab('preview');
          }
        } else {
          setLastFailedPrompt(content);
          const errorMessage: ChatMessage = {
            id: 'msg_sys_err_' + Math.random().toString(36).substring(2, 9),
            sender: 'system',
            content: `Edit Notice: ${result.message} Your previous website layout was preserved.`,
            timestamp: responseTime,
            isError: true,
            retryPrompt: content,
          };

          const updatedProject: Project = {
            ...intermediateProject,
            status: 'ready', // Keep ready so previous website remains visible!
            chatHistory: [...intermediateProject.chatHistory, errorMessage],
            updatedAt: responseTime,
          };

          onUpdateProject(updatedProject);
          ProjectService.saveProject(updatedProject);
          refreshProjectsList();
        }
      } else {
        // Initial Website Generation Flow
        const result = await AIService.generateWebsite({
          prompt: content,
          projectId: project.id,
        });

        // Discard stale responses if a newer request or restore occurred
        if (currentSeq !== requestSeqRef.current) return;

        const responseTime = new Date().toISOString();

        if (result.success && result.specification) {
          setLastFailedPrompt(null);
          const spec = result.specification;
          const totalSections = spec.pages.reduce(
            (acc, page) => acc + page.sections.length,
            0
          );
          const pageNames = spec.pages.map((p) => p.name).join(', ');

          const fontName = spec.theme.fontFamily || (spec.theme as any).fontStyle || 'Plus Jakarta Sans';
          const assistantMessage: ChatMessage = {
            id: 'msg_asst_' + Math.random().toString(36).substring(2, 9),
            sender: 'assistant',
            content: `I have generated the website for **${spec.title}**!\n\n• **Summary**: ${spec.description}\n• **Pages (${spec.pages.length})**: ${pageNames}\n• **Sections**: ${totalSections} structured sections\n• **Theme**: Primary ${spec.theme.primaryColor}, Font: ${fontName}\n\nYou can now refine anything conversationally! Try saying:\n- "Change primary color to dark blue"\n- "Make the hero section headline punchier"\n- "Add a testimonials section below features"`,
            timestamp: responseTime,
          };

          const initialVersion = {
            id: 'ver_init',
            versionNumber: 1,
            document: spec,
            timestamp: responseTime,
            label: 'Initial Generation',
            summary: `Synthesized ${spec.pages.length} pages and ${totalSections} sections`,
            changeType: 'generation' as const,
          };

          const updatedProject: Project = {
            ...intermediateProject,
            name:
              project.name === 'Untitled Website' || !project.name
                ? spec.title
                : project.name,
            document: spec,
            specification: spec,
            status: 'ready',
            chatHistory: [...intermediateProject.chatHistory, assistantMessage],
            documentHistory: [initialVersion],
            activeVersionId: initialVersion.id,
            updatedAt: responseTime,
          };

          onUpdateProject(updatedProject);
          ProjectService.saveProject(updatedProject);
          refreshProjectsList();

          if (window.innerWidth < 1024) {
            setMobileTab('preview');
          }
        } else {
          setLastFailedPrompt(content);
          const errorMessage: ChatMessage = {
            id: 'msg_sys_err_' + Math.random().toString(36).substring(2, 9),
            sender: 'system',
            content: `Generation Notice: ${result.message}`,
            timestamp: responseTime,
            isError: true,
            retryPrompt: content,
          };

          const updatedProject: Project = {
            ...intermediateProject,
            status: 'error',
            chatHistory: [...intermediateProject.chatHistory, errorMessage],
            updatedAt: responseTime,
          };

          onUpdateProject(updatedProject);
          ProjectService.saveProject(updatedProject);
          refreshProjectsList();
        }
      }
    } catch (err: unknown) {
      setLastFailedPrompt(content);
      const errorMsg = err instanceof Error ? err.message : 'Unknown processing failure.';
      const responseTime = new Date().toISOString();

      const errorMessage: ChatMessage = {
        id: 'msg_sys_err_' + Math.random().toString(36).substring(2, 9),
        sender: 'system',
        content: `Error: ${errorMsg}`,
        timestamp: responseTime,
        isError: true,
        retryPrompt: content,
      };

      const updatedProject: Project = {
        ...intermediateProject,
        status: currentDoc ? 'ready' : 'error',
        chatHistory: [...intermediateProject.chatHistory, errorMessage],
        updatedAt: responseTime,
      };

      onUpdateProject(updatedProject);
      ProjectService.saveProject(updatedProject);
      refreshProjectsList();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = (promptToRetry?: string) => {
    const prompt = promptToRetry || lastFailedPrompt || project.initialPrompt;
    if (!prompt || isGenerating) return;

    // Remove any trailing system error message to prevent cluttering or duplicating
    const cleanedHistory = project.chatHistory.filter(
      (m, idx) => !(idx === project.chatHistory.length - 1 && m.sender === 'system' && (m.isError || m.content.includes('Notice:') || m.content.includes('Error:')))
    );

    const lastMsg = cleanedHistory[cleanedHistory.length - 1];
    if (lastMsg && lastMsg.sender === 'user' && lastMsg.content.trim() === prompt.trim()) {
      const sanitizedProject: Project = {
        ...project,
        chatHistory: cleanedHistory,
      };
      onUpdateProject(sanitizedProject);
      handleSendMessage(prompt, true);
    } else {
      const sanitizedProject: Project = {
        ...project,
        chatHistory: cleanedHistory,
      };
      onUpdateProject(sanitizedProject);
      handleSendMessage(prompt, false);
    }
  };

  const handleRestoreVersion = (versionId: string) => {
    // Invalidate any in-flight asynchronous edits
    requestSeqRef.current++;

    const result = ProjectService.restoreVersion(project.id, versionId);
    if (!result) {
      const timestamp = new Date().toISOString();
      const failNotice: ChatMessage = {
        id: 'msg_sys_err_' + Math.random().toString(36).substring(2, 9),
        sender: 'system',
        content: 'Restoration Notice: Unable to restore the selected version because the snapshot could not be validated. Your current website was preserved.',
        timestamp,
      };
      const updatedProject: Project = {
        ...project,
        chatHistory: [...project.chatHistory, failNotice],
        updatedAt: timestamp,
      };
      onUpdateProject(updatedProject);
      ProjectService.saveProject(updatedProject);
      return;
    }
    const { project: restoredProject, restoredVersion } = result;

    const timestamp = new Date().toISOString();
    const systemNotice: ChatMessage = {
      id: 'msg_sys_' + Math.random().toString(36).substring(2, 9),
      sender: 'system',
      content: `✓ **Restored Version**: "${restoredVersion.label}"\n\nThe preview canvas has refreshed to this revision. Subsequent conversational edits will build upon this restored state.`,
      timestamp,
    };

    const finalProject: Project = {
      ...restoredProject,
      chatHistory: [...restoredProject.chatHistory, systemNotice],
    };

    onUpdateProject(finalProject);
    ProjectService.saveProject(finalProject);
    refreshProjectsList();
  };

  const handleClearChat = () => {
    const updated: Project = {
      ...project,
      chatHistory: [],
      updatedAt: new Date().toISOString(),
    };
    onUpdateProject(updated);
    ProjectService.saveProject(updated);
    refreshProjectsList();
  };

  const handleCreateNew = () => {
    if (onCreateNewProject) {
      onCreateNewProject();
    } else {
      const newProj = ProjectService.createProject('', 'Untitled Website');
      onUpdateProject(newProj);
      refreshProjectsList();
    }
  };

  const handleDuplicate = () => {
    const duplicated = ProjectService.duplicateProject(project.id);
    if (duplicated) {
      refreshProjectsList();
      onUpdateProject(duplicated);
    }
  };

  const handleDeleteCurrent = () => {
    ProjectService.deleteProject(project.id);
    const remaining = ProjectService.getProjects();
    refreshProjectsList();
    if (remaining.length > 0) {
      onUpdateProject(remaining[0]);
    } else {
      const fallback = ProjectService.createProject('', 'New Project Draft');
      onUpdateProject(fallback);
      refreshProjectsList();
    }
  };

  const handleSelectFromSwitcher = (targetProject: Project) => {
    if (onSwitchProject) {
      onSwitchProject(targetProject);
    } else {
      onUpdateProject(targetProject);
    }
    ProjectService.setActiveProjectId(targetProject.id);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-100">
      {/* Top Builder Toolbar */}
      <BuilderToolbar
        project={project}
        viewportMode={viewportMode}
        onViewportChange={setViewportMode}
        onRenameProject={handleRenameProject}
        onExportClick={() => setIsExportModalOpen(true)}
        onBackToProjects={onBackToProjects}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenSwitcher={() => {
          refreshProjectsList();
          setIsSwitcherModalOpen(true);
        }}
        onCreateNewProject={handleCreateNew}
        onDuplicateProject={handleDuplicate}
        onDeleteProject={handleDeleteCurrent}
        onManualSave={handleManualSave}
        onOpenThemes={() => setIsThemesModalOpen(true)}
        onOpenOutline={() => setIsOutlineDrawerOpen(true)}
        onOpenLeads={() => setIsLeadsModalOpen(true)}
        onOpenSeoAudit={() => setIsSeoModalOpen(true)}
      />

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center shrink-0">
        <div
          role="tablist"
          aria-label="Workspace views"
          className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 w-full max-w-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'chat'}
            onClick={() => setMobileTab('chat')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mobileTab === 'chat'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat ({project.chatHistory.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'preview'}
            onClick={() => setMobileTab('preview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>
              Preview {project.specification ? '(Ready)' : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Main Workspace Regions */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Conversation Panel */}
        <div
          className={`h-full lg:w-[380px] xl:w-[420px] shrink-0 ${
            mobileTab === 'chat' ? 'flex flex-col w-full' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          <ChatPanel
            project={project}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onRevertVersion={handleRestoreVersion}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
            onRetry={handleRetry}
            isLoading={isGenerating}
            className="h-full"
          />
        </div>

        {/* Main Website Preview Canvas */}
        <div
          className={`h-full flex-1 overflow-hidden ${
            mobileTab === 'preview' ? 'flex flex-col w-full' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          <WebsitePreview
            project={project}
            viewportMode={viewportMode}
            onViewportChange={setViewportMode}
            onSelectPromptSuggestion={handleSendMessage}
            onRetry={handleRetry}
            onOpenThemes={() => setIsThemesModalOpen(true)}
            isLoading={isGenerating}
            className="h-full"
          />
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        project={project}
        onRestoreVersion={handleRestoreVersion}
      />

      {/* Project Switcher Modal */}
      <ProjectSwitcherModal
        isOpen={isSwitcherModalOpen}
        onClose={() => setIsSwitcherModalOpen(false)}
        projects={allProjects}
        activeProjectId={project.id}
        onSelectProject={handleSelectFromSwitcher}
        onCreateNewProject={handleCreateNew}
        onDuplicateProject={(id) => {
          ProjectService.duplicateProject(id);
          refreshProjectsList();
        }}
        onDeleteProject={(id) => {
          ProjectService.deleteProject(id);
          refreshProjectsList();
          if (id === project.id) {
            handleDeleteCurrent();
          }
        }}
      />

      {/* Theme Presets Modal (Option 2) */}
      {(project.document || project.specification) && (
        <ThemePresetsModal
          isOpen={isThemesModalOpen}
          onClose={() => setIsThemesModalOpen(false)}
          currentTheme={(project.document || project.specification)!.theme}
          onApplyTheme={handleApplyTheme}
        />
      )}

      {/* Page Outline & Section Manager Drawer (Option 3) */}
      {(project.document || project.specification) && (
        <SectionManagerDrawer
          isOpen={isOutlineDrawerOpen}
          onClose={() => setIsOutlineDrawerOpen(false)}
          document={(project.document || project.specification)!}
          currentPagePath={project.currentPagePath || '/'}
          onUpdateSections={handleUpdateSections}
          onOpenSectionEditor={(section) => {
            setEditingSection(section);
            setIsOutlineDrawerOpen(false);
          }}
        />
      )}

      {/* Inline Section Content Editor Modal (Option 3) */}
      <InlineContentEditorModal
        isOpen={editingSection !== null}
        onClose={() => setEditingSection(null)}
        section={editingSection}
        onSave={handleSaveEditedSection}
      />

      {/* Leads & Contact Form Queries Modal (Option 4) */}
      <LeadsModal
        isOpen={isLeadsModalOpen}
        onClose={() => setIsLeadsModalOpen(false)}
        projectId={project.id}
        websiteTitle={project.name}
      />

      {/* SEO & Performance Audit Modal (Option 4) */}
      {(project.document || project.specification) && (
        <SeoAuditModal
          isOpen={isSeoModalOpen}
          onClose={() => setIsSeoModalOpen(false)}
          document={(project.document || project.specification)!}
        />
      )}
    </div>
  );
};
