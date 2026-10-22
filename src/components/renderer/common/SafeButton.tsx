import React from 'react';
import { isSafeUrl } from '../../../../server/validator';
import { ThemeStyles } from '../themeUtils';

interface SafeButtonProps {
  label: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  themeStyles: ThemeStyles;
  onNavigate?: (pathOrAnchor: string) => void;
  className?: string;
  icon?: React.ReactNode;
}

export const SafeButton: React.FC<SafeButtonProps> = ({
  label,
  href,
  variant = 'primary',
  themeStyles,
  onNavigate,
  className = '',
  icon,
}) => {
  const safeTarget = href && isSafeUrl(href) ? href.trim() : undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (!safeTarget) return;

    if (safeTarget.startsWith('/')) {
      e.preventDefault();
      onNavigate?.(safeTarget);
    } else if (safeTarget.startsWith('#')) {
      e.preventDefault();
      const targetId = safeTarget.replace('#', '');
      const el = document.getElementById(targetId) || document.querySelector(`[data-section-type="${targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate?.(safeTarget);
      }
    }
  };

  const btnClasses = `${themeStyles.buttonClass(variant)} ${className}`;
  const btnStyle = themeStyles.buttonInlineStyle(variant);

  if (safeTarget && safeTarget.startsWith('http')) {
    return (
      <a
        href={safeTarget}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClasses}
        style={btnStyle}
      >
        <span>{label}</span>
        {icon && <span className="ml-1.5">{icon}</span>}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={btnClasses}
      style={btnStyle}
    >
      <span>{label}</span>
      {icon && <span className="ml-1.5">{icon}</span>}
    </button>
  );
};
