import { BottomNav } from '@/shared/ui/BottomNav';
import { Header } from '@/shared/ui/Header';
import { Categories } from '@/shared/ui/Categories';
import { BookSection } from '@/shared/ui/BookSection';
import { useGetAllOffersWithBooksQuery } from '@/app/store/api/OffersApi.ts';
import { useTranslation } from 'react-i18next';
import { useGenres } from '@/shared/hooks/useGenres';

// Size of items per section slider
const SECTION_SIZE = 50;

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { genres } = useGenres();
  const scienceFictionId = genres.find((genre) => genre.id === 'science_fiction')?.id
    ?? genres.find((genre) => /^(science fiction|sci[ -]?fi)$/i.test(genre.en.trim()))?.id;
  const sciFiQuery = useGetAllOffersWithBooksQuery(
    { genre: scienceFictionId, size: SECTION_SIZE },
    { skip: !scienceFictionId }
  );
  const bookSections = [
    {
      title: t('categories.new'),
      destination: '/search?condition=new',
      queryResult: useGetAllOffersWithBooksQuery({
        page: 0,
        size: SECTION_SIZE,
        sort: 'createdDate,desc',
      }),
    },
    {
      title: t('categories.recommended'),
      destination: '/search?q=recommended',
      queryResult: useGetAllOffersWithBooksQuery({
        search: 'recommended',
        size: SECTION_SIZE,
      }),
    },
    {
      title: t('categories.sci-fi'),
      destination: `/genres/${scienceFictionId}`,
      queryResult: sciFiQuery,
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="w-full mx-auto lg:max-w-6xl xl:max-w-7xl">
        <Header />
        <Categories />

        {/* Book sections */}
        <div className="space-y-2 sm:space-y-4 lg:space-y-6">
          {bookSections.filter((section) => section !== bookSections[2] || scienceFictionId).map((section) => (
            <BookSection
              key={section.title}
              title={section.title}
              viewAllDestination={section.destination}
              offers={section.queryResult.data?.content ?? []}
              isLoading={section.queryResult.isLoading}
              error={section.queryResult.error}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export { HomePage };
