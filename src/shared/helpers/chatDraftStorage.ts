const PREFIX = 'bookamore:chat-draft';

const draftKey = (userId: string, chatId: string) =>
  `${PREFIX}:${encodeURIComponent(userId)}:${encodeURIComponent(chatId)}`;

export const getChatDraft = (userId?: string, chatId?: string): string => {
  if (!userId || !chatId) return '';
  try {
    return localStorage.getItem(draftKey(userId, chatId)) ?? '';
  } catch {
    return '';
  }
};

export const saveChatDraft = (
  userId: string,
  chatId: string,
  value: string
): void => {
  try {
    const key = draftKey(userId, chatId);
    if (value.trim()) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable (private browsing / quota exceeded).
  }
};
