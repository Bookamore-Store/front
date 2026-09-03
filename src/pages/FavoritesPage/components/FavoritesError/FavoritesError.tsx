import { PageLayout } from '@/shared/ui/PageLayout/PageLayout';
import { Button } from '@/shared/ui/Button/Button';
import { useTranslation } from 'react-i18next';

export const FavoritesError = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('favorites.title')}>
      <div className="flex flex-col items-center py-20 px-4 text-center">
        <p className="mb-2 font-medium text-red-600">
          Failed to load favorites
        </p>

        <p className="mb-6 text-sm text-gray-500">Please try again later</p>

        <Button onClick={onClick}>{t('favorites.browseBooks')}</Button>
      </div>
    </PageLayout>
  );
};
