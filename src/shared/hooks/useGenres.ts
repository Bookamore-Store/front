import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetGenresQuery } from '@/app/store/api/GenresApi';

export const useGenres = () => {
  const { i18n } = useTranslation();
  const query = useGetGenresQuery();
  const language = i18n.resolvedLanguage === 'uk' ? 'uk' : 'en';
  const genres = query.data;

  const options = useMemo(
    () => (genres ?? []).map((genre) => ({
      value: genre.id,
      label: genre[language] || genre.en || genre.id,
    })),
    [genres, language]
  );

  const labelById = useMemo(
    () => new Map(options.map(({ value, label }) => [value, label])),
    [options]
  );

  const getGenreLabel = useCallback(
    (id: string) => labelById.get(id) ?? id,
    [labelById]
  );

  return { ...query, genres: genres ?? [], options, getGenreLabel };
};
