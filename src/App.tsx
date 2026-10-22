import React, { useState, useEffect } from 'react';
import { AppView, Project } from './types';
import { ProjectService } from './services/projectService';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LandingHero } from './components/landing/LandingHero';
import { FeatureGrid } from './components/landing/FeatureGrid';
import { HowItWorks } from './components/landing/HowItWorks';
import { GenerationNoticeModal } from './components/landing/GenerationNoticeModal';
import { BuilderWorkspace } from './components/builder/BuilderWorkspace';
import { ProjectsView } from './components/projects/ProjectsView';
import { ArchitectureModal } from './components/common/ArchitectureModal';
import { AboutPage } from './components/pages/AboutPage';
import { ContactPage } from './components/pages/ContactPage';
import { AuthModal } from './components/auth/AuthModal';
import { ThemeShowcase } from './components/landing/ThemeShowcase';
import { ThemePresetOption } from './services/themePresets';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [queuedPrompt, setQueuedPrompt] = useState<string>('');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  // Load projects from storage on initial mount and restore last active project
  useEffect(() => {
    const loaded = ProjectService.getProjects();
    setProjects(loaded);

    if (loaded.length > 0) {
      const lastActiveId = ProjectService.getActiveProjectId();
      const matched = loaded.find((p) => p.id === lastActiveId);
      setActiveProject(matched || loaded[0]);
    }
  }, []);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateWebsite = (initialPrompt: string = '') => {
    const newProject = ProjectService.createProject(initialPrompt);
    const updatedProjects = ProjectService.getProjects();
    setProjects(updatedProjects);
    setActiveProject(newProject);
    setCurrentView('builder');
  };

  const handleGeneratePromptFromLanding = (prompt: string) => {
    setQueuedPrompt(prompt);
    handleCreateWebsite(prompt);
  };

  const handleCreateWithTheme = (themePreset: ThemePresetOption) => {
    const prompt = `Create a professional website styled with the ${themePreset.name} design aesthetic.`;
    const newProject = ProjectService.createProject(prompt, `${themePreset.name} Draft`);
    if (newProject.document) {
      newProject.document.theme = themePreset.theme;
    }
    ProjectService.saveProject(newProject);
    setProjects(ProjectService.getProjects());
    setActiveProject(newProject);
    setCurrentView('builder');
  };

  const handleProceedToBuilderFromNotice = () => {
    setIsNoticeModalOpen(false);
    handleCreateWebsite(queuedPrompt);
  };

  const handleOpenProjectInBuilder = (project: Project) => {
    setActiveProject(project);
    ProjectService.setActiveProjectId(project.id);
    setCurrentView('builder');
  };

  const handleDeleteProject = (projectId: string) => {
    ProjectService.deleteProject(projectId);
    const remaining = ProjectService.getProjects();
    setProjects(remaining);
    if (activeProject?.id === projectId) {
      setActiveProject(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const handleDuplicateProject = (projectId: string) => {
    const duplicated = ProjectService.duplicateProject(projectId);
    if (duplicated) {
      const updated = ProjectService.getProjects();
      setProjects(updated);
    }
  };

  const handleRenameProject = (projectId: string, newName: string) => {
    const updated = ProjectService.renameProject(projectId, newName);
    if (updated) {
      const all = ProjectService.getProjects();
      setProjects(all);
      if (activeProject?.id === projectId) {
        setActiveProject(updated);
      }
    }
  };

  const handleImportProject = (imported: Project) => {
    const all = ProjectService.getProjects();
    setProjects(all);
    setActiveProject(imported);
    ProjectService.setActiveProjectId(imported.id);
    setCurrentView('builder');
  };

  const handleUpdateActiveProject = (updated: Project) => {
    setActiveProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    ProjectService.setActiveProjectId(updated.id);
  };

  // Safe fallback if user enters Builder view without an active project
  const currentProject =
    activeProject ||
    (projects.length > 0 ? projects[0] : null) ||
    ProjectService.createProject('', 'New Project Draft');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* 3-Zone Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onCreateWebsite={() => handleCreateWebsite()}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onOpenAuth={(tab) => {
          setAuthModalTab(tab || 'signin');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'home' && (
          <div className="flex-1 flex flex-col">
            <LandingHero
              onGenerateWithPrompt={handleGeneratePromptFromLanding}
              onExploreBuilder={() => handleCreateWebsite()}
            />
            <ThemeShowcase onSelectThemeAndBuild={handleCreateWithTheme} />
            <FeatureGrid />
            <HowItWorks />
          </div>
        )}

        {currentView === 'projects' && (
          <ProjectsView
            projects={projects}
            onOpenProject={handleOpenProjectInBuilder}
            onCreateNewProject={() => handleCreateWebsite()}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onRenameProject={handleRenameProject}
            onImportProject={handleImportProject}
          />
        )}

        {currentView === 'builder' && (
          <BuilderWorkspace
            project={currentProject}
            onUpdateProject={handleUpdateActiveProject}
            onBackToProjects={() => handleNavigate('projects')}
            onSwitchProject={handleOpenProjectInBuilder}
            onCreateNewProject={() => handleCreateWebsite()}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            onStartBuilding={() => handleCreateWebsite()}
            onNavigateToContact={() => handleNavigate('contact')}
          />
        )}

        {currentView === 'contact' && (
          <ContactPage
            onStartBuilding={() => handleCreateWebsite()}
          />
        )}
      </main>

      {/* Footer (Rendered on Home, Projects, About, & Contact views) */}
      {currentView !== 'builder' && (
        <Footer
          onNavigate={handleNavigate}
          onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        />
      )}

      {/* Generation Notice Modal */}
      <GenerationNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        prompt={queuedPrompt}
        onProceedToBuilder={handleProceedToBuilderFromNotice}
      />

      {/* Architecture Roadmap Modal */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
}
