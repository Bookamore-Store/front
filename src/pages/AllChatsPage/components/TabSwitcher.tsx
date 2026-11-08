import { useTranslation } from 'react-i18next';

import type { ChatTab } from '../types';

interface TabSwitcherProps {
  activeTab: ChatTab;
  unreadCounts: Record<ChatTab, number>;
  onTabChange: (tab: ChatTab) => void;
}

export const TabSwitcher = ({
  activeTab,
  unreadCounts,
  onTabChange,
}: TabSwitcherProps) => {
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
          aria-label={
            unreadCounts[tab.id] > 0
              ? `${tab.label}, ${t('chats.unreadMessages', {
                  count: unreadCounts[tab.id],
                })}`
              : undefined
          }
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-1 text-h4m border-b-1 transition-colors focus-visible:outline-2 focus-visible:outline-aquamarine-700 ${
            activeTab === tab.id
              ? 'bg-white text-text-black border-text-black'
              : 'text-gray-800 border-gray-400 hover:border-gray-700 cursor-pointer'
          }`}
        >
          {tab.label}
          {unreadCounts[tab.id] > 0 && (
            <span
              aria-hidden="true"
              className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
            >
              {unreadCounts[tab.id] > 99 ? '99+' : unreadCounts[tab.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
