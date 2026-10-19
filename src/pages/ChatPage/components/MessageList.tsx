import type { RefObject, UIEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import { MessageBubble } from './MessageBubble';
// import { Spinner } from '@/shared/ui/Spinner';
import type { ChatMessage } from '@/types/entities/Chat';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: string;
  containerRef: RefObject<HTMLDivElement | null>;
  onScroll: UIEventHandler<HTMLDivElement>;
}

export const MessageList = ({
  messages,
  currentUserId,
  containerRef,
  onScroll,
}: MessageListProps) => {
  const { t } = useTranslation();

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="min-h-0 overflow-y-auto [overflow-anchor:none] px-4 sm:px-6 lg:px-8 xl:px-12 py-4 w-full mx-auto lg:max-w-6xl xl:max-w-7xl scrollbar-custom"
    >
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center py-20 text-center text-gray-400">
          <p className="text-sm">{t('chats.noMessages')}</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isFromMe={message.senderId === currentUserId}
          />
        ))
      )}
    </div>
  );
};
