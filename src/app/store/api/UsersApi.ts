import { setLanguageHeader } from '@/shared/helpers/setLanguageHeader';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { CurrentUser } from '../slices/authSlice';

export const UsersApi = createApi({
  reducerPath: 'userApi',
  tagTypes: ['CurrentUser'],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BASE_API_URL || '/api/v1'}/user`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.token;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return setLanguageHeader(headers);
    },
  }),
  endpoints: (build) => ({
    getCurrentUser: build.query<CurrentUser, void>({
      query: () => '/current-user',
      providesTags: ['CurrentUser'],
    }),
    updateProfile: build.mutation<CurrentUser, { name: string }>({
      query: (body) => ({
        url: '/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['CurrentUser'],
    }),
    changePassword: build.mutation<
      void,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/password',
        method: 'PATCH',
        body,
      }),
    }),
    getUserByUuid: build.query<CurrentUser, string>({
      query: (uuid) => `/${uuid}`,
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetUserByUuidQuery,
} = UsersApi;
