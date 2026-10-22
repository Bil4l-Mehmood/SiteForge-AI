import React, { useState, useRef, useEffect } from 'react';
import { ViewportMode, DeviceOrientation, ZoomLevel, Project } from '../../types';
import { EmptyPreviewState } from './EmptyPreviewState';
import { SpecificationPreviewState } from './SpecificationPreviewState';
import { WebsiteRenderer } from '../renderer/WebsiteRenderer';
import { ResponsiveIframe } from './ResponsiveIframe';
import {
  Lock,
  RotateCw,
  Eye,
  FileCode2,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  SmartphoneNfc,
  ExternalLink,
  ChevronDown,
  Layers,
  ZoomIn,
  Palette,
} from 'lucide-react';

interface WebsitePreviewProps {
  project: Project;
  viewportMode: ViewportMode;
  onViewportChange?: (mode: ViewportMode) => void;
  onSelectPromptSuggestion?: (prompt: string) => void;
  onRetry?: () => void;
  onOpenThemes?: () => void;
  isLoading?: boolean;
  className?: string;
}

// Canonical default viewport dimensions
const DEVICE_DIMENSIONS: Record<
  'desktop' | 'tablet' | 'mobile',
  { portrait: { width: number; height: number }; landscape: { width: number; height: number } }
> = {
  desktop: {
    portrait: { width: 1440, height: 900 },
    landscape: { width: 1440, height: 900 },
  },
  tablet: {
    portrait: { width: 768, height: 1024 },
    landscape: { width: 1024, height: 768 },
  },
  mobile: {
    portrait: { width: 390, height: 844 },
    landscape: { width: 844, height: 390 },
  },
};

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  project,
  viewportMode: controlledViewportMode,
  onViewportChange,
  onSelectPromptSuggestion,
  onRetry,
  onOpenThemes,
  isLoading,
  className = '',
}) => {
  const [internalMode, setInternalMode] = useState<ViewportMode>(controlledViewportMode || 'desktop');
  const currentMode = controlledViewportMode || internalMode;

  const [orientation, setOrientation] = useState<DeviceOrientation>('portrait');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('fit');
  const [showDeviceBezel, setShowDeviceBezel] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [canvasViewMode, setCanvasViewMode] = useState<'live' | 'blueprint'>('live');
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(1440);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  // Available container measurement for auto-fit scaling
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1200);

  // Update container width on resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasContainerRef.current) {
        setContainerWidth(canvasContainerRef.current.clientWidth);
      }
    };
    updateSize();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Sync mode changes
  const handleModeChange = (newMode: ViewportMode) => {
    setInternalMode(newMode);
    onViewportChange?.(newMode);

    if (newMode === 'mobile') {
      setCustomWidth(390);
    } else if (newMode === 'tablet') {
      setCustomWidth(768);
    } else if (newMode === 'desktop') {
      setCustomWidth(1440);
    }
  };

  // Sync current page path from project or reset on project change
  useEffect(() => {
    if (project.currentPagePath) {
      setCurrentPath(project.currentPagePath);
    } else {
      setCurrentPath('/');
    }
  }, [project.id, project.currentPagePath]);

  const handleToggleOrientation = () => {
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  const activeDoc = project.document || project.specification;
  const hasSpecification = Boolean(activeDoc);

  const siteSlug = activeDoc?.title
    ? activeDoc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : 'preview';

  const previewUrl = hasSpecification
    ? `https://${siteSlug}.siteforge.live${currentPath === '/' ? '' : currentPath}`
    : 'Preview unavailable';

  const handleRefresh = () => {
    setReloadKey((prev) => prev + 1);
  };

  // Compute targeted dimensions
  const getTargetDimensions = (): { width: number; height: number } => {
    if (currentMode === 'custom') {
      return { width: customWidth, height: 860 };
    }
    const modeKey = currentMode as 'desktop' | 'tablet' | 'mobile';
    const config = DEVICE_DIMENSIONS[modeKey] || DEVICE_DIMENSIONS.desktop;
    return config[orientation];
  };

  const targetDimensions = getTargetDimensions();

  // Compute scale factor
  const computeScale = (): number => {
    if (zoomLevel === 100) return 1.0;
    if (zoomLevel === 75) return 0.75;
    if (zoomLevel === 50) return 0.5;

    // 'fit' mode
    const availableHorizontal = Math.max(300, containerWidth - 48);
    if (targetDimensions.width > availableHorizontal) {
      return Math.min(1.0, Math.max(0.35, availableHorizontal / targetDimensions.width));
    }
    return 1.0;
  };

  const scale = computeScale();

  // Draggable width resize handler
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = targetDimensions.width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) * 2; // Symmetric resize
      const newWidth = Math.max(320, Math.min(1920, Math.round(startWidth + deltaX)));
      setCustomWidth(newWidth);
      if (currentMode !== 'custom') {
        handleModeChange('custom');
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      className={`flex-1 bg-slate-100 flex flex-col overflow-hidden relative ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md p-4' : ''
      } ${className}`}
    >
      {/* Top Preview Canvas Sub-Bar */}
      <div className="h-12 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0 z-20 shadow-2xs select-none">
        {/* Left: Device Selection & Orientation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Segmented Device Selector */}
          <div
            role="group"
            aria-label="Preview viewport device controls"
            className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200"
          >
            <button
              type="button"
              onClick={() => handleModeChange('desktop')}
              aria-pressed={currentMode === 'desktop'}
              aria-label="Desktop Viewport (1440px)"
              title="Desktop Viewport (1440px)"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                currentMode === 'desktop'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('tablet')}
              aria-pressed={currentMode === 'tablet'}
              aria-label="Tablet Viewport (768px)"
              title="Tablet Viewport (768px)"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                currentMode === 'tablet'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('mobile')}
              aria-pressed={currentMode === 'mobile'}
              aria-label="Mobile Viewport (390px)"
              title="Mobile Viewport (390px)"
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                currentMode === 'mobile'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {/* Orientation Flip (for Tablet & Mobile) */}
          {(currentMode === 'tablet' || currentMode === 'mobile') && (
            <button
              type="button"
              onClick={handleToggleOrientation}
              aria-label={`Toggle orientation to ${orientation === 'portrait' ? 'landscape' : 'portrait'}`}
              title={`Rotate device: current is ${orientation}`}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <SmartphoneNfc className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline capitalize">{orientation}</span>
            </button>
          )}

          {/* Device Bezel Toggle (for Tablet & Mobile) */}
          {(currentMode === 'tablet' || currentMode === 'mobile') && (
            <button
              type="button"
              onClick={() => setShowDeviceBezel(!showDeviceBezel)}
              title={showDeviceBezel ? 'Switch to borderless preview' : 'Switch to realistic device bezel frame'}
              aria-pressed={showDeviceBezel}
              className={`hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                showDeviceBezel
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3 h-3 text-slate-500" />
              <span>Frame</span>
            </button>
          )}
        </div>

        {/* Center: Live Dimensions Badge & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Dimension badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700"
            title="Current viewport width × height"
          >
            <span className="font-semibold">{targetDimensions.width}</span>
            <span className="text-slate-400">×</span>
            <span>{targetDimensions.height} px</span>
            {scale < 0.99 && (
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 rounded font-sans font-medium ml-1">
                {Math.round(scale * 100)}%
              </span>
            )}
          </div>

          {/* Zoom Selector */}
          <div className="hidden xl:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setZoomLevel('fit')}
              aria-pressed={zoomLevel === 'fit'}
              title="Auto-scale preview to fit workspace width"
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                zoomLevel === 'fit'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Fit
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              aria-pressed={zoomLevel === 100}
              title="100% Actual 1:1 CSS pixels"
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                zoomLevel === 100
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(75)}
              aria-pressed={zoomLevel === 75}
              title="75% scale"
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                zoomLevel === 75
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              75%
            </button>
          </div>
        </div>

        {/* Right: Mode Switcher (Live vs Blueprint) & Fullscreen Canvas */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {hasSpecification && (
            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setCanvasViewMode('live')}
                aria-pressed={canvasViewMode === 'live'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  canvasViewMode === 'live'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3 h-3 text-emerald-600" />
                <span className="hidden sm:inline">Live</span>
              </button>

              <button
                type="button"
                onClick={() => setCanvasViewMode('blueprint')}
                aria-pressed={canvasViewMode === 'blueprint'}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  canvasViewMode === 'blueprint'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileCode2 className="w-3 h-3 text-indigo-600" />
                <span className="hidden sm:inline">Blueprint</span>
              </button>
            </div>
          )}

          {/* Fullscreen / Focus Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? 'Exit full screen preview' : 'Enter full screen preview'}
            title={isFullscreen ? 'Exit full preview (Esc)' : 'Expand preview to full view'}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Scrollable Stage */}
      <div
        ref={canvasContainerRef}
        className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-6 flex flex-col items-center justify-start select-none relative"
      >
        {/* Scaled Layout Wrapper */}
        <div
          style={{
            width: `${Math.round(targetDimensions.width * scale)}px`,
            minHeight: `${Math.round(targetDimensions.height * scale)}px`,
            position: 'relative',
          }}
          className="transition-all duration-300 ease-out flex flex-col items-center my-auto shrink-0"
        >
          {/* Inner Device Frame */}
          <div
            style={{
              width: `${targetDimensions.width}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
            }}
            className={`transition-all duration-200 ease-out flex flex-col bg-white overflow-hidden shadow-xl ${
              // Mobile Frame Styling
              currentMode === 'mobile' && showDeviceBezel
                ? 'rounded-[44px] border-[10px] border-slate-900 ring-1 ring-slate-800'
                : // Tablet Frame Styling
                currentMode === 'tablet' && showDeviceBezel
                ? 'rounded-[28px] border-[12px] border-slate-800 ring-1 ring-slate-700'
                : // Desktop / Frameless
                  'rounded-xl border border-slate-300/80 shadow-md'
            }`}
          >
            {/* Top Device Bezel Elements (Mobile / Tablet) */}
            {currentMode === 'mobile' && showDeviceBezel && (
              <div className="bg-slate-900 h-6 w-full flex items-center justify-center shrink-0 relative px-6 select-none">
                {/* Dynamic Island / Speaker Pill */}
                <div className="w-24 h-3.5 bg-black rounded-full flex items-center justify-end pr-2 gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <div className="w-1 h-1 rounded-full bg-indigo-950" />
                </div>
              </div>
            )}

            {currentMode === 'tablet' && showDeviceBezel && (
              <div className="bg-slate-800 h-5 w-full flex items-center justify-center shrink-0 relative select-none">
                {/* Front camera lens */}
                <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-700" />
              </div>
            )}

            {/* Browser Chrome Toolbar (macOS Style) */}
            <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shrink-0 select-none">
              {/* Window action buttons */}
              <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                <div className={`w-2.5 h-2.5 rounded-full ${hasSpecification ? 'bg-rose-400' : 'bg-slate-300'}`} />
                <div className={`w-2.5 h-2.5 rounded-full ${hasSpecification ? 'bg-amber-400' : 'bg-slate-300'}`} />
                <div className={`w-2.5 h-2.5 rounded-full ${hasSpecification ? 'bg-emerald-400' : 'bg-slate-300'}`} />
              </div>

              {/* Interactive Address Bar */}
              <div className="flex-1 max-w-sm sm:max-w-md mx-auto relative">
                <div className="bg-white border border-slate-200 rounded-md px-2.5 py-1 flex items-center justify-between gap-1.5 text-xs text-slate-500 shadow-2xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Lock
                      className={`w-3 h-3 shrink-0 ${hasSpecification ? 'text-emerald-600' : 'text-slate-400'}`}
                    />
                    <span className="truncate font-mono text-[11px] text-slate-700">{previewUrl}</span>
                  </div>

                  {/* Page selector dropdown trigger */}
                  {hasSpecification && activeDoc?.pages && activeDoc.pages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
                      title="Switch page"
                      aria-label="Switch page"
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Page Dropdown Popup */}
                {isPageDropdownOpen && activeDoc?.pages && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs">
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Website Pages
                    </div>
                    {activeDoc.pages.map((p) => (
                      <button
                        key={p.id || p.path}
                        type="button"
                        onClick={() => {
                          setCurrentPath(p.path);
                          setIsPageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                          currentPath === p.path ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-700'
                        }`}
                      >
                        <span>{p.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">{p.path}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Option 2: Curated Themes Switcher */}
              {hasSpecification && onOpenThemes && (
                <button
                  type="button"
                  onClick={onOpenThemes}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/60 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer shrink-0"
                  title="Option 2: Curated Themes & Palettes"
                >
                  <Palette className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Theme</span>
                  <div
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: activeDoc?.theme?.primaryColor || '#0F172A' }}
                  />
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              )}

              {/* Refresh control */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={!hasSpecification}
                  title={hasSpecification ? 'Refresh preview canvas' : 'Refresh disabled — no website generated yet'}
                  aria-label="Refresh preview"
                  className={`p-1.5 rounded transition-colors ${
                    hasSpecification
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer'
                      : 'text-slate-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Viewport Content Body */}
            <div
              style={{
                height:
                  currentMode === 'mobile'
                    ? `${targetDimensions.height - (showDeviceBezel ? 80 : 44)}px`
                    : currentMode === 'tablet'
                    ? `${targetDimensions.height - (showDeviceBezel ? 70 : 44)}px`
                    : '780px',
              }}
              className="flex-1 flex flex-col overflow-y-auto bg-white relative"
            >
              {hasSpecification && activeDoc ? (
                canvasViewMode === 'live' ? (
                  <ResponsiveIframe
                    key={`${reloadKey}_${targetDimensions.width}`}
                    width={targetDimensions.width}
                    height="100%"
                    title={`SiteForge Preview (${currentMode})`}
                  >
                    <WebsiteRenderer
                      document={activeDoc}
                      initialPath={currentPath}
                      onPageChange={(newPath) => setCurrentPath(newPath)}
                    />
                  </ResponsiveIframe>
                ) : (
                  <SpecificationPreviewState document={activeDoc} specification={activeDoc} />
                )
              ) : (
                <EmptyPreviewState
                  initialPrompt={project.initialPrompt}
                  onSelectPromptSuggestion={onSelectPromptSuggestion}
                  status={project.status}
                  onRetry={onRetry}
                  isLoading={isLoading}
                />
              )}
            </div>

            {/* Bottom Home Indicator Bar (Mobile Bezel) */}
            {currentMode === 'mobile' && showDeviceBezel && (
              <div className="bg-slate-900 h-6 w-full flex items-center justify-center shrink-0 select-none">
                <div className="w-28 h-1 bg-slate-500 rounded-full" />
              </div>
            )}
          </div>

          {/* Draggable Width Resize Handle (Right edge) */}
          <div
            onMouseDown={handleMouseDownResize}
            title="Drag to resize viewport width"
            aria-label="Drag to resize viewport width"
            className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 w-4 h-12 bg-white border border-slate-300 rounded-full shadow-md items-center justify-center cursor-ew-resize hover:bg-indigo-50 hover:border-indigo-400 transition-colors z-30 group"
          >
            <div className="w-0.5 h-4 bg-slate-400 group-hover:bg-indigo-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
