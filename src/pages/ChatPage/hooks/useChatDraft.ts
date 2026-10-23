import { useRef, useState } from 'react';
import { getChatDraft, saveChatDraft } from '@/shared/helpers/chatDraftStorage';

export const useChatDraft = (userId?: string, chatId?: string) => {
  const key = `${userId ?? ''}:${chatId ?? ''}`;
  const [state, setState] = useState(() => ({
    key,
    value: getChatDraft(userId, chatId),
  }));
  const revisions = useRef(new Map<string, number>());

  // The router may reuse ChatPage for a different conversation.
  const value = state.key === key ? state.value : getChatDraft(userId, chatId);
  const version = revisions.current.get(key) ?? 0;

  const updateDraft = (nextValue: string) => {
    if (!userId || !chatId) return;
    revisions.current.set(key, (revisions.current.get(key) ?? 0) + 1);
    saveChatDraft(userId, chatId, nextValue);
    setState({ key, value: nextValue });
  };

  const clearIfUnchanged = (sentChatId: string, sentVersion: number, sentText: string) => {
    if (!userId) return;
    const sentKey = `${userId}:${sentChatId}`;
    if ((revisions.current.get(sentKey) ?? 0) !== sentVersion) return;
    if (getChatDraft(userId, sentChatId).trim() !== sentText) return;
    saveChatDraft(userId, sentChatId, '');
    revisions.current.set(sentKey, sentVersion + 1);
    if (sentKey === key) setState({ key, value: '' });
  };

  return { value, version, updateDraft, clearIfUnchanged };
};
