import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { MessageInput } from '@/components/chat/MessageInput';
import { DocumentPanel } from '@/components/chat/DocumentPanel';
import { AnimatedBackground } from '@/components/ui';
import { useChat } from '@/hooks/useChat';
import { useChats } from '@/hooks/useChats';
import { useLocalRAG } from '@/hooks/useLocalRAG';
import { modifyPromptForLanguage } from '@/utils/helpers';
import config from '@/config';

interface ChatPageProps {
  userName: string;
  onLogout: () => void;
}

export function ChatPage({ userName, onLogout }: ChatPageProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(config.languages[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const { chats, loadingChats, createChat, deleteChat } = useChats();
  const hasAutoSelected = useRef(false);

  // Auto-select the most recent chat ONLY on initial load
  useEffect(() => {
    if (!hasAutoSelected.current && !currentChatId && chats.length > 0 && !loadingChats) {
      setCurrentChatId(chats[0].id);
      hasAutoSelected.current = true;
    }
    if (!hasAutoSelected.current && chats.length === 0 && !loadingChats) {
      // Even if there are no chats, we mark initial load as done
      hasAutoSelected.current = true;
    }
  }, [chats, currentChatId, loadingChats]);

  const handleCreateChat = async (firstMessageContent: string) => {
    const title = firstMessageContent.substring(0, 30) + (firstMessageContent.length > 30 ? '...' : '');
    const newChat = await createChat(title);
    if (newChat) {
      setCurrentChatId(newChat.id);
      return newChat.id;
    }
    return null;
  };

  const handleNewChatButton = () => {
    setCurrentChatId(null);
  };

  const handleDeleteChat = async (chatId: string) => {
    await deleteChat(chatId);
    if (currentChatId === chatId) {
      const remainingChats = chats.filter(c => c.id !== chatId);
      setCurrentChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  };

  const { messages, isLoading, sendMessage } = useChat(currentChatId, handleCreateChat);
  
  // The local RAG needs an ID to associate vectors with. 
  // If no chat is created yet, we use a temporary session ID until the first message creates the chat.
  const ragSessionId = currentChatId || 'temp-session';
  const {
    uploadedDocuments,
    processingProgress,
    hasDocuments,
    isProcessing,
    canUploadMore,
    processFile,
    queryDocuments,
    removeDocument,
    clearAllDocuments,
  } = useLocalRAG(ragSessionId);

  const handleSendMessage = (message: string) => {
    const displayMessage = message;
    const modifiedMessage = modifyPromptForLanguage(message, selectedLanguage);

    if (hasDocuments) {
      sendMessage(modifiedMessage, {
        displayContent: displayMessage,
        localQueryFn: queryDocuments,
        language: selectedLanguage,
      });
    } else {
      sendMessage(modifiedMessage, {
        displayContent: displayMessage,
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    await processFile(file);
  };

  return (
    <div className="min-h-screen flex bg-dark-900 relative">
      <AnimatedBackground />

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={handleNewChatButton}
        onDeleteChat={handleDeleteChat}
        loading={loadingChats}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative lg:pl-72 transition-all duration-300">
        <Header
          userName={userName}
          onLogout={onLogout}
          onMenuToggle={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 flex flex-col pt-20 pb-32 relative z-10">
          {currentChatId === null && messages.length === 0 ? (
             <div className="flex-1 flex items-center justify-center p-8">
               <div className="text-center max-w-md">
                 <h2 className="text-3xl font-bold text-white mb-3">
                   New Chat
                 </h2>
                 <p className="text-gray-400 leading-relaxed">
                   Type a message below to start a new conversation.
                 </p>
               </div>
             </div>
          ) : (
             <ChatHistory messages={messages} isLoading={isLoading} />
          )}
        </main>

        <div className="fixed bottom-0 left-0 right-0 lg:left-72 bg-dark-900/90 backdrop-blur-xl border-t border-white/[0.06] shadow-glass p-4 z-20 transition-all duration-300">
          <div className="max-w-4xl mx-auto">
            <DocumentPanel
              documents={uploadedDocuments}
              processingProgress={processingProgress}
              canUploadMore={canUploadMore}
              onRemoveDocument={removeDocument}
              onClearAll={clearAllDocuments}
            />

            {!hasDocuments && uploadedDocuments.length === 0 && !processingProgress && (
              <div className="mb-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                  n8n Workflow Mode
                </span>
              </div>
            )}

            <MessageInput
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              disabled={isLoading || isProcessing}
              language={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              hasDocuments={hasDocuments}
              canUploadMore={canUploadMore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
