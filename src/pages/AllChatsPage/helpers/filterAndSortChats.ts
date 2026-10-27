import type { Conversation } from '@/types/entities/Chat';
import { parseServerDate } from '@/shared/helpers/parseServerDate';

import type { ChatTab } from '../types';

const getMessageTimestamp = (dateStr?: string | null): number => {
  if (!dateStr) return 0;

  const timestamp = parseServerDate(dateStr).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const filterAndSortChats = (
  chats: Conversation[],
  activeTab: ChatTab
): Conversation[] => {
  return chats
    .filter((chat) => {
      const role = chat.counterpart?.role?.toUpperCase();

      // BUYER -> мы продаём
      // SELLER -> мы покупаем
      return activeTab === 'selling' ? role === 'BUYER' : role === 'SELLER';
    })
    .sort(
      (a, b) =>
        getMessageTimestamp(b.lastMessageAt) -
        getMessageTimestamp(a.lastMessageAt)
    );
};
