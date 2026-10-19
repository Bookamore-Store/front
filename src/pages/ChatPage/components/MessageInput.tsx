import type { ChangeEvent, KeyboardEvent, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { PaperPlane } from '@/shared/ui/icons/PaperPlane';

interface MessageInputProps {
  value: string;
  isSending: boolean;
  isOnline: boolean;
  error: string | null;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
}

export const MessageInput = ({
  value,
  isSending,
  isOnline,
  error,
  textareaRef,
  onChange,
  onKeyDown,
  onSend,
}: MessageInputProps) => {
  const { t } = useTranslation();
  const canSend = Boolean(value.trim()) && !isSending && isOnline;

  return (
    <div className="flex-shrink-0 border-t border-gray-200 bg-deep-blue-100 p-3 sm:p-4">
      <div className="mx-auto flex max-w-4xl items-center space-x-2 sm:space-x-3">
        <div className="relative min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={t('chats.typeMessage')}
            aria-label={t('chats.message')}
            rows={1}
            className="scrollbar-custom w-full resize-none rounded-[12px] border border-gray-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-aquamarine-500 disabled:bg-gray-50"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
        </div>

        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          aria-label={t('chats.sendMessage')}
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
            canSend
              ? 'cursor-pointer bg-deep-blue-800 text-white hover:bg-deep-blue-950'
              : 'cursor-not-allowed text-gray-800'
          }`}
        >
          <PaperPlane className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <p role="alert" className="mx-auto mt-2 max-w-4xl text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};
