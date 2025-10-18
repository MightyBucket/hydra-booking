
import { useState } from 'react';

/**
 * Reusable hook for managing dialog state
 * Handles open/close state and associated data for any dialog component
 * @param initialState - Optional initial data for the dialog
 * @returns Dialog state and control functions
 */
export function useDialogState<T = any>(initialState: T | null = null) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(initialState);

  // Open dialog with optional data
  const open = (dialogData?: T) => {
    if (dialogData !== undefined) setData(dialogData);
    setIsOpen(true);
  };

  // Close dialog and reset data
  const close = () => {
    setIsOpen(false);
    setData(null);
  };

  // Update dialog data without closing
  const update = (newData: T) => setData(newData);

  return { isOpen, data, open, close, update, setIsOpen, setData };
}
