import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: 'success' | 'destructive' | 'info' | 'warning';
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const getVariantClass = (variant: AlertProps['variant']) => {
  switch (variant) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'destructive':
      return 'bg-red-100 text-red-800';
    case 'info':
      return 'bg-blue-100 text-blue-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const getIcon = (variant: AlertProps['variant']) => {
  switch (variant) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'destructive':
    case 'warning':
    case 'info':
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export const Alert: React.FC<AlertProps> = ({ children, className = '', variant = 'info', ...props }) => {
  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 shadow-md ${getVariantClass(variant)} ${className}`}
      {...props}
    >
      <div className="flex items-center">
        {getIcon(variant)}
        <div className="ml-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export const AlertTitle: React.FC<AlertTitleProps> = ({ children, className = '', ...props }) => {
  return (
    <h5
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`text-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertCircleIcon: React.FC<React.ComponentProps<typeof AlertCircle>> = ({ className = '', ...props }) => {
  return <AlertCircle className={`h-4 w-4 ${className}`} {...props} />;
};

export default Alert;
