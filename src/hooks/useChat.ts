import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, DocumentSearchResult } from '@/types';
import { sendChatMessage } from '@/utils/api';
import { supabase } from '@/utils/supabaseClient';

interface SendMessageOptions {
  displayContent?: string;
  localQueryFn?: (query: string, language: string) => Promise<{ answer: string; sources: DocumentSearchResult[] }>;
  language?: string;
}

export function useChat(chatId: string | null, onCreateChat?: (firstMessageContent: string) => Promise<string | null>) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchedChatIdRef = useRef<string | null>(null);

  // Fetch historic messages when chatId changes
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      lastFetchedChatIdRef.current = null;
      return;
    }

    if (lastFetchedChatIdRef.current === chatId) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase()
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else if (data) {
        const formattedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.created_at),
          sources: msg.sources || undefined,
        }));
        setMessages(formattedMessages);
        lastFetchedChatIdRef.current = chatId;
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, [chatId]);

  const saveMessageToSupabase = async (activeChatId: string, content: string, isUser: boolean, sources?: DocumentSearchResult[]) => {
    const { data, error } = await supabase()
      .from('messages')
      .insert([
        {
          chat_id: activeChatId,
          role: isUser ? 'user' : 'assistant',
          content,
          sources: sources || null,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving message to Supabase:', error);
      return null;
    }
    return data;
  };

  const addUserMessage = useCallback((content: string, savedId?: string) => {
    const message: Message = {
      id: savedId || Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  const addAIMessage = useCallback((content: string = '', isStreaming: boolean = false, sources?: DocumentSearchResult[], savedId?: string) => {
    const message: Message = {
      id: savedId || Date.now().toString(),
      content,
      isUser: false,
      timestamp: new Date(),
      isStreaming,
      sources,
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  const sendMessage = useCallback(
    async (content: string, options: SendMessageOptions = {}) => {
      if (!content.trim()) return;

      const { displayContent, localQueryFn, language = 'English' } = options;

      // 1. Add User message to UI immediately (optimistic)
      const optimisticUserMsg = addUserMessage(displayContent || content);
      setIsLoading(true);

      let activeChatId = chatId;

      // If no chat exists, create one!
      if (!activeChatId && onCreateChat) {
        const newChatId = await onCreateChat(displayContent || content);
        if (!newChatId) {
          console.error("Failed to create chat");
          setIsLoading(false);
          return;
        }
        activeChatId = newChatId;
        lastFetchedChatIdRef.current = newChatId; // Prevent useEffect from wiping our optimistic UI
      }

      if (!activeChatId) {
        setIsLoading(false);
        return;
      }

      // 2. Save User message to Supabase in background
      saveMessageToSupabase(activeChatId, displayContent || content, true).then((saved) => {
        if (saved) {
          setMessages(prev => prev.map(m => m.id === optimisticUserMsg.id ? { ...m, id: saved.id } : m));
        }
      });

      try {
        let aiResponseContent = '';
        let aiSources: DocumentSearchResult[] | undefined;

        if (localQueryFn) {
          // ── Local RAG Mode ──
          const { answer, sources } = await localQueryFn(content, language);
          aiResponseContent = answer;
          aiSources = sources;
        } else {
          // ── n8n Mode ──
          // n8n expects a sessionId, we will use the chatId as the sessionId so history works
          const response = await sendChatMessage(content, activeChatId);
          aiResponseContent = response.message || response.output || response.text || JSON.stringify(response);
        }

        // 3. Add AI message to UI
        const optimisticAIMsg = addAIMessage(aiResponseContent, false, aiSources);
        
        // 4. Save AI message to Supabase
        saveMessageToSupabase(activeChatId, aiResponseContent, false, aiSources).then((saved) => {
          if (saved) {
            setMessages(prev => prev.map(m => m.id === optimisticAIMsg.id ? { ...m, id: saved.id } : m));
          }
        });

      } catch (error) {
        console.error('Error sending message:', error);
        addAIMessage('Sorry, I encountered an error processing your request. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, onCreateChat, addUserMessage, addAIMessage]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
}
