import React from 'react';
import { HardDrive, Upload, Files, Settings, LogOut } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="flex items-center space-x-3 mb-8">
        <HardDrive className="w-8 h-8 text-blue-600" />
        <span className="text-xl font-semibold text-gray-900">FileVault</span>
      </div>

      <nav className="space-y-2">
        <a
          href="#"
          className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg bg-gray-100"
        >
          <Upload className="w-5 h-5" />
          <span>Upload</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50"
        >
          <Files className="w-5 h-5" />
          <span>My Files</span>
        </a>
        <a
          href="#"
          className="flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </a>
      </nav>

      <div className="absolute bottom-4 w-52">
        <button className="flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 w-full">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}