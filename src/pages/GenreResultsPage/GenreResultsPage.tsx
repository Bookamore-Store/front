import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { IoLibraryOutline } from 'react-icons/io5';
import { useGetAllOffersWithBooksQuery } from '@app/store/api/OffersApi';
import { BookCard } from '@shared/ui/BookCard';
import { useGenres } from '@/shared/hooks/useGenres';
import { PageLayout } from '@/shared/ui/PageLayout/PageLayout';
import { Spinner } from '@/shared/ui/Spinner';
import { Button } from '@/shared/ui/Button/Button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { OfferWithBook } from '@/types/entities/OfferWithBook';

const PAGE_SIZE = 20;

const GenreResultsPage = () => {
  const { genre } = useParams<{ genre: string }>();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  return (
    <GenreResults
      key={`${genre ?? ''}:${query ?? ''}`}
      genre={genre}
      query={query}
    />
  );
};

const GenreResults = ({
  genre,
  query,
}: {
  genre?: string;
  query: string | null;
}) => {
  const { getGenreLabel } = useGenres();
  const genreLabel = genre ? getGenreLabel(genre) : '';
  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const [offers, setOffers] = useState<OfferWithBook[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const hasMoreRef = useRef(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const requestedPageRef = useRef(false);
  const loadedPageRef = useRef<number | null>(null);
  const loadedOfferIdsRef = useRef(new Set<string>());

  const {
    currentData: data,
    isFetching,
    error,
    refetch,
  } = useGetAllOffersWithBooksQuery({
    genre,
    page,
    size: PAGE_SIZE,
    sort:
      query === 'new' || query === 'recommended'
        ? 'createdDate,desc'
        : undefined,
  });

  useEffect(() => {
    if (!data) return;

    if (loadedPageRef.current === page) {
      setOffers((currentOffers) => {
        const dataMap = new Map(data.content.map((item) => [item.id, item]));
        return currentOffers.map((item) => dataMap.get(item.id) ?? item);
      });
      return;
    }

    if (page === 0) {
      loadedOfferIdsRef.current.clear();
    }

    const newOffers = data.content.filter(
      (offer) => !loadedOfferIdsRef.current.has(offer.id)
    );
    newOffers.forEach((offer) => loadedOfferIdsRef.current.add(offer.id));

    setOffers((currentOffers) => {
      if (page === 0) return data.content;

      return [...currentOffers, ...newOffers];
    });
    const nextHasMore =
      data.last !== undefined ? !data.last : data.content.length === PAGE_SIZE;
    hasMoreRef.current = nextHasMore;
    setHasMore(nextHasMore);
    loadedPageRef.current = page;
    requestedPageRef.current = false;
  }, [data, page]);

  const handleFavoriteToggle = (offerId: string, nextIsFavorite: boolean) => {
    setOffers((currentOffers) =>
      currentOffers.map((item) =>
        item.id === offerId
          ? {
              ...item,
              isFavorite: nextIsFavorite,
              favoritesCount:
                typeof item.favoritesCount === 'number'
                  ? nextIsFavorite
                    ? item.favoritesCount + 1
                    : Math.max(0, item.favoritesCount - 1)
                  : item.favoritesCount,
            }
          : item
      )
    );
  };

  useEffect(() => {
    if (error && !isFetching) {
      requestedPageRef.current = false;
    }
  }, [error, isFetching]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;

    if (
      !sentinel ||
      !data ||
      isFetching ||
      error ||
      !hasMore ||
      loadedPageRef.current !== page
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMoreRef.current &&
          !requestedPageRef.current
        ) {
          requestedPageRef.current = true;
          setPage((currentPage) => currentPage + 1);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [data, error, hasMore, isFetching, page]);

  const isInitializing = loadedPageRef.current === null && !error;

  // Error state
  if (error && offers.length === 0) {
    return (
      <PageLayout title={genreLabel}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2 text-sm sm:text-base">
              Error loading results
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Please try again later
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={query ? t(`categories.${query}`) : genreLabel}>
      <>
        {isInitializing ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <Spinner size="lg" />
          </div>
        ) : offers.length > 0 ? (
          <div className="flex flex-col items-center space-y-3 sm:space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:space-y-0">
            {offers.map((offer) => (
              <BookCard
                key={offer.id}
                offer={offer}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 lg:py-12">
            <div className="mb-4">
              <IoLibraryOutline className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-text-black mb-2">
              {t('errors.noBooks')}
            </h3>
            <p className="text-sm sm:text-base text-text-black mb-6 max-w-md mx-auto">
              {t('errors.noResults', { genreLabel })}
            </p>

            <Link to="/" className="w-full max-w-[343px] block mx-auto">
              <Button>{t('notFound.backToHome')}</Button>
            </Link>
          </div>
        )}

        <div ref={loadMoreRef} className="h-px" aria-hidden="true" />

        {isFetching &&
          offers.length > 0 &&
          loadedPageRef.current !== page && <Spinner size="lg" />}
        {error && offers.length > 0 && (
          <div className="text-center py-4">
            <p className="text-red-600 mb-2 text-sm sm:text-base">
              Error loading results
            </p>
            <Button onClick={() => void refetch()}>Retry</Button>
          </div>
        )}
      </>
    </PageLayout>
  );
};

export { GenreResultsPage };
