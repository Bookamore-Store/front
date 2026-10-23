import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';

import {
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useSendConversationMessageMutation,
} from '@/app/store/api/ChatsApi';
import { selectUser } from '@/app/store/slices/authSlice';

import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { Spinner } from '@/shared/ui/Spinner';

import { ChatError } from './components/ChatError';
import { ChatHeader } from './components/ChatHeader';
import { ConnectionBanner } from './components/ConnectionBanner';
import { MessageInput } from './components/MessageInput';
import { MessageList } from './components/MessageList';

import {
  CHAT_MESSAGES_PAGE_SIZE,
  useChatHistory,
} from './hooks/useChatHistory';
import { useChatScroll } from './hooks/useChatScroll';
import { useChatDraft } from './hooks/useChatDraft';
import { useMarkMessagesRead } from './hooks/useMarkMessagesRead';

import type { Conversation } from '@/types/entities/Chat';

const ChatPage = () => {
  const { t } = useTranslation();
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();

  const currentUser = useSelector(selectUser);
  const isOnline = useOnlineStatus();

  const { value: newMessage, version: draftVersion, updateDraft, clearIfUnchanged } =
    useChatDraft(currentUser?.id, chatId);
  const [sendError, setSendError] = useState<string | null>(null);
  const [hasRefreshError, setHasRefreshError] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [newMessage]);

  const {
    currentData: messagesData,
    isError: isMessagesError,
    isFetching: isFetchingMessages,
    isSuccess: isMessagesSuccess,
    refetch: refetchMessages,
  } = useGetConversationMessagesQuery(
    {
      conversationId: chatId ?? '',
      limit: CHAT_MESSAGES_PAGE_SIZE,
    },
    {
      skip: !chatId,
      pollingInterval: isOnline ? 3000 : 0,
      skipPollingIfUnfocused: true,
      refetchOnReconnect: true,
    }
  );

  // Keep the warning visible while subsequent polling requests are pending.
  // Clear it only after a completed successful refresh.
  useEffect(() => {
    if (isMessagesError) {
      setHasRefreshError(true);
    } else if (isMessagesSuccess && !isFetchingMessages) {
      setHasRefreshError(false);
    }
  }, [isMessagesError, isMessagesSuccess, isFetchingMessages]);

  useEffect(() => {
    setHasRefreshError(false);
  }, [chatId]);

  const { data: conversationsData } = useGetConversationsQuery();
  const [sendMessage, { isLoading: isSending }] =
    useSendConversationMessageMutation();

  const { messages, loadMore, hasMore } = useChatHistory({
    chatId,
    latestMessages: messagesData?.messages,
    isOnline,
  });

  const conversationsList: Conversation[] = Array.isArray(conversationsData)
    ? conversationsData
    : (conversationsData?.content ?? []);
  const conversation = conversationsList.find((item) => item.id === chatId);
  const lastMessage = messages.at(-1);

  const { messagesContainerRef, handleMessagesScroll, saveScrollPosition } =
    useChatScroll({
      chatId,
      firstMessageId: messages[0]?.id,
      lastMessageId: lastMessage?.id,
      lastMessageSenderId: lastMessage?.senderId,
      currentUserId: currentUser?.id,
      hasMessagesData: Boolean(messagesData),
    });

  useMarkMessagesRead({
    chatId,
    currentUserId: currentUser?.id,
    messages: messagesData?.messages,
    isOnline,
    isMessagesError,
  });

  const handleChatScroll = () => {
    handleMessagesScroll();

    const container = messagesContainerRef.current;

    if (
      !container ||
      !hasMore ||
      !isOnline ||
      container.scrollTop > container.clientHeight
    ) {
      return;
    }

    void loadMore(saveScrollPosition);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    if (!chatId || !isOnline) return;

    void refetchMessages();
  };

  const handleSendMessage = async (): Promise<void> => {
    const content = newMessage.trim();

    if (!content || !chatId || !isOnline || isSending) return;

    const sendingChatId = chatId;
    const sendingVersion = draftVersion;

    setSendError(null);

    try {
      await sendMessage({
        conversationId: sendingChatId,
        content,
      }).unwrap();

      clearIfUnchanged(sendingChatId, sendingVersion, content);
    } catch (error: unknown) {
      console.error('Failed to send message:', error);

      if (chatId === sendingChatId) {
        setSendError(t('chats.sendMessageError'));
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void handleSendMessage();
    }
  };

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;

    updateDraft(value);
    setSendError(null);
  };

  if (chatId && isOnline && !messagesData && !isMessagesError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Spinner size="md" />
      </div>
    );
  }

  if (!chatId || (!messagesData && (isMessagesError || !isOnline))) {
    const errorType = !chatId ? 'not-found' : !isOnline ? 'offline' : 'error';

    return (
      <ChatError type={errorType} onRetry={handleRetry} onBack={handleBack} />
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <ChatHeader conversation={conversation} />

      <main className="relative mx-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
          <ConnectionBanner
            isOnline={isOnline}
            isMessagesError={hasRefreshError || isMessagesError}
            hasMessagesData={Boolean(messagesData)}
          />
        </div>

        <MessageList
          messages={messages}
          currentUserId={currentUser?.id}
          containerRef={messagesContainerRef}
          onScroll={handleChatScroll}
        />
      </main>

      <MessageInput
        value={newMessage}
        isSending={isSending}
        isOnline={isOnline}
        error={sendError}
        textareaRef={textareaRef}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
        onSend={() => void handleSendMessage()}
      />
    </div>
  );
};

export { ChatPage };
