import { setLanguageHeader } from '@/shared/helpers/setLanguageHeader';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Genre {
  id: string;
  en: string;
  uk: string;
}

export const GenresApi = createApi({
  reducerPath: 'genresApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_API_URL || '/api/v1',
    prepareHeaders: (headers) => setLanguageHeader(headers),
  }),
  endpoints: (build) => ({
    getGenres: build.query<Genre[], void>({
      query: () => '/genres/all',
    }),
  }),
});

export const { useGetGenresQuery } = GenresApi;
