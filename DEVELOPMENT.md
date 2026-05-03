# 🔧 Development Setup Guide

## Initial Setup

### 1. Prerequisites Check
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn

# Using pnpm
pnpm install
```

### 3. Environment Configuration
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
# Windows PowerShell:
notepad .env

# macOS/Linux:
nano .env
```

Update these values in `.env`:
```env
VITE_N8N_BASE_URL=http://localhost:5678
VITE_N8N_WORKFLOW_ID=1ccf3625-d9b5-4ec2-b73f-ec2e45a2427b
```

---

## Development Workflow

### Starting Development Server
```bash
npm run dev
```
- Server starts at `http://localhost:3000`
- Hot Module Replacement (HMR) enabled
- TypeScript type checking in background

### Code Linting
```bash
# Check for linting errors
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Type Checking
```bash
# Check TypeScript types without building
npx tsc --noEmit
```

### Building for Production
```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure Explained

```
openhandsVersion/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components (Button, Input, etc.)
│   │   ├── chat/           # Chat-specific components
│   │   ├── layout/         # Layout components (Header, etc.)
│   │   └── pages/          # Page-level components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── config/             # App configuration
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── .env                    # Environment variables (not in git)
├── .env.example            # Example environment file
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration
└── index.html              # HTML entry point
```

---

## VS Code Setup

### Recommended Extensions
Install these from `.vscode/extensions.json`:
1. **ESLint** - Code linting
2. **Tailwind CSS IntelliSense** - Class completion
3. **TypeScript Importer** - Auto imports

### Settings
Add to your VS Code settings:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## Common Development Tasks

### Adding a New Component

1. **Create component file:**
```tsx
// src/components/ui/NewComponent.tsx
export function NewComponent() {
  return <div>New Component</div>;
}
```

2. **Add to index:**
```tsx
// src/components/ui/index.ts
export { NewComponent } from './NewComponent';
```

3. **Use in app:**
```tsx
import { NewComponent } from '@/components/ui';
```

### Creating a New Hook

```tsx
// src/hooks/useCustomHook.ts
import { useState, useEffect } from 'react';

export function useCustomHook() {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Hook logic
  }, []);
  
  return { state, setState };
}
```

### Adding a New Utility

```tsx
// src/utils/myUtil.ts
export function myUtilFunction(param: string): string {
  return param.toUpperCase();
}
```

### Creating New Types

```tsx
// src/types/index.ts
export interface NewType {
  id: string;
  name: string;
}
```

---

## Testing the App

### Manual Testing Checklist

- [ ] Login with name
- [ ] Send text message
- [ ] Receive streaming response
- [ ] Use voice input
- [ ] Upload file
- [ ] Change language
- [ ] Logout
- [ ] Responsive on mobile
- [ ] Works in different browsers

### Browser Testing
Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (for macOS/iOS)

---

## Debugging

### React DevTools
1. Install React DevTools browser extension
2. Open DevTools (F12)
3. Go to "Components" tab
4. Inspect component props and state

### Vite DevTools
```bash
# Run with debug mode
DEBUG=vite:* npm run dev
```

### Network Requests
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Monitor API calls to n8n

### Console Logs
Check browser console for:
- API errors
- TypeScript errors
- Warning messages

---

## Common Issues & Solutions

### Issue: Port 3000 already in use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in package.json
"dev": "vite --port 3001"
```

### Issue: Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Issue: Tailwind classes not working
```bash
# Restart dev server
# Check tailwind.config.js content paths
```

---

## Git Workflow

### Initial Commit
```bash
git init
git add .
git commit -m "Initial commit: React TypeScript conversion"
```

### Feature Development
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add: new feature description"

# Push to remote
git push origin feature/my-feature
```

### Commit Message Format
```
Type: Short description

- Detail 1
- Detail 2

Types: Add, Update, Fix, Remove, Refactor, Style, Docs
```

---

## Performance Optimization

### Build Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

### Code Splitting
```tsx
// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

### Image Optimization
- Use WebP format
- Implement lazy loading
- Compress images before adding

---

## Deployment Preparation

### Pre-deployment Checklist
- [ ] Update environment variables
- [ ] Test production build locally
- [ ] Check all pages/features work
- [ ] Optimize images and assets
- [ ] Update documentation
- [ ] Remove console.logs
- [ ] Test on different devices
- [ ] Configure CORS properly

### Build Command
```bash
npm run build
```

### Environment Variables for Production
Update `.env.production`:
```env
VITE_N8N_BASE_URL=https://your-production-n8n.com
VITE_N8N_WORKFLOW_ID=your-production-workflow-id
```

---

## Resources

### Documentation
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide)

### Learning Resources
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)
- [Tailwind UI Components](https://tailwindui.com)

---

Happy coding! 🚀
