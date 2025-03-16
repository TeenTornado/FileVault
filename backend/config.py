import os
import json
import argparse

def setup_environment():
    """
    Set up the environment variables needed for the application
    """
    # Create a .env file (this would be used with python-dotenv in production)
    parser = argparse.ArgumentParser(description='Setup server environment')
    parser.add_argument('--mongodb_uri', required=True, help='MongoDB Atlas connection string')
    parser.add_argument('--jwt_secret', required=True, help='JWT secret key')
    parser.add_argument('--service_account_file', required=True, help='Path to Google Drive service account JSON file')
    parser.add_argument('--port', type=int, default=5000, help='Port to run the server on')
    
    args = parser.parse_args()
    
    env_content = f"""MONGODB_URI={args.mongodb_uri}
JWT_SECRET={args.jwt_secret}
SERVICE_ACCOUNT_FILE={args.service_account_file}
PORT={args.port}
"""

    with open('.env', 'w') as env_file:
        env_file.write(env_content)
    
    print("Environment variables set up in .env file")
    print("To load these variables, install python-dotenv and use:")
    print("from dotenv import load_dotenv; load_dotenv()")
    print("\nFor development, you can also use:")
    print(f"export MONGODB_URI='{args.mongodb_uri}'")
    print(f"export JWT_SECRET='{args.jwt_secret}'")
    print(f"export SERVICE_ACCOUNT_FILE='{args.service_account_file}'")
    print(f"export PORT={args.port}")

if __name__ == "__main__":
    setup_environment()