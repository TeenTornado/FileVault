// User type definition
export interface User {
  id: string;
  email: string;
  token: string;
}

// File type definition
export interface FileType {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  url: string;
  drive_id: string;
  drive_url: string;
}
