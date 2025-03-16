import React from 'react';
import { FileType } from '../types';
import { Share2, Link, FileIcon, Image, FileText } from 'lucide-react';
import { formatFileSize, formatDate } from '../utils';

interface FileRowProps {
  file: FileType;
  isSelected: boolean;
  onSelect: () => void;
}

export function FileRow({ file, isSelected, onSelect }: FileRowProps) {
  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    }
    if (file.type.includes('pdf') || file.type.includes('doc')) {
      return <FileText className="w-5 h-5" />;
    }
    return <FileIcon className="w-5 h-5" />;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(file.url);
  };

  return (
    <div
      className={`flex items-center space-x-4 p-4 rounded-lg transition-all ${
        isSelected
          ? 'bg-blue-50 border border-blue-500'
          : 'hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />

      <div className="flex-shrink-0 w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
        {file.type.startsWith('image/') ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover rounded"
          />
        ) : (
          <div className="text-gray-400">{getFileIcon()}</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
      </div>

      <div className="text-sm text-gray-500">
        {formatDate(file.uploadDate)}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={copyLink}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Copy link"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}