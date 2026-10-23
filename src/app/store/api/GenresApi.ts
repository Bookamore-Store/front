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
  }),
  endpoints: (build) => ({
    getGenres: build.query<Genre[], void>({
      query: () => '/genres/all',
    }),
  }),
});

export const { useGetGenresQuery } = GenresApi;
