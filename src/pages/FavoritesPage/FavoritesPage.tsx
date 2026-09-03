import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { PageLayout } from '@/shared/ui/PageLayout/PageLayout';
import { FavoritesLoading } from './components/FavoritesLoading/FavoritesLoading';
import { FavoritesError } from './components/FavoritesError/FavoritesError';
import { FavoritesEmpty } from './components/FavoritesEmpty/FavoritesEmpty';

import {
  useGetFavoritesQuery,
  useRemoveFromFavoritesMutation,
} from '@/app/store/api/FavoritesApi';

import { FavoriteCard } from './components/FavoriteCard/FavoriteCard';

const FavoritesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetFavoritesQuery();
  const [removeFromFavorites] = useRemoveFromFavoritesMutation();

  const favorites = data?.content ?? [];
  const totalValue = favorites.reduce(
    (sum, item) => sum + (item.price ?? 0),
    0
  );

  const handleRemoveFromFavorites = async (offerId: string) => {
    try {
      await removeFromFavorites(offerId).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <FavoritesLoading />;

  if (isError) return <FavoritesError onClick={() => navigate('/')} />;

  if (!favorites.length)
    return <FavoritesEmpty onClick={() => navigate('/')} />;

  return (
    <PageLayout title={t('favorites.title')}>
      <div className="max-w-[482px] lg:max-w-full mx-auto mb-5 px-2.5 pt-2.5 text-[16px] text-text-black">
        <p>{t('favorites.itemsNumber', { count: favorites.length })}</p>

        <p>
          {t('favorites.total')}
          <span className="font-medium"> {totalValue} UAH</span>
        </p>
      </div>

      <div className="grid grid-cols-1 max-w-[482px] mx-auto lg:max-w-full lg:grid-cols-2  gap-5">
        {favorites.map((item) => (
          <FavoriteCard
            key={item.id}
            offer={item}
            onRemove={handleRemoveFromFavorites}
          />
        ))}
      </div>
    </PageLayout>
  );
};

export { FavoritesPage };
