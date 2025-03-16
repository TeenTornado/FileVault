from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import os
import mimetypes
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DriveHelper:
    """
    Helper class for Google Drive operations
    """
    def __init__(self, service_account_file, scopes=['https://www.googleapis.com/auth/drive.file']):
        logger.info(f"Initializing DriveHelper with service account file: {service_account_file}")
        
        if not os.path.exists(service_account_file):
            raise FileNotFoundError(f"Service account file not found: {service_account_file}")
            
        self.credentials = service_account.Credentials.from_service_account_file(
            service_account_file, scopes=scopes)
        self.service = build('drive', 'v3', credentials=self.credentials)
        
    def upload_file(self, file_path, mime_type=None):
        """
        Upload a file to Google Drive
        
        Args:
            file_path: Path to the file to upload
            mime_type: MIME type of the file (optional)
            
        Returns:
            Dictionary with file ID and webViewLink
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        file_name = os.path.basename(file_path)
        logger.info(f"Uploading file: {file_name}")
        
        if not mime_type:
            # Try to guess mime type based on file extension
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                # Fallback to extension mapping
                ext = os.path.splitext(file_name)[1].lower()
                mime_map = {
                    '.pdf': 'application/pdf',
                    '.doc': 'application/msword',
                    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.gif': 'image/gif'
                }
                mime_type = mime_map.get(ext, 'application/octet-stream')
        
        logger.info(f"Using MIME type: {mime_type}")
        
        file_metadata = {
            'name': file_name,
            'mimeType': mime_type
        }
        
        try:
            media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id,webViewLink'
            ).execute()
            
            logger.info(f"File uploaded successfully. ID: {file['id']}")
            
            # Make the file accessible to anyone with the link
            self.make_file_public(file['id'])
            
            return file
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            raise
        
    def make_file_public(self, file_id):
        """
        Make a file publicly accessible via link
        
        Args:
            file_id: ID of the file to make public
        """
        logger.info(f"Making file public: {file_id}")
        self.service.permissions().create(
            fileId=file_id,
            body={'type': 'anyone', 'role': 'reader'}
        ).execute()
        
    def delete_file(self, file_id):
        """
        Delete a file from Google Drive
        
        Args:
            file_id: ID of the file to delete
        """
        logger.info(f"Deleting file: {file_id}")
        self.service.files().delete(fileId=file_id).execute()
        
    def list_files(self, page_size=10, query=None):
        """
        List all files in the Drive
        
        Args:
            page_size: Number of files to list per page
            query: Query string for filtering files
            
        Returns:
            List of files
        """
        logger.info(f"Listing files. Page size: {page_size}, Query: {query}")
        results = self.service.files().list(
            pageSize=page_size,
            q=query,
            fields="nextPageToken, files(id, name, mimeType, webViewLink, createdTime, size)"
        ).execute()
        
        files = results.get('files', [])
        logger.info(f"Found {len(files)} files")
        return files