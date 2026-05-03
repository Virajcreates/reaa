# 🚀 Quick Start Guide - Construction AI Assistant

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Make sure your `.env` file exists with the correct n8n webhook URL:
```env
VITE_N8N_BASE_URL=http://localhost:5678
VITE_N8N_WORKFLOW_ID=1ccf3625-d9b5-4ec2-b73f-ec2e45a2427b
```

### 3. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📋 What You'll See

1. **Login Page**: Enter your name to start
2. **Chat Interface**: Beautiful modern chat UI
3. **Features**:
   - Type messages
   - Voice input (click mic icon)
   - File upload (click paperclip icon)
   - Language selection (top right)
   - Logout button

## 🎨 Key Features

✅ **Real-time Streaming** - See AI responses as they're generated
✅ **Voice Input** - Speak instead of typing
✅ **File Upload** - Upload documents for analysis
✅ **Multi-language** - Switch between English, Kannada, Hindi
✅ **Persistent Sessions** - Your session is saved in browser
✅ **Responsive Design** - Works on mobile and desktop

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
src/
├── components/     # UI components
├── hooks/         # Custom React hooks
├── utils/         # Helper functions
├── types/         # TypeScript types
└── config/        # Configuration
```

## 🐛 Troubleshooting

### Issue: CORS Error
**Solution**: Make sure your n8n server allows CORS from `http://localhost:3000`

### Issue: Streaming Not Working
**Solution**: Verify your n8n workflow has the stream endpoint configured

### Issue: Voice Input Not Working
**Solution**: Grant microphone permission in your browser

### Issue: Environment Variables Not Loading
**Solution**: Restart the dev server after changing `.env`

## 🎯 Next Steps

1. Customize colors in `tailwind.config.js`
2. Add more languages in `.env`
3. Modify components in `src/components/`
4. Add new features in `src/hooks/`

## 📖 Full Documentation

See `README-REACT.md` for complete documentation.

---

Need help? Check the troubleshooting section or create an issue!
