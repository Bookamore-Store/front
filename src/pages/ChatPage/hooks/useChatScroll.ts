import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

interface UseChatScrollParams {
  chatId?: string;
  firstMessageId?: string;
  lastMessageId?: string;
  lastMessageSenderId?: string;
  currentUserId?: string;
  hasMessagesData: boolean;
}

interface ScrollSnapshot {
  firstMessageId?: string;
  anchor: HTMLElement | null;
  anchorTop: number;
  childCount: number;
  scrollHeight: number;
  scrollTop: number;
}

export const useChatScroll = ({
  chatId,
  firstMessageId,
  lastMessageId,
  lastMessageSenderId,
  currentUserId,
  hasMessagesData,
}: UseChatScrollParams) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const isNearBottomRef = useRef(true);
  const lastMessageKeyRef = useRef<string | null>(null);
  const initializedChatRef = useRef<string | null>(null);
  const scrollSnapshotRef = useRef<ScrollSnapshot | null>(null);

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    isNearBottomRef.current = distanceFromBottom < 200;
  }, []);

  const saveScrollPosition = useCallback(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const containerTop =
      container.getBoundingClientRect().top + container.clientTop;
    const anchor =
      Array.from(container.children).find((child): child is HTMLElement => {
        if (!(child instanceof HTMLElement)) return false;

        const { top, bottom } = child.getBoundingClientRect();
        return (
          bottom > containerTop && top < containerTop + container.clientHeight
        );
      }) ?? null;

    scrollSnapshotRef.current = {
      firstMessageId,
      anchor,
      anchorTop: anchor ? anchor.getBoundingClientRect().top - containerTop : 0,
      childCount: container.children.length,
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
    };
  }, [firstMessageId]);

  useEffect(() => {
    scrollSnapshotRef.current = null;
  }, [chatId]);

  useLayoutEffect(() => {
    if (!chatId || !hasMessagesData) return;

    const container = messagesContainerRef.current;

    if (!container) return;

    const lastMessageKey = lastMessageId
      ? `${chatId}:${lastMessageId}`
      : `${chatId}:empty`;

    if (scrollSnapshotRef.current) {
      const snapshot = scrollSnapshotRef.current;

      if (
        !firstMessageId ||
        firstMessageId === snapshot.firstMessageId ||
        container.children.length <= snapshot.childCount
      ) {
        lastMessageKeyRef.current = lastMessageKey;
        return;
      }

      if (snapshot.anchor && container.contains(snapshot.anchor)) {
        const containerTop =
          container.getBoundingClientRect().top + container.clientTop;
        const topDifference =
          snapshot.anchor.getBoundingClientRect().top -
          containerTop -
          snapshot.anchorTop;
        container.scrollTop += topDifference;
      } else {
        const heightDifference = container.scrollHeight - snapshot.scrollHeight;
        container.scrollTop = snapshot.scrollTop + heightDifference;
      }

      scrollSnapshotRef.current = null;
      lastMessageKeyRef.current = lastMessageKey;

      return;
    }

    if (initializedChatRef.current !== chatId) {
      initializedChatRef.current = chatId;
      lastMessageKeyRef.current = lastMessageKey;
      isNearBottomRef.current = true;

      container.scrollTop = container.scrollHeight;

      return;
    }

    if (lastMessageKeyRef.current === lastMessageKey) {
      return;
    }

    lastMessageKeyRef.current = lastMessageKey;

    const isMyMessage =
      Boolean(lastMessageId) && lastMessageSenderId === currentUserId;

    if (isMyMessage || isNearBottomRef.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [
    chatId,
    firstMessageId,
    lastMessageId,
    lastMessageSenderId,
    currentUserId,
    hasMessagesData,
  ]);

  return {
    messagesContainerRef,
    handleMessagesScroll,
    saveScrollPosition,
  };
};
