import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ErrorDisplay = () => {
  const { t } = useTranslation();
  return (
    <div className="px-4 md:px-6 pb-4">
      <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          <div>
            <strong className="font-bold">{t('errorDisplay.title')}</strong>
            <p className="text-sm mt-1">{t('errorDisplay.message')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;