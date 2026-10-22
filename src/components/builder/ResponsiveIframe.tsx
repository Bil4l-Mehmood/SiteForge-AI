import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ResponsiveIframeProps {
  children: React.ReactNode;
  width: number;
  height?: number | string;
  className?: string;
  title?: string;
}

export const ResponsiveIframe: React.FC<ResponsiveIframeProps> = ({
  children,
  width,
  height = '100%',
  className = '',
  title = 'Website Preview Canvas',
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const setupIframe = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        // Ensure proper meta viewport for responsive media queries
        if (!doc.head.querySelector('meta[name="viewport"]')) {
          const meta = doc.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=device-width, initial-scale=1.0';
          doc.head.appendChild(meta);
        }

        // Synchronize all stylesheets and font links from parent document
        const syncStyles = () => {
          // Remove old injected tags
          const existingInjected = doc.head.querySelectorAll('[data-siteforge-preview-style]');
          existingInjected.forEach((el) => el.remove());

          const parentHeadElements = document.head.querySelectorAll('style, link[rel="stylesheet"], link[rel="preconnect"]');
          parentHeadElements.forEach((node) => {
            const clone = node.cloneNode(true) as HTMLElement;
            clone.setAttribute('data-siteforge-preview-style', 'true');
            doc.head.appendChild(clone);
          });

          // Configure body properties
          if (doc.body) {
            doc.body.style.margin = '0';
            doc.body.style.padding = '0';
            doc.body.style.minHeight = '100%';
            doc.body.style.backgroundColor = 'transparent';
            doc.body.style.color = '#0f172a';
            doc.body.style.fontFamily = '"DM Sans", system-ui, -apple-system, sans-serif';
            doc.body.className = 'antialiased selection:bg-indigo-100 selection:text-indigo-900';
          }
        };

        syncStyles();

        // Listen for new style injections (e.g. Vite style additions)
        const observer = new MutationObserver(() => syncStyles());
        observer.observe(document.head, { childList: true, subtree: true });

        if (doc.body) {
          setMountNode(doc.body);
        }

        return () => observer.disconnect();
      } catch (err) {
        console.warn('Iframe setup error, falling back to direct render:', err);
      }
    };

    if (iframe.contentDocument?.readyState === 'complete') {
      const cleanup = setupIframe();
      return cleanup;
    } else {
      iframe.addEventListener('load', setupIframe);
      return () => iframe.removeEventListener('load', setupIframe);
    }
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      sandbox="allow-same-origin allow-scripts"
      style={{
        width: `${width}px`,
        height: typeof height === 'number' ? `${height}px` : height,
        border: 'none',
        display: 'block',
      }}
      className={`transition-all duration-300 ${className}`}
    >
      {mountNode ? createPortal(children, mountNode) : null}
    </iframe>
  );
};
