'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface MenubarContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const MenubarContext = createContext<MenubarContextValue | null>(null);

export function Menubar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return (
    <MenubarContext.Provider value={value}>{children}</MenubarContext.Provider>
  );
}

export function useMenubar() {
  const ctx = useContext(MenubarContext);
  if (!ctx) throw new Error('useMenubar must be used within <Menubar>');
  return ctx;
}

export function MenubarMenu({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>;
}

export function MenubarTrigger({ children, className, 'aria-label': ariaLabel }: { children: React.ReactNode; className?: string; 'aria-label'?: string }) {
  const ctx = useContext(MenubarContext)!;
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => ctx.setOpen(!ctx.open)}
      className={className}
    >
      {children}
    </button>
  );
}

export function MenubarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(MenubarContext)!;
  const ref = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Node;
    if (ref.current && !ref.current.contains(target)) {
      ctx.setOpen(false);
    }
  }, [ctx]);

  useEffect(() => {
    if (!ctx.open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') ctx.setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', onKey);
    // trigger enter animation next frame
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(raf);
      setEntered(false);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [ctx.open, ctx, handleClickOutside]);

  if (!ctx.open) return null;
  return (
    <div
      ref={ref}
      className={`${className || ''} origin-top-right transform transition duration-150 ease-out ${entered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      role="menu"
    >
      {children}
    </div>
  );
}

export function MenubarItem({ children, onSelect, className }: { children: React.ReactNode; onSelect?: () => void; className?: string }) {
  const ctx = useContext(MenubarContext)!;
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => { onSelect?.(); ctx.setOpen(false); }}
      className={className}
    >
      {children}
    </button>
  );
}


