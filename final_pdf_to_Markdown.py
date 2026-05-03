#!/usr/bin/env python3
"""
PDF to Markdown Converter with Google Drive Integration
Converts PDF files in a Google Drive folder to Markdown format
"""

import os
import re
import json
import pickle
import tempfile
import subprocess
import sys
import io
from PyPDF2 import PdfReader
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.http import MediaIoBaseDownload, MediaFileUpload

# Google Drive API Scopes
SCOPES = ['https://www.googleapis.com/auth/drive']


def install_package(package):
    """Install required packages if not available"""
    try:
        __import__(package.split('==')[0].replace('-', '_'))
    except ImportError:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])


def install_dependencies():
    """Install all required dependencies"""
    required_packages = ["google-api-python-client", "google-auth-httplib2", "google-auth-oauthlib", "PyPDF2"]
    for package in required_packages:
        install_package(package)
    print("✓ All dependencies loaded")


def clean_text(text):
    """Clean and format extracted text"""
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    text = re.sub(r'\s+([.,;:!?])', r'\1', text)
    return text.strip()


def detect_heading(line):
    """Detect if a line is likely a heading"""
    line = line.strip()
    if re.match(r'^\d+\.(\d+\.)*\s+[A-Z]', line):
        level = line.count('.', 0, line.find(' '))
        return level + 1, line
    if line.isupper() and len(line) < 100 and len(line) > 3:
        return 2, line.title()
    if line.istitle() and len(line) < 80 and len(line) > 5:
        return 3, line
    return None, line


def format_as_markdown(text):
    """Convert plain text to markdown format"""
    lines = text.split('\n')
    markdown_lines = []
    in_list = False
    
    for line in lines:
        line = line.strip()
        if not line:
            markdown_lines.append('')
            in_list = False
            continue
        
        heading_level, formatted_line = detect_heading(line)
        if heading_level:
            if in_list:
                in_list = False
            markdown_lines.append(f"{'#' * heading_level} {formatted_line}")
            continue
        
        if re.match(r'^[•\-\*]\s+', line) or re.match(r'^\d+\.\s+', line):
            if not in_list:
                markdown_lines.append('')
            markdown_lines.append(line)
            in_list = True
            continue
        
        if line.startswith('    ') or line.startswith('\t'):
            markdown_lines.append(f"  {line.strip()}")
            continue
        
        if in_list:
            in_list = False
        markdown_lines.append(line)
    
    return '\n'.join(markdown_lines)


def pdf_to_markdown(pdf_path, output_path=None):
    """Convert PDF to Markdown file"""
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    if output_path is None:
        base_name = os.path.splitext(pdf_path)[0]
        output_path = f"{base_name}.md"
    
    try:
        reader = PdfReader(pdf_path)
        full_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)
        
        combined_text = '\n\n'.join(full_text)
        cleaned_text = clean_text(combined_text)
        markdown_text = format_as_markdown(cleaned_text)
        
        markdown_output = f"""# {os.path.basename(pdf_path).replace('.pdf', '')}

*Converted from PDF to Markdown*

---

{markdown_text}
"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_output)
        
        return output_path
        
    except Exception as e:
        raise Exception(f"Error converting PDF: {str(e)}")


class GoogleDriveManager:
    """Manage Google Drive operations"""
    
    def __init__(self, credentials_file='credentials.json', token_file='token.pickle'):
        self.credentials_file = credentials_file
        self.token_file = token_file
        self.service = None
        
    def authenticate(self):
        """Authenticate with Google Drive API"""
        creds = None
        
        if os.path.exists(self.token_file):
            with open(self.token_file, 'rb') as token:
                creds = pickle.load(token)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_file):
                    raise FileNotFoundError(f"Credentials file '{self.credentials_file}' not found.")
                
                flow = InstalledAppFlow.from_client_secrets_file(self.credentials_file, SCOPES)
                creds = flow.run_local_server(port=0)
            
            with open(self.token_file, 'wb') as token:
                pickle.dump(creds, token)
        
        self.service = build('drive', 'v3', credentials=creds)
        return self.service
    
    def list_files_in_folder(self, folder_id, file_type=None):
        """List files in a specific folder"""
        if not self.service:
            self.authenticate()
        
        query = f"'{folder_id}' in parents and trashed=false"
        if file_type:
            query += f" and mimeType='application/{file_type}'"
        
        results = self.service.files().list(
            q=query,
            fields="files(id, name, size, modifiedTime)"
        ).execute()
        
        return results.get('files', [])
    
    def download_file(self, file_id, local_path):
        """Download a file from Google Drive"""
        if not self.service:
            self.authenticate()
        
        request = self.service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = MediaIoBaseDownload(fh, request)
        
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        
        with open(local_path, 'wb') as f:
            f.write(fh.getvalue())
        return True
    
    def upload_file(self, local_path, folder_id, new_name=None):
        """Upload a file to Google Drive folder"""
        if not self.service:
            self.authenticate()
        
        file_name = new_name or os.path.basename(local_path)
        mime_type = 'text/markdown' if file_name.endswith('.md') else 'application/octet-stream'
        
        file_metadata = {
            'name': file_name,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(local_path, mimetype=mime_type)
        file = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        
        return file.get('id')
    
    def file_exists(self, folder_id, file_name):
        """Check if file exists in folder"""
        if not self.service:
            self.authenticate()
        
        query = f"'{folder_id}' in parents and name='{file_name}' and trashed=false"
        results = self.service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get('files', [])
        return len(files) > 0, files[0]['id'] if files else None


def convert_pdfs_in_folder(folder_id, skip_duplicates=True):
    """
    Main function: Access Google Drive folder, convert PDFs to markdown, upload results
    
    Args:
        folder_id: Google Drive folder ID containing PDFs
        skip_duplicates: If True, skip PDFs that already have markdown files
    
    Returns:
        dict: Summary of conversion results
    """
    try:
        print(f"🚀 Starting PDF to Markdown conversion...")
        drive_manager = GoogleDriveManager()
        drive_manager.authenticate()
        
        # Get all PDF files in the folder
        pdf_files = drive_manager.list_files_in_folder(folder_id, 'pdf')
        
        if not pdf_files:
            return {'success': False, 'error': 'No PDF files found in folder'}
        
        print(f"📄 Found {len(pdf_files)} PDF files")
        
        results = {
            'total_pdfs': len(pdf_files),
            'converted': 0,
            'skipped': 0,
            'failed': 0,
            'files_processed': []
        }
        
        for i, pdf_file in enumerate(pdf_files, 1):
            pdf_id = pdf_file['id']
            pdf_name = pdf_file['name']
            base_name = os.path.splitext(pdf_name)[0]
            md_name = f"{base_name}.md"
            
            print(f"\n📄 Processing {i}/{len(pdf_files)}: {pdf_name}")
            
            # Check for duplicates
            if skip_duplicates:
                exists, existing_id = drive_manager.file_exists(folder_id, md_name)
                if exists:
                    print(f"⭐️ Skipped - markdown already exists: {md_name}")
                    results['skipped'] += 1
                    results['files_processed'].append({
                        'pdf_name': pdf_name,
                        'status': 'skipped',
                        'reason': 'Markdown already exists'
                    })
                    continue
            
            temp_pdf = None
            temp_md = None
            
            try:
                # Download PDF to temp file
                temp_pdf = os.path.join(tempfile.gettempdir(), pdf_name)
                drive_manager.download_file(pdf_id, temp_pdf)
                print(f"  ⬇️ Downloaded PDF")
                
                # Convert to markdown
                temp_md = os.path.join(tempfile.gettempdir(), md_name)
                pdf_to_markdown(temp_pdf, temp_md)
                print(f"  🔄 Converted to markdown")
                
                # Upload markdown back to Drive
                md_file_id = drive_manager.upload_file(temp_md, folder_id, md_name)
                print(f"  ⬆️ Uploaded markdown: {md_name}")
                
                # Cleanup temp files
                os.remove(temp_pdf)
                os.remove(temp_md)
                
                results['converted'] += 1
                results['files_processed'].append({
                    'pdf_name': pdf_name,
                    'md_name': md_name,
                    'md_file_id': md_file_id,
                    'status': 'converted'
                })
                print(f"  ✅ Success!")
                
            except Exception as e:
                print(f"  ❌ Failed: {str(e)}")
                results['failed'] += 1
                results['files_processed'].append({
                    'pdf_name': pdf_name,
                    'status': 'failed',
                    'error': str(e)
                })
                
                # Cleanup on failure
                for temp_file in [temp_pdf, temp_md]:
                    if temp_file and os.path.exists(temp_file):
                        try:
                            os.remove(temp_file)
                        except:
                            pass
        
        # Final summary
        print(f"\n{'🎉 CONVERSION COMPLETE! 🎉':^50}")
        print(f"📊 Total PDFs: {results['total_pdfs']}")
        print(f"✅ Converted: {results['converted']}")
        print(f"⭐️ Skipped: {results['skipped']}")
        print(f"❌ Failed: {results['failed']}")
        
        results['success'] = True
        return results
        
    except Exception as e:
        print(f"❌ Error in conversion process: {e}")
        return {'success': False, 'error': str(e)}


def main():
    """Main entry point"""
    # Install dependencies
    install_dependencies()
    
    # Configuration
    # Replace with your Google Drive folder ID
    FOLDER_ID = "1zr2V8CF7F_iqUc25nwq9K-ogbnBtOa9y"
    
    # Run the conversion
    print("🚀 Starting conversion process...")
    result = convert_pdfs_in_folder(FOLDER_ID, skip_duplicates=True)
    
    if result['success']:
        print(f"\n✅ Process completed successfully!")
        if result['converted'] > 0:
            print(f"🎊 {result['converted']} new markdown files created!")
        if result['skipped'] > 0:
            print(f"⚡ {result['skipped']} files skipped (already converted)")
    else:
        print(f"\n❌ Process failed: {result.get('error')}")


if __name__ == "__main__":
    main()