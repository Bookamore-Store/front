import { useTranslation } from 'react-i18next';

interface ChatErrorProps {
  type: 'not-found' | 'offline' | 'error';
  onRetry: () => void;
  onBack: () => void;
}

export const ChatError = ({ type, onRetry, onBack }: ChatErrorProps) => {
  const { t } = useTranslation();

  const content = {
    'not-found': {
      title: t('chats.chatNotFound'),
      description: t('chats.conversationUnavailable'),
      button: t('chats.goBackToChats'),
    },
    offline: {
      title: t('chats.offlineTitle'),
      description: t('chats.checkConnection'),
      button: t('chats.tryAgain'),
    },
    error: {
      title: t('chats.unableToLoadMessages'),
      description: t('chats.unableToLoadMessagesDescription'),
      button: t('chats.tryAgain'),
    },
  }[type];

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <span className="text-2xl">💬</span>
        </div>

        <h3 className="mb-2 text-lg font-medium text-gray-900">
          {content.title}
        </h3>

        <p className="mb-4 text-sm text-gray-500">{content.description}</p>

        <button
          type="button"
          onClick={type === 'not-found' ? onBack : onRetry}
          disabled={type === 'offline'}
          className="font-medium text-aquamarine-700 hover:text-aquamarine-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {content.button}
        </button>
      </div>
    </div>
  );
};
