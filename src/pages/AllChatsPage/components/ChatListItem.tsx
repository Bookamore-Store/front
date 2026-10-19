import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

import { UserAvatar } from '@/shared/ui/UserAvatar/UserAvatar';
import type { Conversation } from '@/types/entities/Chat';

import { formatMessageTime } from '../helpers/formatMessageTime';
import noImages from '@/assest/images/noImage.jpg';

const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST || '';

interface ChatListItemProps {
  chat: Conversation;
}

export const ChatListItem = ({ chat }: ChatListItemProps) => {
  const { t } = useTranslation();
  const counterpartName = chat.counterpart?.name || t('chats.unknownUser');
  const book = chat.offer?.book;

  const imagePath = book?.image?.path;
  const imageSrc = imagePath ? `${IMAGE_HOST}${imagePath}` : null;

  const formattedTime = formatMessageTime(chat.lastMessageAt);

  return (
    <Link
      to={`/chats/${chat.id}`}
      aria-label={t('chats.openConversation', { name: counterpartName })}
      className="flex items-start border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-aquamarine-700"
    >
      <img
        src={imageSrc ? imageSrc : noImages}
        alt={book?.title || t('chats.book')}
        className="mr-3 h-16 w-11 shrink-0 object-cover rounded-[4px]"
      />

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-start justify-between">
          <div className="min-w-0 flex-1 border-b border-gray-200">
            <h3 className="mb-1 truncate text-h3m font-semibold text-text-black">
              {book?.title || t('chats.unknownBook')}
            </h3>

            <p className="pb-2 truncate text-h6m font-medium text-text-black">
              {book?.author || t('chats.unknownAuthor')}
            </p>
          </div>

          {formattedTime && (
            <time
              dateTime={chat.lastMessageAt ?? undefined}
              className="ml-2 shrink-0 text-xs text-gray-500"
            >
              {formattedTime}
            </time>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar
              name={counterpartName}
              avatarUrl={chat.counterpart?.avatarUrl}
              className="h-6 w-6"
            />

            <p className="truncate text-h6m text-text-black">
              {counterpartName}
            </p>
          </div>

          {chat.unreadCount > 0 && (
            <span
              aria-label={t('chats.unreadMessages', {
                count: chat.unreadCount,
              })}
              className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 px-1 text-xs font-bold text-white"
            >
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
