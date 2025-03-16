from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import os
import json
from datetime import datetime
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import uuid
from dotenv import load_dotenv
import tempfile
import time
import logging

from flask_cors import CORS
from drive_utils import DriveHelper  # Import the DriveHelper class

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()  # This loads the environment variables from .env

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # For development only

# Load environment variables
MONGODB_URI = os.environ.get('MONGODB_URI')
JWT_SECRET = os.environ.get('JWT_SECRET')
PORT = int(os.environ.get('PORT', 5000))
SERVICE_ACCOUNT_FILE = os.environ.get('SERVICE_ACCOUNT_FILE')

# Validate environment variables
if not MONGODB_URI:
    logger.error("MONGODB_URI environment variable not set")
    raise ValueError("MONGODB_URI environment variable not set")

if not JWT_SECRET:
    logger.error("JWT_SECRET environment variable not set")
    raise ValueError("JWT_SECRET environment variable not set")

if not SERVICE_ACCOUNT_FILE:
    logger.error("SERVICE_ACCOUNT_FILE environment variable not set")
    raise ValueError("SERVICE_ACCOUNT_FILE environment variable not set")

if not os.path.exists(SERVICE_ACCOUNT_FILE):
    logger.error(f"Service account file does not exist: {SERVICE_ACCOUNT_FILE}")
    raise FileNotFoundError(f"Service account file does not exist: {SERVICE_ACCOUNT_FILE}")

# Setup MongoDB connection
try:
    logger.info(f"Connecting to MongoDB: {MONGODB_URI}")
    client = MongoClient(MONGODB_URI)
    db = client.filevault
    users_collection = db.users
    files_collection = db.files
    logger.info("MongoDB connection established")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")
    raise

# JWT Authentication middleware
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'Invalid token!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return jsonify({'message': 'Invalid token!'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# User registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields!'}), 400
    
    if users_collection.find_one({'email': data['email']}):
        return jsonify({'message': 'User already exists!'}), 409
    
    hashed_password = generate_password_hash(data['password'])
    
    new_user = {
        'email': data['email'],
        'password': hashed_password,
        'created_at': datetime.utcnow()
    }
    
    result = users_collection.insert_one(new_user)
    
    return jsonify({
        'message': 'User created successfully!',
        'user_id': str(result.inserted_id)
    }), 201

# User login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing credentials!'}), 400
    
    user = users_collection.find_one({'email': data['email']})
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Invalid credentials!'}), 401
    
    token = jwt.encode({
        'user_id': str(user['_id']),
        'email': user['email'],
        'exp': datetime.utcnow().timestamp() + 86400  # 24 hours
    }, JWT_SECRET)
    
    return jsonify({
        'token': token,
        'user_id': str(user['_id']),
        'email': user['email']
    }), 200

# Upload file to Google Drive and store metadata in MongoDB
@app.route('/api/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    if 'file' not in request.files:
        return jsonify({'message': 'No file part!'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'message': 'No file selected!'}), 400
    
    # Save file temporarily using system temp directory
    temp_dir = tempfile.gettempdir()
    temp_name = f'{uuid.uuid4()}_{file.filename}'
    temp_path = os.path.join(temp_dir, temp_name)
    
    logger.info(f"Saving temporary file: {temp_path}")
    file.save(temp_path)
    
    try:
        # Initialize DriveHelper
        logger.info(f"Creating DriveHelper with service account: {SERVICE_ACCOUNT_FILE}")
        drive_helper = DriveHelper(SERVICE_ACCOUNT_FILE)
        
        # Upload to Google Drive
        logger.info(f"Uploading file to Google Drive: {file.filename}")
        drive_file = drive_helper.upload_file(temp_path, file.content_type)
        
        # Store file metadata in MongoDB
        file_data = {
            'name': file.filename,
            'size': os.path.getsize(temp_path),
            'type': file.content_type,
            'drive_id': drive_file['id'],
            'drive_url': drive_file['webViewLink'],
            'user_id': str(current_user['_id']),
            'upload_date': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Saving file metadata to MongoDB: {file.filename}")
        result = files_collection.insert_one(file_data)
        file_data['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'File uploaded successfully!',
            'file': file_data
        }), 201
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}", exc_info=True)
        return jsonify({'message': f'Error uploading file: {str(e)}'}), 500
    finally:
        # Clean up temporary file in finally block to ensure it runs
        try:
            if os.path.exists(temp_path):
                # Add a retry mechanism with a short delay for Windows file locks
                max_attempts = 3
                for attempt in range(max_attempts):
                    try:
                        os.remove(temp_path)
                        logger.info(f"Temporary file deleted: {temp_path}")
                        break
                    except PermissionError:
                        if attempt < max_attempts - 1:
                            logger.info(f"File still in use, retrying in 1 second... (attempt {attempt+1}/{max_attempts})")
                            time.sleep(1)
                        else:
                            logger.warning(f"Could not delete temporary file after {max_attempts} attempts: {temp_path}")
                            # Don't fail the request if we can't delete the temp file
        except Exception as e:
            logger.error(f"Error cleaning up temporary file: {str(e)}")
            # Don't fail the request if we can't delete the temp file

# Get all files for a user
@app.route('/api/files', methods=['GET'])
@token_required
def get_files(current_user):
    try:
        files = list(files_collection.find({'user_id': str(current_user['_id'])}))
        
        # Convert ObjectId to string
        for file in files:
            file['_id'] = str(file['_id'])
        
        return jsonify({
            'files': files
        }), 200
    except Exception as e:
        logger.error(f"Error fetching files: {str(e)}")
        return jsonify({'message': f'Error fetching files: {str(e)}'}), 500

# Delete file
@app.route('/api/files/<file_id>', methods=['DELETE'])
@token_required
def delete_file(current_user, file_id):
    try:
        file = files_collection.find_one({'_id': ObjectId(file_id), 'user_id': str(current_user['_id'])})
        
        if not file:
            return jsonify({'message': 'File not found!'}), 404
        
        # Initialize DriveHelper
        drive_helper = DriveHelper(SERVICE_ACCOUNT_FILE)
        
        # Delete from Google Drive
        logger.info(f"Deleting file from Google Drive: {file['drive_id']}")
        drive_helper.delete_file(file['drive_id'])
        
        # Delete from MongoDB
        logger.info(f"Deleting file metadata from MongoDB: {file_id}")
        files_collection.delete_one({'_id': ObjectId(file_id)})
        
        return jsonify({'message': 'File deleted successfully!'}), 200
    
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        return jsonify({'message': f'Error deleting file: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify the server is running"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

if __name__ == '__main__':
    logger.info(f"Starting server on port {PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=True)