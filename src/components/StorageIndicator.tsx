import React from "react";
import { HardDrive } from "lucide-react";

interface StorageIndicatorProps {
  usedSpace: number;
  totalSpace: number;
}

export function StorageIndicator({
  usedSpace,
  totalSpace,
}: StorageIndicatorProps) {
  const usedPercentage = Math.min(
    Math.round((usedSpace / totalSpace) * 100),
    100
  );

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex items-center space-x-4">
      <HardDrive className="h-5 w-5 text-gray-500" />

      <div className="flex-1">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Storage</span>
          <span>
            {formatSize(usedSpace)} of {formatSize(totalSpace)} used (
            {usedPercentage}%)
          </span>
        </div>

        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              usedPercentage > 90
                ? "bg-red-500"
                : usedPercentage > 70
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${usedPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
