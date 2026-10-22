import React, { useState, useRef, useEffect } from 'react';
import { ViewportMode, DeviceOrientation, ZoomLevel } from '../../types';
import {
  Monitor,
  Tablet,
  Smartphone,
  Sliders,
  RotateCw,
  ZoomIn,
  Check,
  ChevronDown,
} from 'lucide-react';

export interface DevicePreviewControlsProps {
  viewportMode: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  customWidth?: number;
  onCustomWidthChange?: (width: number) => void;
  orientation?: DeviceOrientation;
  onToggleOrientation?: () => void;
  zoomLevel?: ZoomLevel;
  onZoomChange?: (zoom: ZoomLevel) => void;
  className?: string;
}

const WIDTH_PRESETS = [
  { label: 'Mobile Compact', width: 320, mode: 'mobile' as const },
  { label: 'iPhone SE', width: 375, mode: 'mobile' as const },
  { label: 'iPhone 15 / 16 (Standard)', width: 390, mode: 'mobile' as const },
  { label: 'iPhone Plus / Max', width: 414, mode: 'mobile' as const },
  { label: 'iPad Mini / Air', width: 768, mode: 'tablet' as const },
  { label: 'iPad 10th Gen', width: 820, mode: 'tablet' as const },
  { label: 'iPad Pro', width: 1024, mode: 'tablet' as const },
  { label: 'MacBook Air / Laptop', width: 1280, mode: 'desktop' as const },
  { label: 'Desktop Standard (HD)', width: 1440, mode: 'desktop' as const },
  { label: 'Full HD Monitor', width: 1920, mode: 'desktop' as const },
];

export const DevicePreviewControls: React.FC<DevicePreviewControlsProps> = ({
  viewportMode,
  onViewportChange,
  customWidth,
  onCustomWidthChange,
  orientation = 'portrait',
  onToggleOrientation,
  zoomLevel = 'fit',
  onZoomChange,
  className = '',
}) => {
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsPresetMenuOpen(false);
      }
    };
    if (isPresetMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPresetMenuOpen]);

  const handleSelectPreset = (presetWidth: number, mode: ViewportMode) => {
    if (onCustomWidthChange) {
      onCustomWidthChange(presetWidth);
    }
    onViewportChange(mode);
    setIsPresetMenuOpen(false);
  };

  const getDimensionLabel = () => {
    if (viewportMode === 'mobile') {
      return orientation === 'portrait' ? '390 × 844' : '844 × 390';
    }
    if (viewportMode === 'tablet') {
      return orientation === 'portrait' ? '768 × 1024' : '1024 × 768';
    }
    if (viewportMode === 'desktop') {
      return `${customWidth || 1440} × 900`;
    }
    return `${customWidth || 1440} px`;
  };

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
      {/* Device Mode Switcher (Desktop, Tablet, Mobile) */}
      <div
        role="group"
        aria-label="Preview viewport device controls"
        className="inline-flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200"
      >
        <button
          type="button"
          onClick={() => {
            onViewportChange('desktop');
            if (onCustomWidthChange) onCustomWidthChange(1440);
          }}
          aria-pressed={viewportMode === 'desktop'}
          aria-label="Desktop Viewport (1440 pixels)"
          title="Desktop Viewport (1440px)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            viewportMode === 'desktop'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Monitor className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Desktop</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onViewportChange('tablet');
            if (onCustomWidthChange) onCustomWidthChange(768);
          }}
          aria-pressed={viewportMode === 'tablet'}
          aria-label="Tablet Viewport (768 pixels)"
          title="Tablet Viewport (768px)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            viewportMode === 'tablet'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Tablet className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Tablet</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onViewportChange('mobile');
            if (onCustomWidthChange) onCustomWidthChange(390);
          }}
          aria-pressed={viewportMode === 'mobile'}
          aria-label="Mobile Viewport (390 pixels)"
          title="Mobile Viewport (390px)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            viewportMode === 'mobile'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Mobile</span>
        </button>
      </div>

      {/* Orientation Toggle (for Tablet & Mobile) */}
      {onToggleOrientation && (viewportMode === 'tablet' || viewportMode === 'mobile') && (
        <button
          type="button"
          onClick={onToggleOrientation}
          aria-label={`Switch to ${orientation === 'portrait' ? 'landscape' : 'portrait'} orientation`}
          title={`Orientation: ${orientation} (Click to rotate)`}
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
        >
          <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
          <span className="capitalize">{orientation}</span>
        </button>
      )}

      {/* Dimension Quick-Select Dropdown Menu */}
      <div className="relative hidden lg:block" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsPresetMenuOpen(!isPresetMenuOpen)}
          aria-haspopup="listbox"
          aria-expanded={isPresetMenuOpen}
          aria-label="Select viewport dimension preset"
          title="Viewport Dimensions (Click for presets)"
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono transition-colors cursor-pointer shadow-2xs"
        >
          <Sliders className="w-3 h-3 text-slate-400" />
          <span>{getDimensionLabel()}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isPresetMenuOpen && (
          <div
            role="listbox"
            className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
              Viewport Presets
            </div>
            {WIDTH_PRESETS.map((preset) => {
              const isSelected =
                viewportMode === preset.mode &&
                (customWidth ? customWidth === preset.width : true);

              return (
                <button
                  key={preset.label}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectPreset(preset.width, preset.mode)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                    isSelected ? 'bg-indigo-50/60 text-indigo-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span className="truncate">{preset.label}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2 font-mono text-[11px] text-slate-400">
                    <span>{preset.width}px</span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Zoom / Scaling Control */}
      {onZoomChange && (
        <div className="hidden xl:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => onZoomChange('fit')}
            aria-pressed={zoomLevel === 'fit'}
            title="Auto-fit viewport inside workspace"
            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
              zoomLevel === 'fit'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(100)}
            aria-pressed={zoomLevel === 100}
            title="100% 1:1 Actual CSS pixels"
            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
              zoomLevel === 100
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(75)}
            aria-pressed={zoomLevel === 75}
            title="75% scale"
            className={`px-1.5 py-1 rounded-md transition-all cursor-pointer ${
              zoomLevel === 75
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            75%
          </button>
        </div>
      )}
    </div>
  );
};
