import { useCallback, useRef, useState } from 'react';

import { useLazyGetConversationMessagesQuery } from '@/app/store/api/ChatsApi';
import type { ChatMessage } from '@/types/entities/Chat';

export const CHAT_MESSAGES_PAGE_SIZE = 40;

interface UseChatHistoryParams {
  chatId?: string;
  latestMessages?: ChatMessage[];
  isOnline: boolean;
}

interface ChatHistoryState {
  chatId?: string;
  olderMessages: ChatMessage[];
  hasMore: boolean;
}

const mergeMessages = (
  older: ChatMessage[],
  latest: ChatMessage[]
): ChatMessage[] => {
  const messagesMap = new Map<string, ChatMessage>();

  older.forEach((message) => {
    messagesMap.set(message.id, message);
  });

  latest.forEach((message) => {
    messagesMap.set(message.id, message);
  });

  return Array.from(messagesMap.values()).sort(
    (a, b) =>
      new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
  );
};

export const useChatHistory = ({
  chatId,
  latestMessages,
  isOnline,
}: UseChatHistoryParams) => {
  const [history, setHistory] = useState<ChatHistoryState>({
    chatId,
    olderMessages: [],
    hasMore: true,
  });

  const activeChatRef = useRef(chatId);
  const loadingChatRef = useRef<string | null>(null);

  // Invalidate pending requests when switching chats.
  const requestVersionRef = useRef(0);

  if (activeChatRef.current !== chatId) {
    activeChatRef.current = chatId;
    loadingChatRef.current = null;
    requestVersionRef.current += 1;
  }

  const [fetchOlderMessages] = useLazyGetConversationMessagesQuery();

  const currentHistory = history.chatId === chatId ? history : null;

  const olderMessages = currentHistory?.olderMessages ?? [];
  const hasMore = currentHistory?.hasMore ?? true;

  const messages = mergeMessages(olderMessages, latestMessages ?? []);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const loadMore = useCallback(
    async (beforePrepend?: () => void): Promise<boolean> => {
      if (
        !chatId ||
        !isOnline ||
        !latestMessages ||
        !hasMore ||
        loadingChatRef.current === chatId
      ) {
        return false;
      }

      const oldestMessage = messagesRef.current[0];

      if (!oldestMessage) {
        return false;
      }

      loadingChatRef.current = chatId;

      const requestVersion = ++requestVersionRef.current;

      const isCurrentRequest = () =>
        activeChatRef.current === chatId &&
        requestVersionRef.current === requestVersion;

      try {
        const response = await fetchOlderMessages(
          {
            conversationId: chatId,
            before: oldestMessage.id,
            limit: CHAT_MESSAGES_PAGE_SIZE,
          },
          false
        ).unwrap();

        if (!isCurrentRequest()) {
          return false;
        }

        const existingIds = new Set(
          messagesRef.current.map((message) => message.id)
        );

        const hasNewMessages = response.messages.some(
          (message) => !existingIds.has(message.id)
        );

        if (hasNewMessages) {
          beforePrepend?.();
        }

        setHistory((previous) => {
          const previousMessages =
            previous.chatId === chatId ? previous.olderMessages : [];

          return {
            chatId,
            olderMessages: hasNewMessages
              ? mergeMessages(response.messages, previousMessages)
              : previousMessages,
            hasMore:
              hasNewMessages &&
              response.messages.length === CHAT_MESSAGES_PAGE_SIZE,
          };
        });

        return hasNewMessages;
      } catch (error) {
        if (isCurrentRequest()) {
          console.error('Failed to load older messages:', error);
        }

        return false;
      } finally {
        if (isCurrentRequest()) {
          loadingChatRef.current = null;
        }
      }
    },
    [chatId, isOnline, latestMessages, hasMore, fetchOlderMessages]
  );

  return {
    messages,
    loadMore,
    hasMore,
  };
};
