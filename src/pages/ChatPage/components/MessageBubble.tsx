import { CheckSvg } from '@/shared/ui/icons/CheckSvg';
import { CheckDoubleSvg } from '@/shared/ui/icons/CheckDoubleSvg';
import { UserAvatar } from '@/shared/ui/UserAvatar/UserAvatar';

import { parseServerDate } from '@/shared/helpers/parseServerDate';

import type { ChatMessage } from '@/types/entities/Chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isFromMe: boolean;
  counterpartName: string;
  counterpartAvatarUrl?: string | null;
}

export const MessageBubble = ({
  message,
  isFromMe,
  counterpartName,
  counterpartAvatarUrl,
}: MessageBubbleProps) => {
  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';

    const date = parseServerDate(dateStr);

    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className={`mb-3 flex items-end gap-2 ${isFromMe ? 'justify-end' : 'justify-start'}`}>
      {!isFromMe && (
        <UserAvatar
          name={counterpartName}
          avatarUrl={counterpartAvatarUrl}
          className="h-10 w-10"
        />
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 lg:max-w-md text-paragraphm text-text-black ${
          isFromMe ? 'bg-aquamarine-300' : 'bg-grass-100'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </p>

        <div className="flex items-center justify-end space-x-1 text-[10px]">
          <span>{formatTime(message.createdDate)}</span>

          {isFromMe && (
            <span
              className={`font-semibold ${
                message.isRead ? 'text-text-black' : 'text-text-black/70'
              }`}
            >
              {message.isRead ? (
                <CheckDoubleSvg className="h-3 w-3" />
              ) : (
                <CheckSvg className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
