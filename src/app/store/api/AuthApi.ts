import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User } from '../slices/authSlice';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  status: boolean;
  token?: string;
  error?: string;
}

interface SignUpResponse {
  email: string;
  message: string;
  status: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
}

export const AuthApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BASE_API_URL || '/api/v1'}/auth`,
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/signin',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<SignUpResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/signup',
        method: 'POST',
        body: userData,
      }),
    }),

    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (body) => ({
        url: '/forgot-password',
        method: 'POST',
        body,
        responseHandler: (response) =>
          response.text().then((text) => {
            if (!text) return null;
            try {
              return JSON.parse(text);
            } catch {
              return text;
            }
          }),
      }),
    }),

    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({
        url: '/reset-password',
        method: 'POST',
        body,
        responseHandler: (response) =>
          response.text().then((text) => {
            if (!text) return null;
            try {
              return JSON.parse(text);
            } catch {
              return text;
            }
          }),
      }),
    }),

    currentUser: builder.query<User, void>({
      query: () => ({
        url: '/current-user',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCurrentUserQuery,
} = AuthApi;
