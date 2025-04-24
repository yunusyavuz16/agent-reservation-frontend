import React from 'react';

interface ErrorAlertProps {
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
      <div className="font-medium mb-1">Error</div>
      {message}
    </div>
  );
};

export default ErrorAlert;