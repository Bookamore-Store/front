import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectUser } from '@/app/store/slices/authSlice';

import { BottomNav } from '@/shared/ui/BottomNav';
import HeaderTitle from '@/shared/ui/HeaderTitle';

import { useGetConversationsQuery } from '@/app/store/api/ChatsApi';
import type { Conversation } from '@/types/entities/Chat';

import { ChatsList } from './components/ChatsList';
import { TabSwitcher } from './components/TabSwitcher';
import { filterAndSortChats } from './helpers/filterAndSortChats';
import type { ChatTab } from './types';

const AllChatsPage = () => {
  const { t } = useTranslation();
  const currentUser = useSelector(selectUser);

  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab: ChatTab =
    searchParams.get('tab') === 'buying' ? 'buying' : 'selling';

  const { data, isLoading, isError, refetch } = useGetConversationsQuery(
    undefined,
    {
      pollingInterval: 15000,
      skipPollingIfUnfocused: true,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const chats: Conversation[] = Array.isArray(data)
    ? data
    : (data?.content ?? []);

  const filteredChats = filterAndSortChats(chats, activeTab);

  const handleTabChange = (tab: ChatTab) => {
    if (tab === activeTab) return;

    setSearchParams(
      (params) => {
        const nextParams = new URLSearchParams(params);
        nextParams.set('tab', tab);

        return nextParams;
      },
      { replace: true }
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderTitle title={t('chats.title')} />

      <div className="mx-auto w-full max-w-md lg:max-w-4xl xl:max-w-6xl">
        <div className="pt-4">
          <TabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div className="pb-24">
          <ChatsList
            chats={filteredChats}
            userId={currentUser?.id}
            activeTab={activeTab}
            isLoading={isLoading && !data}
            isError={isError && !data}
            onRetry={() => void refetch()}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export { AllChatsPage };
