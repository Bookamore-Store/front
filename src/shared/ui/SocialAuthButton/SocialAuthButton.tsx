import React from 'react';
import { useTranslation } from 'react-i18next';
import { FcGoogle } from 'react-icons/fc';

type SocialProvider = 'google';

interface SocialAuthButtonProps {
  provider: SocialProvider;
  url: string;
}

const providerConfig = {
  google: {
    icon: <FcGoogle className="h-5 w-5" />,
    label: 'Google',
  },
};

const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  provider,
  url,
}) => {
  const { t } = useTranslation();
  const config = providerConfig[provider];

  return (
    <a
      href={url}
      rel="noopener noreferrer"
      className="mb-4 flex w-full items-center rounded-full border border-[#747775] p-2.5 text-sm font-medium text-[#1F1F1F] hover:bg-gray-50"
    >
      <span className="mr-2 flex items-center">{config.icon}</span>
      {t('auth.continueWith')} {config.label}
    </a>
  );
};

export { SocialAuthButton };
