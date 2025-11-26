
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

  const open = (dialogData?: T) => {
    if (dialogData !== undefined) setData(dialogData);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setData(null);
  };

  return { isOpen, data, open, close, setData };
}
