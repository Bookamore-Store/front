import { useSearchParams, useNavigate } from 'react-router';
import { IoSearchOutline } from 'react-icons/io5';
import { useGetAllOffersWithBooksQuery } from '../../app/store/api/OffersApi';
import { BookCard } from '../../shared/ui/BookCard';
import { BottomNav } from '../../shared/ui/BottomNav';
import type { QueryParams } from '../../types/entities/QueryParams';
import { Header } from '@/shared/ui/Header';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button/Button';

export function SearchResultsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get all filter parameters from URL
  const searchQuery = searchParams.get('q') || '';
  const currentCondition = searchParams.get('condition') as
    | 'new'
    | 'used'
    | null;
  const sort = searchParams.get('sort');
  const categories = searchParams.get('categories');

  const sharedQueryParams: QueryParams = {
    condition:
      currentCondition === 'new'
        ? 'NEW'
        : currentCondition === 'used'
          ? 'USED'
          : undefined,
    genre: categories ? categories.split(',') : undefined,
    page: 0,
    size: 20,
    sort:
      sort === 'lowest-price'
        ? 'price,asc'
        : sort === 'highest-price'
          ? 'price,desc'
          : undefined,
  };

  const titleResult = useGetAllOffersWithBooksQuery({
    ...sharedQueryParams,
    title: searchQuery.trim() || undefined,
  });
  const authorResult = useGetAllOffersWithBooksQuery(
    {
      ...sharedQueryParams,
      author: searchQuery.trim() ? [searchQuery.trim()] : undefined,
    },
    { skip: !searchQuery.trim() }
  );

  const isLoading = titleResult.isLoading || authorResult.isLoading;
  const error = titleResult.error || authorResult.error;

  const handleBack = () => {
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('search.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-2">{t('search.loadFailed')}</p>
              <p className="text-gray-500 text-sm">
                {t('search.tryAgainLater')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const offers = [
    ...new Map(
      [
        ...(titleResult.data?.content ?? []),
        ...(authorResult.data?.content ?? []),
      ].map((offer) => [offer.id, offer])
    ).values(),
  ];

  if (sort === 'lowest-price') {
    offers.sort((a, b) => a.price - b.price);
  } else if (sort === 'highest-price') {
    offers.sort((a, b) => b.price - a.price);
  }

  const getDisplayTitle = (query: string) => {
    switch (query) {
      case 'recommended':
        return t('search.recommendedBooks');
      default:
        return t('search.resultsFor', { query });
    }
  };

  return (
    <div className="w-full mx-auto lg:max-w-6xl xl:max-w-7xl">
      {/* Header with search bar */}
      <Header />

      <div className="px-4 sm:px-6 lg:px-8 xl:px-12 pb-[80px]">
        {/* Results info and active filters */}

        {searchQuery && (
          <h2 className="text-base sm:text-lg lg:text-xl font-bold py-3 text-text-black">
            {getDisplayTitle(searchQuery)}
          </h2>
        )}

        {/* Books list - responsive grid layout */}
        <>
          {offers.length > 0 ? (
            <div className="flex flex-col items-center space-y-3 sm:space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:space-y-0">
              {offers.map((offer) => (
                <BookCard key={offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <IoSearchOutline className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 mb-2">
                {t('search.noBooksFound')}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery
                  ? t('search.noResultsForQuery', { query: searchQuery })
                  : t('search.prompt')}
              </p>
              <Button onClick={handleBack}>{t('search.goBack')}</Button>
            </div>
          )}
        </>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
