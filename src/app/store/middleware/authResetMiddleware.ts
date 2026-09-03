import type { Middleware } from '@reduxjs/toolkit';
import { logout, clearAuth, setCredentials } from '../slices/authSlice';
import { FavoritesApi } from '../api/FavoritesApi';
import { OffersApi } from '../api/OffersApi';
import { UsersApi } from '../api/UsersApi';
import { AuthApi } from '../api/AuthApi';

/**
 * Middleware для очищення кэшу RTK Query при зміні авторизації (вхід, вихід, 401).
 * Це гарантує, що дані одного користувача (наприклад, Favorites або профіль)
 * не будуть відображатися для іншого без перезавантаження сторінки.
 */
export const authResetMiddleware: Middleware =
  (store) => (next) => (action) => {
    const result = next(action);

    if (
      logout.match(action) ||
      clearAuth.match(action) ||
      setCredentials.match(action)
    ) {
      store.dispatch(FavoritesApi.util.resetApiState());
      store.dispatch(OffersApi.util.resetApiState());
      store.dispatch(UsersApi.util.resetApiState());
      store.dispatch(AuthApi.util.resetApiState());
    }

    return result;
  };
