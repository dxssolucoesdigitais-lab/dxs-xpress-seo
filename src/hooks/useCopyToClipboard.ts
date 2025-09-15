import { useState } from 'react';
import { showSuccess, showError } from '@/utils/toast';

export const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    if (!navigator.clipboard) {
      showError('Clipboard API not available.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      showSuccess('Content copied to clipboard!');
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // Reset after 2 seconds
    } catch (err) {
      showError('Failed to copy content.');
      console.error('Failed to copy: ', err);
    }
  };

  return { isCopied, copyToClipboard };
};