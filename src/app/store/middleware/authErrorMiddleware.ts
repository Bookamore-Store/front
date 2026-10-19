import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';

import type { RootState } from '../store';
import { clearAuth } from '../slices/authSlice';
import { AuthApi } from '../api/AuthApi';

function isApiError(
  error: unknown
): error is { status: number; data?: unknown } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
  );
}

export const authErrorMiddleware: Middleware =
  (store) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      const error = action.payload;

      if (isApiError(error) && error.status === 401) {
        const state = store.getState() as RootState;

        const hasToken = Boolean(state.auth.token);

        const isPublicAuthRequest =
          AuthApi.endpoints.login.matchRejected(action) ||
          AuthApi.endpoints.register.matchRejected(action) ||
          AuthApi.endpoints.forgotPassword.matchRejected(action) ||
          AuthApi.endpoints.resetPassword.matchRejected(action);

        if (hasToken && !isPublicAuthRequest) {
          store.dispatch(clearAuth());
        }
      }
    }

    return next(action);
  };
