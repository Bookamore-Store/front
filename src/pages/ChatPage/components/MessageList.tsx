import type { RefObject, UIEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import { parseServerDate } from '@/shared/helpers/parseServerDate';
import type { ChatMessage } from '@/types/entities/Chat';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: string;
  containerRef: RefObject<HTMLDivElement | null>;
  onScroll: UIEventHandler<HTMLDivElement>;
}

const getLocalDayKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const formatDayLabel = (
  date: Date,
  language: string,
  todayLabel: string,
  yesterdayLabel: string
): string => {
  const today = new Date();
  const yesterday = new Date(today);

  yesterday.setDate(today.getDate() - 1);

  const dayKey = getLocalDayKey(date);

  if (dayKey === getLocalDayKey(today)) {
    return todayLabel;
  }

  if (dayKey === getLocalDayKey(yesterday)) {
    return yesterdayLabel;
  }

  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  }).format(date);
};

export const MessageList = ({
  messages,
  currentUserId,
  containerRef,
  onScroll,
}: MessageListProps) => {
  const { t, i18n } = useTranslation();

  const language = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const todayLabel = t('chats.dateToday');
  const yesterdayLabel = t('chats.dateYesterday');

  let previousDayKey: string | null = null;

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="min-h-0 flex-1 px-4 overflow-y-auto [overflow-anchor:none] w-full mx-auto lg:max-w-6xl xl:max-w-7xl py-4 sm:px-6 lg:px-8 xl:px-12 scrollbar-custom"
    >
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center py-20 text-center text-gray-400">
          <p className="text-sm">{t('chats.noMessages')}</p>
        </div>
      ) : (
        messages.map((message) => {
          const date = parseServerDate(message.createdDate);
          const isValidDate = !Number.isNaN(date.getTime());

          const dayKey = isValidDate ? getLocalDayKey(date) : null;

          const showDateSeparator =
            dayKey !== null && dayKey !== previousDayKey;

          previousDayKey = dayKey;

          const dayLabel = showDateSeparator
            ? formatDayLabel(date, language, todayLabel, yesterdayLabel)
            : null;

          return (
            <div key={message.id}>
              {dayLabel && (
                <div
                  className="my-2.5 flex justify-center"
                  role="separator"
                  aria-label={dayLabel}
                >
                  {/* <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"> */}
                  <span className="text-gray-800 text-[12px] font-[350]">
                    {dayLabel}
                  </span>
                </div>
              )}

              <MessageBubble
                message={message}
                isFromMe={message.senderId === currentUserId}
              />
            </div>
          );
        })
      )}
    </div>
  );
};
