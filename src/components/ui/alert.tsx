import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 shadow-md ${className}`}
      {...props}
    >
      {children}
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