import { Plus, MessageSquare, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Chat } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  loading: boolean;
}

export function Sidebar({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  loading
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 bottom-0 w-72 bg-dark-900/95 backdrop-blur-2xl border-r border-white/[0.06] shadow-glass z-50
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:z-30 lg:pt-20
      `}>
        {/* Mobile header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06] lg:hidden">
          <span className="font-semibold text-white">Chat History</span>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 bg-white/5 border-white/[0.1] hover:bg-white/10"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scroll-smooth">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center p-4 text-sm text-gray-500">
              No previous chats
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`
                  group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                  ${currentChatId === chat.id 
                    ? 'bg-blue-900/40 text-blue-300 border border-blue-700/40' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'}
                `}
                onClick={() => {
                  onSelectChat(chat.id);
                  if (window.innerWidth < 1024) onClose();
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate font-medium">{chat.title || 'New Chat'}</span>
                </div>
                
                <button 
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  title="Delete chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
