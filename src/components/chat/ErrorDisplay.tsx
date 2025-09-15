import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorDisplay = () => {
  return (
    <div className="px-4 md:px-6 pb-4">
      <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
          <div>
            <strong className="font-bold">Workflow Error!</strong>
            <p className="text-sm mt-1">
              The AI assistant encountered an unexpected problem and the workflow has been paused. Please contact support if the issue persists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;