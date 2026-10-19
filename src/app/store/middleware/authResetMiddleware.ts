
import type { Middleware } from '@reduxjs/toolkit';

import { logout, clearAuth, setCredentials } from '../slices/authSlice';

import { FavoritesApi } from '../api/FavoritesApi';
import { OffersApi } from '../api/OffersApi';
import { BooksApi } from '../api/BooksApi';
import { ImagesApi } from '../api/ImagesApi';
import { UsersApi } from '../api/UsersApi';
import { AuthApi } from '../api/AuthApi';
import { ChatsApi } from '../api/ChatsApi';

export const authResetMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    const shouldReset =
      logout.match(action) ||
      clearAuth.match(action) ||
      setCredentials.match(action);

    if (shouldReset) {
      store.dispatch(FavoritesApi.util.resetApiState());
      store.dispatch(OffersApi.util.resetApiState());
      store.dispatch(BooksApi.util.resetApiState());
      store.dispatch(ImagesApi.util.resetApiState());
      store.dispatch(UsersApi.util.resetApiState());
      store.dispatch(AuthApi.util.resetApiState());
      store.dispatch(ChatsApi.util.resetApiState());
    }

    return result;
  };
