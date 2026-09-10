import { PageLayout } from '@/shared/ui/PageLayout/PageLayout';
import { Button } from '@/shared/ui/Button/Button';
import { useTranslation } from 'react-i18next';

export const FavoritesEmpty = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('favorites.title')}>
      <div className="flex flex-col items-center py-20 px-4">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
          <span className="text-3xl">💔</span>
        </div>

        <h2 className="mb-2 text-xl font-semibold text-text-black">
          {t('favorites.emptyTitle')}
        </h2>

        <p className="mb-6 text-center text-text-black">
          {t('favorites.emptySubtitle')}
        </p>

        <Button onClick={onClick}>{t('favorites.browseBooks')}</Button>
      </div>
    </PageLayout>
  );
};
