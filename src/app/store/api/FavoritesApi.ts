import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { convertObjectToSearchParams } from '@app/store/helpers/convertToSearchParams.ts';
import type { ListResponse } from '@/types/entities/ListResponse';
import type { Offer } from '@/types/entities/Offer';
import type { QueryParams } from '@/types/entities/QueryParams';
import type { RootState } from '../store';
import { OffersApi } from './OffersApi';

export const FavoritesApi = createApi({
  reducerPath: 'favoritesApi',
  tagTypes: ['Favorite'],
  refetchOnMountOrArgChange: true,
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BASE_API_URL || '/api/v1'}/favorites`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (build) => ({
    getFavorites: build.query<ListResponse<Offer>, QueryParams | void>({
      query: (params) => {
        return params ? `?${convertObjectToSearchParams(params)}` : '';
      },
      providesTags: () => [{ type: 'Favorite', id: 'LIST' }],
    }),
    getFavoritesByUserId: build.query<
      ListResponse<Offer>,
      { userId: string; params?: QueryParams }
    >({
      query: ({ userId, params }) => {
        return `/${userId}${params ? `?${convertObjectToSearchParams(params)}` : ''}`;
      },
      providesTags: () => [{ type: 'Favorite', id: 'LIST' }],
    }),
    addToFavorites: build.mutation<void, string>({
      query: (offerId) => ({
        url: `/${offerId}`,
        method: 'POST',
      }),
      invalidatesTags: () => [{ type: 'Favorite', id: 'LIST' }],
      async onQueryStarted(offerId, { dispatch, queryFulfilled }) {
        const patchOfferWithBook = dispatch(
          OffersApi.util.updateQueryData(
            'getOfferWithBookById',
            offerId,
            (draft) => {
              draft.isFavorite = true;
              if (typeof draft.favoritesCount === 'number') {
                draft.favoritesCount += 1;
              }
            }
          )
        );
        const patchOffer = dispatch(
          OffersApi.util.updateQueryData('getOfferById', offerId, (draft) => {
            draft.isFavorite = true;
            if (typeof draft.favoritesCount === 'number') {
              draft.favoritesCount += 1;
            }
          })
        );
        try {
          await queryFulfilled;
          dispatch(
            OffersApi.util.invalidateTags([{ type: 'Offer', id: 'LIST' }])
          );
        } catch {
          patchOfferWithBook.undo();
          patchOffer.undo();
        }
      },
    }),
    removeFromFavorites: build.mutation<void, string>({
      query: (offerId) => ({
        url: `/${offerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: () => [{ type: 'Favorite', id: 'LIST' }],
      async onQueryStarted(offerId, { dispatch, queryFulfilled }) {
        const patchOfferWithBook = dispatch(
          OffersApi.util.updateQueryData(
            'getOfferWithBookById',
            offerId,
            (draft) => {
              draft.isFavorite = false;
              if (
                typeof draft.favoritesCount === 'number' &&
                draft.favoritesCount > 0
              ) {
                draft.favoritesCount -= 1;
              }
            }
          )
        );
        const patchOffer = dispatch(
          OffersApi.util.updateQueryData('getOfferById', offerId, (draft) => {
            draft.isFavorite = false;
            if (
              typeof draft.favoritesCount === 'number' &&
              draft.favoritesCount > 0
            ) {
              draft.favoritesCount -= 1;
            }
          })
        );
        try {
          await queryFulfilled;
          dispatch(
            OffersApi.util.invalidateTags([{ type: 'Offer', id: 'LIST' }])
          );
        } catch {
          patchOfferWithBook.undo();
          patchOffer.undo();
        }
      },
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useLazyGetFavoritesQuery,
  useGetFavoritesByUserIdQuery,
  useLazyGetFavoritesByUserIdQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} = FavoritesApi;
