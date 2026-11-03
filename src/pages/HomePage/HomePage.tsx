import { BottomNav } from '@/shared/ui/BottomNav';
import { Header } from '@/shared/ui/Header';
import { Categories } from '@/shared/ui/Categories';
import { BookSection } from '@/shared/ui/BookSection';
import { useGetAllOffersWithBooksQuery } from '@/app/store/api/OffersApi';
import { useTranslation } from 'react-i18next';
import { useGenres } from '@/shared/hooks/useGenres';
import type { Genre } from '@/app/store/api/GenresApi';

type OffersQueryParams = NonNullable<
  Parameters<typeof useGetAllOffersWithBooksQuery>[0]
>;

const SECTION_SIZE = 20;

interface GenreBookSectionProps {
  genre: Genre;
  title: string;
}

const GenreBookSection: React.FC<GenreBookSectionProps> = ({
  genre,
  title,
}) => {
  const { data, isLoading, error } = useGetAllOffersWithBooksQuery({
    genre: genre.id,
    size: SECTION_SIZE,
  });

  const offers = data?.content ?? [];
  const hasOpenOffers = offers.some((offer) => offer.status === 'OPEN');

  if (isLoading || (!error && !hasOpenOffers)) {
    return null;
  }

  return (
    <BookSection
      title={title}
      viewAllDestination={`/genres/${genre.id}`}
      offers={offers}
      isLoading={isLoading}
      error={error}
    />
  );
};

interface HomeBookSectionProps {
  title: string;
  destination: string;
  query: OffersQueryParams;
}

const HomeBookSection: React.FC<HomeBookSectionProps> = ({
  title,
  destination,
  query,
}) => {
  const { data, isLoading, error } = useGetAllOffersWithBooksQuery(query);

  return (
    <BookSection
      title={title}
      viewAllDestination={destination}
      offers={data?.content ?? []}
      isLoading={isLoading}
      error={error}
    />
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { genres, getGenreLabel } = useGenres();

  const bookSections = [
    {
      title: t('categories.new'),
      destination: '/genres?q=new',
      query: {
        page: 0,
        size: SECTION_SIZE,
        sort: 'createdDate,desc' as const,
      },
    },
    {
      title: t('categories.recommended'),
      destination: '/genres?q=recommended',
      query: {
        page: 0,
        size: SECTION_SIZE,
        sort: 'createdDate,desc' as const,
      },
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="w-full mx-auto lg:max-w-6xl xl:max-w-7xl">
        <Header />
        <Categories />

        <div className="space-y-2 sm:space-y-4 lg:space-y-6">
          {bookSections.map(({ title, destination, query }) => (
            <HomeBookSection
              key={title}
              title={title}
              destination={destination}
              query={query}
            />
          ))}

          {genres.map((genre) => (
            <GenreBookSection
              key={genre.id}
              genre={genre}
              title={getGenreLabel(genre.id)}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export { HomePage };
