import { useEffect, useRef } from 'react';
import type { Message as MessageType } from '@/types';
import { Message } from './Message';
import { LoadingSpinner } from '@/components/ui';
import { MessageSquare } from 'lucide-react';

interface ChatHistoryProps {
  messages: MessageType[];
  isLoading: boolean;
}

export function ChatHistory({ messages, isLoading }: ChatHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 glass-surface-strong rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-mixed">
            <MessageSquare className="h-10 w-10 text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Start a Conversation
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Ask me anything about construction, building codes, materials, or
            project management. I'm here to help!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
    >
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        
        {isLoading && messages[messages.length - 1]?.isUser && (
          <div className="flex justify-start mb-6">
            <div className="glass-surface rounded-2xl px-6 py-4">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
