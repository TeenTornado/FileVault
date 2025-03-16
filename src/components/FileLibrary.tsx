import React from 'react';
import { FileType } from '../types';
import { FileCard } from './FileCard';
import { FileRow } from './FileRow';

interface FileLibraryProps {
  files: FileType[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
  sortBy: 'name' | 'date' | 'size';
  selectedFiles: string[];
  onSelectFiles: (files: string[]) => void;
}

export function FileLibrary({
  files,
  viewMode,
  searchQuery,
  sortBy,
  selectedFiles,
  onSelectFiles,
}: FileLibraryProps) {
  const filteredFiles = files
    .filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

  const toggleFileSelection = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      onSelectFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      onSelectFiles([...selectedFiles, fileId]);
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFiles.map(file => (
          <FileCard
            key={file.id}
            file={file}
            isSelected={selectedFiles.includes(file.id)}
            onSelect={() => toggleFileSelection(file.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredFiles.map(file => (
        <FileRow
          key={file.id}
          file={file}
          isSelected={selectedFiles.includes(file.id)}
          onSelect={() => toggleFileSelection(file.id)}
        />
      ))}
    </div>
  );
}