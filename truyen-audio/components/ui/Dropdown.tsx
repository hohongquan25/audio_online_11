"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Portal from "./Portal";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: HTMLElement | null;
  children: ReactNode;
  className?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

/**
 * Dropdown component that uses Portal to avoid z-index and overflow issues
 * Automatically positions itself relative to the trigger element
 */
export default function Dropdown({
  isOpen,
  onClose,
  trigger,
  children,
  className = "",
  position = "bottom-right",
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Calculate position based on trigger element
  useEffect(() => {
    if (!isOpen || !trigger) return;

    const updatePosition = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const dropdownRect = dropdownRef.current?.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (position) {
        case "bottom-right":
          top = triggerRect.bottom + 8;
          left = triggerRect.right - (dropdownRect?.width || 0);
          break;
        case "bottom-left":
          top = triggerRect.bottom + 8;
          left = triggerRect.left;
          break;
        case "top-right":
          top = triggerRect.top - (dropdownRect?.height || 0) - 8;
          left = triggerRect.right - (dropdownRect?.width || 0);
          break;
        case "top-left":
          top = triggerRect.top - (dropdownRect?.height || 0) - 8;
          left = triggerRect.left;
          break;
      }

      // Keep dropdown within viewport
      const maxLeft = window.innerWidth - (dropdownRect?.width || 0) - 16;
      const maxTop = window.innerHeight - (dropdownRect?.height || 0) - 16;

      setCoords({
        top: Math.max(16, Math.min(top, maxTop)),
        left: Math.max(16, Math.min(left, maxLeft)),
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, trigger, position]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        trigger &&
        !trigger.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    // Close on escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside as any);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside as any);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, trigger]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        ref={dropdownRef}
        style={{
          position: "fixed",
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          zIndex: 9999,
          touchAction: "auto",
        }}
        className={className}
      >
        {children}
      </div>
    </Portal>
  );
}
