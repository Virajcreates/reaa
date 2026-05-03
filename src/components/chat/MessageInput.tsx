import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Mic, MicOff } from 'lucide-react';
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
      {/* Unified Pill Container */}
      <div 
        className={`flex flex-col p-2 transition-all duration-300 rounded-[2rem] ${
          hasDocuments
            ? 'bg-dark-800/90 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
            : 'bg-dark-800/90 border border-white/[0.1] focus-within:border-primary-500/50 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.15)] focus-within:bg-dark-800'
        }`}
      >
        {/* Top Row: Text Input */}
        <div className="flex-1 px-4 pt-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={
              hasDocuments
                ? `Ask about your documents...`
                : `Type your ${language.toLowerCase()} message...`
            }
            disabled={disabled}
            rows={1}
            className="w-full py-2 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 max-h-32 text-gray-100 placeholder:text-gray-500 text-[15px] leading-relaxed"
          />
        </div>

        {/* Bottom Row: Toolbar */}
        <div className="flex items-center justify-between px-2 pb-1 pt-2">
          {/* Left Side Controls (Upload & Language) */}
          <div className="flex items-center gap-1">
            {onFileUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf"
                />
                <button
                  type="button"
                  onClick={handleFileClick}
                  disabled={disabled || !canUploadMore}
                  className={`p-2 rounded-full transition-colors flex items-center justify-center relative ${
                    hasDocuments
                      ? 'text-emerald-400 hover:bg-emerald-400/10'
                      : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
                  } ${(!canUploadMore || disabled) && 'opacity-50 cursor-not-allowed'}`}
                  title={
                    !canUploadMore
                      ? `Maximum ${config.rag.maxFiles} files reached`
                      : 'Upload PDF file'
                  }
                >
                  <Plus className="h-6 w-6" strokeWidth={2.5} />
                  {hasDocuments && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-[2px] border-dark-800" />
                  )}
                </button>
              </>
            )}

            {onLanguageChange && (
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                disabled={disabled}
                className="ml-1 px-3 py-1.5 rounded-full border border-white/[0.05] bg-white/[0.03] text-sm font-medium text-gray-300 focus:outline-none hover:bg-white/10 hover:text-white transition-colors cursor-pointer appearance-none max-w-[120px] sm:max-w-none text-ellipsis overflow-hidden"
                title="Select language"
              >
                {config.languages.map((lang) => (
                  <option key={lang} value={lang} className="bg-dark-800 text-gray-200">
                    {lang}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Right Side Controls (Mic & Send) */}
          <div className="flex items-center gap-1">
            {isSpeechSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                disabled={disabled}
                className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                  isListening
                    ? 'text-red-400 bg-red-400/10 animate-pulse'
                    : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
                } ${disabled && 'opacity-50 cursor-not-allowed'}`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
            )}

            <button
              type="submit"
              disabled={!message.trim() || disabled}
              className={`p-2.5 rounded-full transition-all duration-200 flex items-center justify-center ml-1 ${
                message.trim() && !disabled
                  ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/30 scale-100'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed scale-95'
              }`}
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
  );
}
