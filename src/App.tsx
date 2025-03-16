import React, { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { FileUpload } from "./components/FileUpload";
import { FileLibrary } from "./components/FileLibrary";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { StorageIndicator } from "./components/StorageIndicator";
import { FileType, User } from "./types";
import { Grid, List, SortAsc, SortDesc, Search, Trash2 } from "lucide-react";
import axios from "axios";

// Constant for the API URL that matches your backend
const API_URL = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<FileType[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for stored authentication on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("filevault_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Set the authorization header for all future requests
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${parsedUser.token}`;
      } catch (err) {
        localStorage.removeItem("filevault_user");
      }
    }
  }, []);

  // Fetch files whenever user changes
  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  const fetchFiles = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/files`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // Transform server response to match our FileType interface
      const transformedFiles: FileType[] = response.data.files.map(
        (file: any) => ({
          id: file._id,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: file.upload_date,
          url: file.drive_url,
          drive_id: file.drive_id,
          drive_url: file.drive_url,
        })
      );

      setFiles(transformedFiles);
    } catch (err: any) {
      console.error("Error fetching files:", err);
      setError(err.response?.data?.message || "Failed to fetch files");

      // If we get a 401 Unauthorized, the token might be expired
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userId: string, email: string, token: string) => {
    const userObj: User = { id: userId, email, token };
    setUser(userObj);
    localStorage.setItem("filevault_user", JSON.stringify(userObj));

    // Set the authorization header for all future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const handleLogout = () => {
    setUser(null);
    setFiles([]);
    setSelectedFiles([]);
    localStorage.removeItem("filevault_user");

    // Remove the authorization header
    delete axios.defaults.headers.common["Authorization"];
  };

  const handleUpload = (newFiles: FileType[]) => {
    setFiles((prev) => [...newFiles, ...prev]);
  };

  const handleDeleteSelectedFiles = async () => {
    if (!user || selectedFiles.length === 0) return;

    setIsLoading(true);

    try {
      // Delete files one by one
      for (const fileId of selectedFiles) {
        await axios.delete(`${API_URL}/files/${fileId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      }

      // After successful deletion, update the files list
      setFiles((prev) =>
        prev.filter((file) => !selectedFiles.includes(file.id))
      );
      setSelectedFiles([]);
    } catch (err: any) {
      console.error("Error deleting files:", err);
      setError("Failed to delete one or more files");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  const toggleSortOrder = () => {
    const sortOptions: Array<"name" | "date" | "size"> = [
      "name",
      "date",
      "size",
    ];
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex]);
  };

  // If user is not logged in, show login screen
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={handleLogout} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">My Files</h1>
              <p className="text-gray-500">Manage and organize your files</p>
            </div>

            <div className="mb-6">
              <FileUpload
                onUpload={handleUpload}
                token={user.token}
                apiUrl={API_URL}
              />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  {selectedFiles.length > 0 && (
                    <button
                      onClick={handleDeleteSelectedFiles}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete selected"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}

                  <button
                    onClick={toggleSortOrder}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title={`Sort by ${sortBy}`}
                  >
                    {sortBy === "name" ? (
                      <SortAsc className="h-5 w-5" />
                    ) : sortBy === "date" ? (
                      <SortDesc className="h-5 w-5" />
                    ) : (
                      <SortDesc className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    onClick={toggleViewMode}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title={`View as ${viewMode === "grid" ? "list" : "grid"}`}
                  >
                    {viewMode === "grid" ? (
                      <List className="h-5 w-5" />
                    ) : (
                      <Grid className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {isLoading && files.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Loading files...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <p className="text-red-500">{error}</p>
                    <button
                      onClick={fetchFiles}
                      className="mt-2 text-blue-500 hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      No files found. Upload some files to get started.
                    </p>
                  </div>
                ) : (
                  <FileLibrary
                    files={files}
                    viewMode={viewMode}
                    searchQuery={searchQuery}
                    sortBy={sortBy}
                    selectedFiles={selectedFiles}
                    onSelectFiles={setSelectedFiles}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        <div className="border-t bg-white p-4">
          <StorageIndicator
            usedSpace={files.reduce((total, file) => total + file.size, 0)}
            totalSpace={1024 * 1024 * 1024 * 10} // 10GB example limit
          />
        </div>
      </div>
    </div>
  );
}

export default App;
