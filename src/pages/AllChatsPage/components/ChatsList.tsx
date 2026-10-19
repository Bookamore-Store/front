import { useTranslation } from 'react-i18next';

import { Spinner } from '@/shared/ui/Spinner';
import type { Conversation } from '@/types/entities/Chat';

import { ChatListItem } from './ChatListItem';
import type { ChatTab } from '../types';

interface ChatsListProps {
  chats: Conversation[];
  activeTab: ChatTab;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export const ChatsList = ({
  chats,
  activeTab,
  isLoading,
  isError,
  onRetry,
}: ChatsListProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <span className="text-2xl">⚠️</span>
        </div>

        <h3 className="mb-2 text-lg font-medium text-gray-900">
          {t('chats.failedToLoad')}
        </h3>

        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-aquamarine-700 px-4 py-2 text-sm font-medium text-white hover:bg-aquamarine-800"
        >
          {t('chats.tryAgain')}
        </button>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <span className="text-2xl">💬</span>
        </div>

        <h3 className="mb-2 text-lg font-medium text-gray-900">
          {t('chats.noChats')}
        </h3>

        <p className="max-w-md text-sm text-gray-600">
          {activeTab === 'selling'
            ? t('chats.buyersContact')
            : t('chats.youContact')}
        </p>
      </div>
    );
  }

  return (
    <div aria-label={t('chats.conversations')}>
      {chats.map((chat) => (
        <ChatListItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
};
