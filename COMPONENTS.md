# 🎨 Component Documentation

## UI Components (`src/components/ui/`)

### Button
Multi-variant button component with loading states.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="secondary" isLoading>
  Loading...
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- All standard button HTML attributes

### Input
Styled input component with label and error support.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Your Name"
  placeholder="Enter name"
  error="This field is required"
/>
```

**Props:**
- `label`: string (optional)
- `error`: string (optional)
- All standard input HTML attributes

### Textarea
Auto-resizing textarea component.

```tsx
import { Textarea } from '@/components/ui';

<Textarea
  placeholder="Type a message"
  rows={1}
/>
```

**Props:**
- `label`: string (optional)
- `error`: string (optional)
- All standard textarea HTML attributes

### Card
Container component with glassmorphism effect.

```tsx
import { Card } from '@/components/ui';

<Card hover className="p-6">
  <h2>Card Content</h2>
</Card>
```

**Props:**
- `hover`: boolean - Enable hover animation
- `className`: string - Additional CSS classes

### Loading Components
Loading indicators for different scenarios.

```tsx
import { LoadingSpinner, LoadingDots } from '@/components/ui';

<LoadingSpinner size="md" />
<LoadingDots />
```

---

## Chat Components (`src/components/chat/`)

### Message
Individual message bubble component.

```tsx
import { Message } from '@/components/chat/Message';

<Message message={{
  id: 'msg_1',
  content: 'Hello!',
  isUser: true,
  timestamp: new Date(),
  isStreaming: false
}} />
```

**Props:**
- `message`: Message object with id, content, isUser, timestamp, isStreaming

### MessageInput
Input component with voice and file upload support.

```tsx
import { MessageInput } from '@/components/chat/MessageInput';

<MessageInput
  onSendMessage={handleSend}
  onFileUpload={handleUpload}
  disabled={isLoading}
  language="English"
/>
```

**Props:**
- `onSendMessage`: (message: string) => void
- `onFileUpload`: (file: File) => void (optional)
- `disabled`: boolean
- `language`: string

### ChatHistory
Scrollable message container.

```tsx
import { ChatHistory } from '@/components/chat/ChatHistory';

<ChatHistory
  messages={messages}
  isLoading={isLoading}
/>
```

**Props:**
- `messages`: Message[]
- `isLoading`: boolean

---

## Layout Components (`src/components/layout/`)

### Header
Top navigation bar with user info and controls.

```tsx
import { Header } from '@/components/layout/Header';

<Header
  userName="John Doe"
  onLogout={handleLogout}
  onLanguageChange={setLanguage}
  selectedLanguage="English"
/>
```

**Props:**
- `userName`: string
- `onLogout`: () => void
- `onLanguageChange`: (language: string) => void
- `selectedLanguage`: string

---

## Page Components (`src/components/pages/`)

### LoginPage
Authentication page component.

```tsx
import { LoginPage } from '@/components/pages/LoginPage';

<LoginPage onLogin={handleLogin} />
```

**Props:**
- `onLogin`: (name: string) => void

### ChatPage
Main chat interface.

```tsx
import { ChatPage } from '@/components/pages/ChatPage';

<ChatPage
  userName="John Doe"
  sessionId="session_123"
  onLogout={handleLogout}
/>
```

**Props:**
- `userName`: string
- `sessionId`: string
- `onLogout`: () => void

---

## Custom Hooks (`src/hooks/`)

### useChat
Manages chat state and API interactions.

```tsx
import { useChat } from '@/hooks/useChat';

const { messages, isLoading, sendMessage, clearChat } = useChat(sessionId);

// Send a message
sendMessage("Hello!");

// Clear chat history
clearChat();
```

**Returns:**
- `messages`: Message[] - Array of chat messages
- `isLoading`: boolean - Loading state
- `sendMessage`: (content: string) => Promise<void>
- `clearChat`: () => void

### useSpeechRecognition
Provides voice input functionality.

```tsx
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

const {
  isListening,
  transcript,
  startListening,
  stopListening,
  resetTranscript,
  isSupported
} = useSpeechRecognition();
```

**Returns:**
- `isListening`: boolean - Current listening state
- `transcript`: string - Transcribed text
- `startListening`: () => void
- `stopListening`: () => void
- `resetTranscript`: () => void
- `isSupported`: boolean - Browser support check

---

## Utility Functions (`src/utils/`)

### helpers.ts

```tsx
import { cn, generateSessionId, formatTimestamp } from '@/utils/helpers';

// Combine class names
const className = cn('base-class', condition && 'conditional-class');

// Generate unique session ID
const sessionId = generateSessionId();

// Format date to time string
const time = formatTimestamp(new Date());
```

### api.ts

```tsx
import { sendChatMessage, createStreamConnection, uploadFile } from '@/utils/api';

// Send a chat message
const response = await sendChatMessage(message, sessionId);

// Create streaming connection
const eventSource = createStreamConnection(
  sessionId,
  (text) => console.log('Token:', text),
  () => console.log('Stream ended'),
  (error) => console.error('Error:', error)
);

// Upload a file
await uploadFile(file, sessionId);
```

---

## Type Definitions (`src/types/`)

### Message
```typescript
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}
```

### User
```typescript
interface User {
  name: string;
  sessionId: string;
}
```

### N8nChatResponse
```typescript
interface N8nChatResponse {
  sessionId: string;
  message?: string;
}
```

### StreamEvent
```typescript
interface StreamEvent {
  type: 'token' | 'agent-end' | 'error';
  data: {
    text?: string;
    error?: string;
  };
}
```

---

## Styling Guidelines

### Tailwind Classes
Common patterns used throughout the app:

**Glassmorphism:**
```tsx
className="bg-white/95 backdrop-blur-lg border border-white/20"
```

**Gradients:**
```tsx
className="bg-gradient-to-r from-primary-600 to-primary-700"
```

**Shadows:**
```tsx
className="shadow-soft" // or "shadow-elegant"
```

**Animations:**
```tsx
className="animate-fade-in" // or "animate-slide-up"
```

### Custom CSS Classes
Defined in `src/index.css`:
- `animate-fade-in`
- `animate-slide-up`
- `scrollbar-thin`

---

## Best Practices

### Component Creation
1. Use TypeScript for all components
2. Define prop interfaces
3. Use React.forwardRef for form elements
4. Export from index files

### State Management
1. Use local state for UI state
2. Use custom hooks for complex logic
3. Use localStorage for persistence
4. Clear sensitive data on logout

### Styling
1. Use Tailwind utility classes
2. Create reusable components for patterns
3. Use CSS variables for theme colors
4. Keep responsive design in mind

### Performance
1. Memoize expensive computations
2. Use useCallback for event handlers
3. Lazy load heavy components
4. Optimize images and assets

---

For more details, see the full documentation in `README-REACT.md`.
