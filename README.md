# Construction RAG Chat Application

A modern, responsive chat interface for construction-related AI assistance with n8n integration.

## 🚀 Features

- **Modern UI**: Clean, professional design with glassmorphism effects
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Voice Input**: Speech-to-text functionality using browser APIs
- **File Upload**: Document processing with visual feedback
- **Multi-language Support**: English, Kannada, and Hindi translation options
- **Real-time Streaming**: Live response streaming from n8n workflows
- **Configurable**: Environment-based configuration system

## 📁 Project Structure

```
project/
├── construction-rag-chat.html    # Main application file
├── config.js                     # Configuration module
├── .env                          # Environment variables (not in git)
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## ⚙️ Configuration

### Environment Variables

The application uses a `.env` file for configuration. Copy the example values and modify as needed:

```bash
# n8n Webhook Configuration
N8N_BASE_URL=http://localhost:5678
N8N_WORKFLOW_ID=your-workflow-id-here

# Application Settings
APP_TITLE=Construction AI Assistant
APP_SUBTITLE=Ready to help with your construction queries

# File Processing Settings
FILE_PROCESSING_TIMEOUT=30

# Language Options (comma-separated)
SUPPORTED_LANGUAGES=English,Kannada,Hindi
```

### Configuration Files

1. **`.env`**: Contains sensitive configuration like API endpoints and workflow IDs
2. **`config.js`**: JavaScript configuration module that loads environment variables
3. **`.gitignore`**: Protects sensitive files from being committed to version control

## 🛠️ Setup Instructions

### 1. Clone/Download the Project

```bash
git clone <your-repo-url>
cd construction-rag-chat
```

### 2. Configure Environment Variables

```bash
# Copy the example .env file
cp .env .env.local

# Edit the configuration
nano .env
```

Update the following values:
- `N8N_BASE_URL`: Your n8n server URL
- `N8N_WORKFLOW_ID`: Your specific workflow ID
- `APP_TITLE`: Customize the application title
- Other settings as needed

### 3. Deploy the Application

#### Option A: Simple HTTP Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000
```

#### Option B: Production Deployment
- Upload files to your web server
- Ensure `.env` file is properly configured for your environment
- Configure your web server to serve static files

## 🔧 n8n Integration

### Required n8n Workflow Setup

Your n8n workflow should have:

1. **Webhook Trigger**: 
   - Method: POST
   - Path: `/webhook/YOUR-WORKFLOW-ID/chat`
   - Response: JSON with `sessionId`

2. **Streaming Endpoint**:
   - Path: `/webhook/YOUR-WORKFLOW-ID/chat/stream`
   - Query Parameter: `sessionId`
   - Response: Server-Sent Events (SSE)

### Expected Response Format

**Initial POST Response:**
```json
{
  "sessionId": "unique-session-identifier"
}
```

**Streaming Response (SSE):**
```json
{"type": "token", "data": {"text": "Hello"}}
{"type": "token", "data": {"text": " world"}}
{"type": "agent-end", "data": {}}
```

## 🎨 Customization

### Styling
The application uses Tailwind CSS with custom color schemes:
- `construction-dark`: Dark blue (#1e3a8a)
- `construction-blue`: Medium blue (#3b82f6)
- `construction-light-blue`: Light blue (#60a5fa)
- `construction-grey`: Grey (#6b7280)

### Language Support
Add new languages by updating the `SUPPORTED_LANGUAGES` in your `.env` file:
```bash
SUPPORTED_LANGUAGES=English,Kannada,Hindi,Spanish,French
```

### File Processing Timeout
Adjust the file processing timeout:
```bash
FILE_PROCESSING_TIMEOUT=45  # 45 seconds
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different `.env` files for different environments
- Rotate API keys and workflow IDs regularly

### CORS Configuration
Ensure your n8n server allows CORS requests from your domain:
```javascript
// n8n CORS settings
{
  "cors": {
    "origin": ["https://yourdomain.com"],
    "credentials": true
  }
}
```

### HTTPS
Always use HTTPS in production:
- Configure SSL certificates
- Update `N8N_BASE_URL` to use `https://`
- Ensure secure cookie settings

## 🚀 Deployment Options

### 1. Static Hosting (Recommended)
- **Netlify**: Automatic deployments with environment variables
- **Vercel**: Edge functions and environment variable support
- **GitHub Pages**: Simple static hosting (limited environment variable support)

### 2. Traditional Web Hosting
- Upload files via FTP/SFTP
- Configure environment variables on the server
- Ensure proper file permissions

### 3. Docker Deployment
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check n8n CORS configuration
   - Verify domain whitelist

2. **Environment Variables Not Loading**
   - Ensure `.env` file exists and is readable
   - Check `config.js` for proper variable names

3. **Streaming Not Working**
   - Verify EventSource support in browser
   - Check network connectivity to n8n server
   - Validate SSE response format

4. **File Upload Issues**
   - Check file size limits
   - Verify file type restrictions
   - Ensure proper error handling

### Debug Mode
Enable debug logging by adding to your `.env`:
```bash
DEBUG_MODE=true
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review n8n documentation for workflow setup