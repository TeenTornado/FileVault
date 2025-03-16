/**
 * Format file size in bytes to a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format ISO date string to a human-readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  // Check if the date is today
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Check if the date is yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // For other dates
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get file type icon based on MIME type
 */
export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.includes("pdf")) {
    return "pdf";
  }

  if (mimeType.includes("word") || mimeType.includes("doc")) {
    return "document";
  }

  if (mimeType.includes("excel") || mimeType.includes("sheet")) {
    return "spreadsheet";
  }

  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) {
    return "presentation";
  }

  return "file";
}

/**
 * Validate file type against allowed types
 */
export function isFileTypeAllowed(file: File, allowedTypes: string[]): boolean {
  // Check if any of the allowed types match the file's type
  return allowedTypes.some((type) => {
    // Handle wildcards like 'image/*'
    if (type.endsWith("/*")) {
      const category = type.split("/")[0];
      return file.type.startsWith(category + "/");
    }

    return file.type === type;
  });
}

/**
 * Generate a simplified file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
    "text/plain": "txt",
    "text/html": "html",
    "text/css": "css",
    "text/javascript": "js",
    "application/json": "json",
    "application/xml": "xml",
    "application/zip": "zip",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
  };

  // Return the extension if it exists in the mapping
  if (mimeToExt[mimeType]) {
    return mimeToExt[mimeType];
  }

  // Try to extract extension from MIME type
  const parts = mimeType.split("/");
  if (parts.length === 2) {
    const subtype = parts[1];
    // Some MIME types have parameters after semicolons
    const subtypeParts = subtype.split(";");
    return subtypeParts[0];
  }

  // Fallback
  return "file";
}

/**
 * Safe file name - replaces invalid characters with underscores
 */
export function sanitizeFileName(fileName: string): string {
  // Remove characters that are not allowed in file names
  return fileName.replace(/[\\/:*?"<>|]/g, "_");
}

/**
 * Check if a file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

/**
 * Generate a file icon color based on file type
 */
export function getFileIconColor(mimeType: string): string {
  if (mimeType.startsWith("image/")) {
    return "#4CAF50"; // Green for images
  }

  if (mimeType.includes("pdf")) {
    return "#F44336"; // Red for PDFs
  }

  if (mimeType.includes("word") || mimeType.includes("doc")) {
    return "#2196F3"; // Blue for documents
  }

  if (mimeType.includes("excel") || mimeType.includes("sheet")) {
    return "#4CAF50"; // Green for spreadsheets
  }

  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) {
    return "#FF9800"; // Orange for presentations
  }

  if (mimeType.startsWith("video/")) {
    return "#9C27B0"; // Purple for videos
  }

  if (mimeType.startsWith("audio/")) {
    return "#00BCD4"; // Cyan for audio
  }

  return "#757575"; // Gray for other file types
}

/**
 * Sort files by different criteria
 */
export function sortFiles<
  T extends { name: string; size: number; uploadDate: string }
>(
  files: T[],
  sortBy: "name" | "date" | "size",
  ascending: boolean = true
): T[] {
  return [...files].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "date":
        comparison =
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        break;
      case "size":
        comparison = a.size - b.size;
        break;
    }

    return ascending ? comparison : -comparison;
  });
}

/**
 * Filter files by search query
 */
export function filterFilesBySearch<T extends { name: string; type: string }>(
  files: T[],
  query: string
): T[] {
  if (!query) return files;

  const lowercaseQuery = query.toLowerCase();
  return files.filter(
    (file) =>
      file.name.toLowerCase().includes(lowercaseQuery) ||
      getFileExtension(file.type).toLowerCase().includes(lowercaseQuery)
  );
}
