// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/**
 * CVPlus CV Processing - Keyboard Shortcuts Utility
 * 
 * Utility functions for handling keyboard shortcuts in the CV processing interface.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export interface ShortcutMap {
  [key: string]: KeyboardShortcut;
}

// ============================================================================
// HOOK
// ============================================================================

export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const shortcutKey = createShortcutKey(event);
      const shortcut = shortcuts[shortcutKey];

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [handleKeyDown, enabled]);
}

// ============================================================================
// UTILITIES
// ============================================================================

export function createShortcutKey(event: KeyboardEvent): string {
  const modifiers = [];
  
  if (event.ctrlKey) modifiers.push('ctrl');
  if (event.altKey) modifiers.push('alt');
  if (event.shiftKey) modifiers.push('shift');
  if (event.metaKey) modifiers.push('meta');
  
  return [...modifiers, event.key.toLowerCase()].join('+');
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts = [];
  
  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  }
  if (shortcut.altKey) {
    parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
  }
  if (shortcut.shiftKey) {
    parts.push('⇧');
  }
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
}

// ============================================================================
// PRESET SHORTCUTS
// ============================================================================

export const CV_PROCESSING_SHORTCUTS: ShortcutMap = {
  'ctrl+s': {
    key: 's',
    ctrlKey: true,
    action: () => console.log('Save CV'),
    description: 'Save current CV',
  },
  'ctrl+z': {
    key: 'z',
    ctrlKey: true,
    action: () => console.log('Undo last action'),
    description: 'Undo last action',
  },
  'ctrl+y': {
    key: 'y',
    ctrlKey: true,
    action: () => console.log('Redo last action'),
    description: 'Redo last action',
  },
  'ctrl+shift+p': {
    key: 'p',
    ctrlKey: true,
    shiftKey: true,
    action: () => console.log('Open preview'),
    description: 'Open CV preview',
  },
  'ctrl+shift+e': {
    key: 'e',
    ctrlKey: true,
    shiftKey: true,
    action: () => console.log('Export CV'),
    description: 'Export CV',
  },
  'escape': {
    key: 'Escape',
    action: () => console.log('Close dialogs'),
    description: 'Close dialogs/modals',
  },
};