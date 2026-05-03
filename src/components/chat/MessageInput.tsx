import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import config from '@/config';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (file: File) => void;
  disabled?: boolean;
  language: string;
  onLanguageChange?: (language: string) => void;
  hasDocuments?: boolean;
  canUploadMore?: boolean;
}

export function MessageInput({
  onSendMessage,
  onFileUpload,
  disabled = false,
  language,
  onLanguageChange,
  hasDocuments = false,
  canUploadMore = true,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setMessage((prev) => prev + transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
        {/* Accessory Controls (Top row on mobile, Left side on desktop) */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          {onLanguageChange && (
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              disabled={disabled}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-white/[0.1] bg-white/[0.05] text-sm font-medium text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all cursor-pointer hover:border-white/[0.2] disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              title="Select language"
            >
              {config.languages.map((lang) => (
                <option key={lang} value={lang} className="bg-dark-800 text-gray-200">
                  {lang}
                </option>
              ))}
            </select>
          )}

          {/* File Upload */}
          {onFileUpload && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf"
              />
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleFileClick}
                disabled={disabled || !canUploadMore}
                className={`flex-shrink-0 relative ${
                  hasDocuments
                    ? 'text-emerald-400 hover:text-emerald-300'
                    : ''
                }`}
                title={
                  !canUploadMore
                    ? `Maximum ${config.rag.maxFiles} files reached`
                    : 'Upload PDF file'
                }
              >
                <Paperclip className="h-5 w-5" />
                {hasDocuments && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-dark-900" />
                )}
              </Button>
            </>
          )}
        </div>

        {/* Primary Input Controls (Bottom row on mobile, Right side on desktop) */}
        <div className="flex items-end gap-2 flex-1">
          {/* Text Input */}
          <div
            className={`flex-1 glass-surface rounded-2xl transition-all ${
              hasDocuments
                ? 'border-emerald-500/30 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'glow-border-focus'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                hasDocuments
                  ? `Ask about your uploaded documents...`
                  : `Type your ${language.toLowerCase()} message...`
              }
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 max-h-32 text-gray-100 placeholder:text-gray-500"
            />
          </div>

          {/* Voice Input */}
          {isSpeechSupported && (
            <Button
              type="button"
              variant={isListening ? 'danger' : 'ghost'}
              size="md"
              onClick={toggleVoice}
              disabled={disabled}
              className="flex-shrink-0"
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="h-5 w-5 animate-pulse" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Send Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!message.trim() || disabled}
            className="flex-shrink-0"
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  );
}
