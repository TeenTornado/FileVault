import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { FileUpload } from './FileUpload';
import { FileLibrary } from './FileLibrary';
import { StorageIndicator } from './StorageIndicator';
import { FileType } from '../types';
import { Grid, List } from 'lucide-react';

export function Dashboard() {
  const [files, setFiles] = useState<FileType[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const toggleView = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  const handleFileUpload = (newFiles: FileType[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1">
        <Header />
        
        <main className="p-8">
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Upload Files</h1>
              <StorageIndicator used={256} total={1024} />
            </div>
            <FileUpload onUpload={handleFileUpload} />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">Files</h2>
                <button
                  onClick={toggleView}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
                >
                  {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search files..."
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                </select>
              </div>
            </div>

            <FileLibrary
              files={files}
              viewMode={viewMode}
              searchQuery={searchQuery}
              sortBy={sortBy}
              selectedFiles={selectedFiles}
              onSelectFiles={setSelectedFiles}
            />
          </div>
        </main>
      </div>
    </div>
  );
}