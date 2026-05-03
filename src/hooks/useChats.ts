import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import type { Chat } from '@/types';
import { useAuth } from './useAuth';

export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoadingChats(false);
      return;
    }

    const fetchChats = async () => {
      setLoadingChats(true);
      const { data, error } = await supabase()
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
      } else {
        setChats(data || []);
      }
      setLoadingChats(false);
    };

    fetchChats();

    // Subscribe to changes in the chats table
    const channel = supabase()
      .channel('public:chats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setChats((prev) => [payload.new as Chat, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setChats((prev) => prev.map((c) => (c.id === payload.new.id ? (payload.new as Chat) : c)));
        } else if (payload.eventType === 'DELETE') {
          setChats((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase().removeChannel(channel);
    };
  }, [user]);

  const createChat = async (title: string = 'New Chat') => {
    if (!user) return null;

    const { data, error } = await supabase()
      .from('chats')
      .insert([{ user_id: user.id, title }])
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return null;
    }

    const newChat = data as Chat;
    // Optimistically update the sidebar
    setChats(prev => {
      if (prev.some(c => c.id === newChat.id)) return prev;
      return [newChat, ...prev];
    });

    return newChat;
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;

    // Optimistically update the sidebar
    setChats(prev => prev.filter(c => c.id !== chatId));

    const { error } = await supabase()
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return {
    chats,
    loadingChats,
    createChat,
    deleteChat
  };
}
