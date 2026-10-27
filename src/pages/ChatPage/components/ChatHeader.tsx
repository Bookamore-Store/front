import { useTranslation } from 'react-i18next';
import BackButton from '@/shared/ui/BackButton';
import { UserAvatar } from '@/shared/ui/UserAvatar/UserAvatar';

import type { Conversation } from '@/types/entities/Chat';

import noImages from '@/assest/images/noImage.jpg';

const IMAGE_HOST = import.meta.env.VITE_IMAGE_HOST || '';

interface ChatHeaderProps {
  conversation?: Conversation;
}

export const ChatHeader = ({ conversation }: ChatHeaderProps) => {
  const { t } = useTranslation();
  const { counterpart, offer } = conversation ?? {};

  const counterpartName = counterpart?.name || t('chats.chat');
  const imagePath = offer?.book?.image?.path;
  const imageSrc = imagePath ? `${IMAGE_HOST}${imagePath}` : noImages;

  return (
    <header className="border-b border-gray-200 bg-white shadow-xs">
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-3 sm:px-6 lg:max-w-6xl lg:px-8 xl:max-w-7xl xl:px-12">
        <BackButton className="absolute left-4 sm:left-6 lg:left-8 xl:left-12" />

        <div className="ml-2 flex min-w-0 items-center overflow-hidden">
          <UserAvatar
            name={counterpartName}
            avatarUrl={counterpart?.avatarUrl}
            className="mr-3 h-6 w-6 shrink-0"
          />

          <h1 className="min-w-0 truncate text-h1m font-[350] text-text-black">
            {counterpartName}
          </h1>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-sand-50 py-3">
        <div className="mx-auto flex w-full max-w-[550px] items-center gap-3 px-4">
          <img
            src={imageSrc}
            alt={offer?.book?.title || ''}
            className="h-16 w-11 shrink-0 object-cover rounded-[4px]"
          />

          <div className="flex w-full min-w-0 items-baseline justify-between text-text-black">
            <div className="mr-2 min-w-0 flex-1">
              {offer?.book?.title && (
                <p className="truncate text-h3m">{offer.book.title}</p>
              )}

              {offer?.book?.author && (
                <p className="truncate text-h6m">{offer.book.author}</p>
              )}
            </div>

            {offer?.price != null && (
              <p className="shrink-0 text-h5m">{offer.price} UAH</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
