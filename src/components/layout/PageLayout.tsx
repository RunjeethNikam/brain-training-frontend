'use client';

import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function PageLayout({ children, className = '' }: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 ${className}`}>
      <div className="max-w-4xl mx-auto relative z-10">
        {children}
      </div>
    </div>
  );
}