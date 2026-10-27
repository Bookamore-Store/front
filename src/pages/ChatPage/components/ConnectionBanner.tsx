import { useTranslation } from 'react-i18next';

interface ConnectionBannerProps {
  isOnline: boolean;
  isMessagesError: boolean;
  hasMessagesData: boolean;
}

export const ConnectionBanner = ({
  isOnline,
  isMessagesError,
  hasMessagesData,
}: ConnectionBannerProps) => {
  const { t } = useTranslation();

  if ((!isMessagesError && isOnline) || !hasMessagesData) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 opacity-90"
    >
      {!isOnline ? t('chats.offlineBanner') : t('chats.updateMessagesError')}
    </div>
  );
};
