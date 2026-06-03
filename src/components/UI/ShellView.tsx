import React from 'react';

interface ShellViewProps {
  children: React.ReactNode;
}

export const ShellView: React.FC<ShellViewProps> = ({ children }) => {
  return (
    <div className="app-root-wrapper">
      {children}
    </div>
  );
};

