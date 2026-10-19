import { useTranslation } from 'react-i18next';

import type { ChatTab } from '../types';

interface TabSwitcherProps {
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
}

export const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  const { t } = useTranslation();

  const tabs: { id: ChatTab; label: string }[] = [
    {
      id: 'selling',
      label: t('chats.mySellings'),
    },
    {
      id: 'buying',
      label: t('chats.myPurchases'),
    },
  ];

  return (
    <div
      role="group"
      aria-label={t('chats.conversationCategory')}
      className="mx-4 mb-4 flex"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-pressed={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-4 py-1 text-h4m border-b-1 transition-colors focus-visible:outline-2 focus-visible:outline-aquamarine-700 ${
            activeTab === tab.id
              ? 'bg-white text-text-black border-text-black'
              : 'text-gray-800 border-gray-400 hover:border-gray-700 cursor-pointer'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
