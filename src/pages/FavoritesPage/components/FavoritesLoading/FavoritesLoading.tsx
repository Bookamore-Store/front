import { PageLayout } from '@/shared/ui/PageLayout/PageLayout';
import { Spinner } from '@/shared/ui/Spinner';
import { useTranslation } from 'react-i18next';

export const FavoritesLoading = () => {
  const { t } = useTranslation();

  return (
    <PageLayout title={t('favorites.title')}>
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    </PageLayout>
  );
};
