import React from 'react';
import { HardDrive } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <HardDrive className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-semibold text-gray-900">FileVault</span>
        </div>
      </div>
    </header>
  );
}