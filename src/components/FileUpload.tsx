import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Pause, Play } from "lucide-react";
import { FileType } from "../types";

interface FileUploadProps {
  onUpload: (files: FileType[]) => void;
  token: string;
  apiUrl?: string;
}

export function FileUpload({
  onUpload,
  token,
  apiUrl = "http://localhost:5000/api",
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{
      file: File;
      progress: number;
      status: "uploading" | "paused" | "completed" | "error";
      speed: number;
      error?: string;
    }>
  >([]);

  const uploadFileToDrive = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();
      let lastLoaded = 0;
      let lastTime = Date.now();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          const now = Date.now();
          const timeDiff = (now - lastTime) / 1000;
          const loadedDiff = event.loaded - lastLoaded;
          const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;

          lastLoaded = event.loaded;
          lastTime = now;

          setUploadingFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, progress, speed } : f))
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          setUploadingFiles((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, status: "completed" } : f
            )
          );

          // Convert from server response format to FileType
          const newFile: FileType = {
            id: response.file._id,
            name: response.file.name,
            size: response.file.size,
            type: response.file.type,
            uploadDate: response.file.upload_date,
            url: response.file.drive_url,
            drive_id: response.file.drive_id,
            drive_url: response.file.drive_url,
          };

          onUpload([newFile]);
        } else {
          const errorMsg = xhr.statusText || "Upload failed";
          setUploadingFiles((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, status: "error", error: errorMsg } : f
            )
          );
        }
      });

      xhr.addEventListener("error", () => {
        setUploadingFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, status: "error", error: "Network error" } : f
          )
        );
      });

      // Use the provided apiUrl instead of hardcoding
      xhr.open("POST", `${apiUrl}/upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      setUploadingFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "error", error: "Upload failed" } : f
        )
      );
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
        speed: 0,
      }));

      setUploadingFiles((prev) => [...prev, ...newFiles]);

      // Start upload for each file
      newFiles.forEach((fileData, index) => {
        const totalIndex = uploadingFiles.length + index;
        uploadFileToDrive(fileData.file, totalIndex);
      });
    },
    [uploadingFiles.length, token, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  const togglePause = (index: number) => {
    setUploadingFiles((prev) =>
      prev.map((f, i) =>
        i === index
          ? { ...f, status: f.status === "uploading" ? "paused" : "uploading" }
          : f
      )
    );
    // Note: Actual pausing would require an abort controller implementation
  };

  const removeFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-medium text-gray-900">
          {isDragActive ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="mt-2 text-sm text-gray-500">or click to select files</p>
        <p className="mt-1 text-xs text-gray-400">
          Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX
        </p>
      </div>
      {uploadingFiles.length > 0 && (
        <div className="space-y-4">
          {uploadingFiles.map((fileData, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 flex items-center space-x-4 ${
                fileData.status === "error" ? "bg-red-50" : "bg-gray-50"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`font-medium truncate ${
                      fileData.status === "error"
                        ? "text-red-700"
                        : "text-gray-900"
                    }`}
                  >
                    {fileData.file.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    {fileData.status !== "completed" &&
                      fileData.status !== "error" && (
                        <button
                          onClick={() => togglePause(index)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {fileData.status === "uploading" ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                      )}
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {fileData.error ? (
                  <p className="mt-1 text-sm text-red-600">{fileData.error}</p>
                ) : (
                  <>
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            fileData.status === "completed"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${fileData.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {fileData.status === "completed"
                          ? "Completed"
                          : `${Math.round(fileData.progress)}%`}
                      </span>
                      {fileData.status === "uploading" && (
                        <span>{Math.round(fileData.speed / 1024)} KB/s</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
