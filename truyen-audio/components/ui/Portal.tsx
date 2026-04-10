"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
  containerId?: string;
}

/**
 * Portal component to render children outside the DOM hierarchy
 * Useful for dropdowns, tooltips, and popovers to avoid z-index and overflow issues
 */
export default function Portal({ children, containerId = "portal-root" }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Get or create portal container
    let portalContainer = document.getElementById(containerId);
    
    if (!portalContainer) {
      portalContainer = document.createElement("div");
      portalContainer.id = containerId;
      portalContainer.style.position = "relative";
      portalContainer.style.zIndex = "9999";
      document.body.appendChild(portalContainer);
    }
    
    setContainer(portalContainer);

    return () => {
      // Cleanup: remove container if empty
      if (portalContainer && portalContainer.childNodes.length === 0) {
        portalContainer.remove();
      }
    };
  }, [containerId]);

  if (!mounted || !container) {
    return null;
  }

  return createPortal(children, container);
}
