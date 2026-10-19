import { useEffect, useRef } from 'react';

import { useMarkConversationAsReadMutation } from '@/app/store/api/ChatsApi';
import type { ChatMessage } from '@/types/entities/Chat';

interface UseMarkMessagesReadParams {
  chatId?: string;
  currentUserId?: string;
  messages?: ChatMessage[];
  isOnline: boolean;
  isMessagesError: boolean;
}

export const useMarkMessagesRead = ({
  chatId,
  currentUserId,
  messages,
  isOnline,
  isMessagesError,
}: UseMarkMessagesReadParams) => {
  const lastMarkedRef = useRef<string | null>(null);

  const [markAsRead, { isLoading: isMarkingAsRead }] =
    useMarkConversationAsReadMutation();

  useEffect(() => {
    if (
      !chatId ||
      !currentUserId ||
      !messages ||
      !isOnline ||
      isMarkingAsRead ||
      isMessagesError
    ) {
      return;
    }

    const unreadIncomingMessages = messages.filter(
      (message) => message.senderId !== currentUserId && !message.isRead
    );

    if (unreadIncomingMessages.length === 0) {
      lastMarkedRef.current = null;
      return;
    }

    const unreadKey = [
      chatId,
      ...unreadIncomingMessages.map((message) => message.id),
    ].join(':');

    if (lastMarkedRef.current === unreadKey) {
      return;
    }

    lastMarkedRef.current = unreadKey;

    void markAsRead(chatId)
      .unwrap()
      .catch((error) => {
        if (lastMarkedRef.current === unreadKey) {
          lastMarkedRef.current = null;
        }

        console.error('Failed to mark messages as read:', error);
      });
  }, [
    chatId,
    currentUserId,
    messages,
    isOnline,
    isMarkingAsRead,
    isMessagesError,
    markAsRead,
  ]);
};
