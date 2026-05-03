# Construction AI Assistant - React TypeScript

A modern, professional construction chat application built with React, TypeScript, and Tailwind CSS. This application provides an AI-powered assistant for construction-related queries with real-time streaming responses, multi-language support, and file upload capabilities.

## ✨ Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **Real-time Streaming**: Live AI responses using Server-Sent Events (SSE)
- **Voice Input**: Speech-to-text functionality for hands-free interaction
- **File Upload**: Document processing with visual feedback
- **Multi-language Support**: English, Kannada, and Hindi
- **Responsive Design**: Beautiful UI that works on all devices
- **Type-Safe**: Full TypeScript implementation with strict type checking
- **Professional UI**: Glassmorphism effects, smooth animations, and elegant design
- **Session Management**: Persistent user sessions with localStorage
- **Custom Hooks**: Reusable React hooks for chat and speech recognition

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   └── index.ts
│   ├── chat/                  # Chat-specific components
│   │   ├── Message.tsx
│   │   ├── MessageInput.tsx
│   │   └── ChatHistory.tsx
│   ├── layout/                # Layout components
│   │   └── Header.tsx
│   └── pages/                 # Page components
│       ├── LoginPage.tsx
│       └── ChatPage.tsx
├── hooks/                     # Custom React hooks
│   ├── useChat.ts
│   └── useSpeechRecognition.ts
├── utils/                     # Utility functions
│   ├── helpers.ts
│   └── api.ts
├── types/                     # TypeScript type definitions
│   └── index.ts
├── config/                    # Configuration
│   └── index.ts
├── App.tsx                    # Main application component
├── main.tsx                   # Application entry point
└── index.css                  # Global styles
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- n8n server with configured workflow
- Modern web browser

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd openhandsVersion
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Copy `.env.example` to `.env` and update with your n8n details:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   VITE_N8N_BASE_URL=http://localhost:5678
   VITE_N8N_WORKFLOW_ID=1ccf3625-d9b5-4ec2-b73f-ec2e45a2427b
   VITE_APP_TITLE=Construction AI Assistant
   VITE_APP_SUBTITLE=Ready to help with your construction queries
   VITE_FILE_PROCESSING_TIMEOUT=30
   VITE_SUPPORTED_LANGUAGES=English,Kannada,Hindi
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the client-side code:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_N8N_BASE_URL` | n8n server base URL | `http://localhost:5678` |
| `VITE_N8N_WORKFLOW_ID` | n8n workflow ID | - |
| `VITE_APP_TITLE` | Application title | `Construction AI Assistant` |
| `VITE_APP_SUBTITLE` | Application subtitle | `Ready to help with your construction queries` |
| `VITE_FILE_PROCESSING_TIMEOUT` | File upload timeout (seconds) | `30` |
| `VITE_SUPPORTED_LANGUAGES` | Comma-separated languages | `English,Kannada,Hindi` |

### n8n Webhook Configuration

Your n8n workflow needs two endpoints:

#### 1. Chat Endpoint (POST)
**URL:** `http://localhost:5678/webhook/YOUR-WORKFLOW-ID/chat`

**Request Body:**
```json
{
  "message": "User's message here",
  "sessionId": "session_1234567890_abc123"
}
```

**Response:**
```json
{
  "sessionId": "session_1234567890_abc123"
}
```

#### 2. Stream Endpoint (SSE)
**URL:** `http://localhost:5678/webhook/YOUR-WORKFLOW-ID/chat/stream?sessionId=SESSION_ID`

**Response Format (Server-Sent Events):**
```
data: {"type": "token", "data": {"text": "Hello"}}

data: {"type": "token", "data": {"text": " world"}}

data: {"type": "agent-end", "data": {}}
```

## 📦 Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist/` directory.

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
colors: {
  primary: {
    // Your custom colors
  },
  construction: {
    // Your custom construction-themed colors
  }
}
```

### Supported Languages

Add or remove languages in `.env`:

```env
VITE_SUPPORTED_LANGUAGES=English,Kannada,Hindi,Spanish,French
```

### UI Components

All UI components are in `src/components/ui/` and can be customized:
- `Button.tsx` - Buttons with multiple variants
- `Input.tsx` - Text inputs
- `Textarea.tsx` - Text areas
- `Card.tsx` - Card containers
- `Loading.tsx` - Loading indicators

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Structure

- **Components**: Follow atomic design principles (atoms → molecules → organisms)
- **Hooks**: Custom hooks for reusable logic
- **Utils**: Pure utility functions
- **Types**: TypeScript interfaces and types
- **Config**: Centralized configuration

### Adding New Features

1. **Create types** in `src/types/index.ts`
2. **Add utilities** in `src/utils/`
3. **Create components** in appropriate directories
4. **Create hooks** if needed in `src/hooks/`
5. **Update configuration** if necessary

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Store sensitive data server-side when possible
3. **CORS**: Configure n8n CORS properly for your domain
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: Validate and sanitize user inputs
6. **Session Storage**: Clear sensitive data on logout

## 🌐 Deployment

### Netlify

1. Connect your repository
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in Netlify dashboard
4. Deploy!

### Vercel

1. Import project
2. Configure:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variables
4. Deploy!

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t construction-ai-assistant .
docker run -p 80:80 construction-ai-assistant
```

## 🐛 Troubleshooting

### CORS Issues
Ensure n8n allows requests from your domain:
```javascript
{
  "cors": {
    "origin": ["http://localhost:3000", "https://yourdomain.com"],
    "credentials": true
  }
}
```

### Environment Variables Not Loading
- Ensure variables are prefixed with `VITE_`
- Restart the dev server after changing `.env`
- Check the browser console for errors

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### TypeScript Errors
```bash
# Check for type errors
npx tsc --noEmit
```

## 📚 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **Framer Motion** - Animation library (optional)
- **clsx** - Conditional className utility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- n8n for the powerful workflow automation
- Tailwind CSS for the amazing utility classes
- React team for the fantastic library
- Lucide for beautiful icons

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review n8n documentation

---

Built with ❤️ for the construction industry
