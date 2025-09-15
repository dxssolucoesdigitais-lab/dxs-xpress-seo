import { useState } from 'react';
import { showSuccess, showError } from '@/utils/toast';

export const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    if (!navigator.clipboard) {
      showError('toasts.clipboard.notAvailable');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      showSuccess('toasts.clipboard.success');
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      showError('toasts.clipboard.failed');
      console.error('Failed to copy: ', err);
    }
  };

  return { isCopied, copyToClipboard };
};