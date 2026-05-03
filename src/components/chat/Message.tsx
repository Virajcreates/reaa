import type { Message as MessageType } from '@/types';
import { formatTimestamp } from '@/utils/helpers';
import { User, Database, FileText } from 'lucide-react';
import { LoadingDots, ReaaLogo } from '@/components/ui';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const { content, isUser, timestamp, isStreaming } = message;

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}
    >
      <div
        className={`flex max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}
      >
        {/* Avatar */}
        {isUser ? (
          <div
            className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-blue-700 shadow-md"
          >
            <User className="h-5 w-5 text-white" />
          </div>
        ) : (
          <ReaaLogo size={36} />
        )}

        {/* Message Content */}
        <div
          className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`rounded-2xl px-5 py-3 ${
              isUser
                ? 'bg-blue-700 text-white shadow-md'
                : 'glass-surface text-gray-100'
            }`}
          >
            <div className="flex items-start gap-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {content}
              </p>
              {isStreaming && (
                <div className="flex-shrink-0 mt-1">
                  <LoadingDots />
                </div>
              )}
            </div>
            
            {/* Sources Watermark UI */}
            {message.sources && message.sources.length > 0 && !isUser && (
              <div className="mt-4 pt-3 border-t border-gray-700/30 flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Sources Examined
                </span>
                <div className="flex flex-col gap-1">
                  {Array.from(new Set(message.sources.map(s => s.filename))).map((sourceName, idx) => {
                    const isGlobal = sourceName === 'Knowledge Base';
                    const isError = sourceName === 'Knowledge Base Error';
                    let displayName = sourceName;
                    
                    if (isGlobal) displayName = 'Pinecone Global Knowledge Base';
                    if (isError) {
                      const errorDoc = message.sources?.find(r => r.filename === 'Knowledge Base Error');
                      displayName = `Pinecone Error: ${errorDoc?.content}`;
                    }

                    return (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-500/80">
                        {isError ? (
                          <span className="text-red-400">⚠️</span>
                        ) : isGlobal ? (
                          <Database className="w-3 h-3 text-accent-500/70" />
                        ) : (
                          <FileText className="w-3 h-3 text-primary-400/70" />
                        )}
                        <span className={`truncate max-w-[200px] sm:max-w-[300px] ${isError ? 'text-red-400/80' : ''}`}>
                          {displayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-xs text-gray-500 mt-1.5 px-1">
            {formatTimestamp(timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
