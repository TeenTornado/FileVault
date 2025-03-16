import React from 'react';
import { FileType } from '../types';
import { Share2, Link, FileIcon, Image, FileText } from 'lucide-react';
import { formatFileSize, formatDate } from '../utils';

interface FileCardProps {
  file: FileType;
  isSelected: boolean;
  onSelect: () => void;
}

export function FileCard({ file, isSelected, onSelect }: FileCardProps) {
  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-6 h-6" />;
    }
    if (file.type.includes('pdf') || file.type.includes('doc')) {
      return <FileText className="w-6 h-6" />;
    }
    return <FileIcon className="w-6 h-6" />;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(file.url);
  };

  return (
    <div
      className={`relative rounded-lg border p-4 transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className="absolute top-4 right-4 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />

      <div className="mb-4 aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
        {file.type.startsWith('image/') ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-gray-400">{getFileIcon()}</div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 truncate" title={file.name}>
          {file.name}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatDate(file.uploadDate)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end space-x-2">
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