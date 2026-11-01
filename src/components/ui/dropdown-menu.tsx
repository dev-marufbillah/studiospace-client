"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  ariaLabel: string;
  className?: string;
}

/**
 * Lightweight dropdown menu: click-outside + Escape close, focus return,
 * keyboard-operable trigger (Enter/Space/ArrowDown).
 */
export function DropdownMenu({ trigger, children, align = "end", ariaLabel, className }: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    const firstItem = menuRef.current?.querySelector<HTMLElement>("button, a, input");
    firstItem?.focus();

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleTriggerKeyDown}
        className="flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-ring"
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={ariaLabel}
          className={cn(
            "absolute z-50 mt-2 min-w-56 overflow-hidden rounded-lg border border-border bg-surface py-1.5 shadow-xl",
            align === "end" ? "right-0" : "left-0",
            className
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  onSelect?: () => void;
  href?: string;
  children: React.ReactNode;
  danger?: boolean;
}

export function DropdownItem({ onSelect, href, children, danger = false }: DropdownItemProps) {
  const className = cn(
    "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent",
    danger ? "text-destructive" : "text-foreground"
  );

  if (href) {
    return (
      <a role="menuitem" href={href} className={className} onClick={onSelect}>
        {children}
      </a>
    );
  }

  return (
    <button role="menuitem" type="button" className={className} onClick={onSelect}>
      {children}
    </button>
  );
}
