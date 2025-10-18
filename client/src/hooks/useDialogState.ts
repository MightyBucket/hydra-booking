
import { useState } from 'react';

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

  const update = (newData: T) => setData(newData);

  return { isOpen, data, open, close, update, setIsOpen, setData };
}
