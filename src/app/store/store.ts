import { setupListeners } from '@reduxjs/toolkit/query';
import { configureStore } from '@reduxjs/toolkit';
import { OffersApi } from '@app/store/api/OffersApi.ts';
import { BooksApi } from '@app/store/api/BooksApi.ts';
import { GenresApi } from '@app/store/api/GenresApi.ts';
import { AuthApi } from '@app/store/api/AuthApi.ts';
import { ImagesApi } from '@app/store/api/ImagesApi.ts';
import { FavoritesApi } from '@app/store/api/FavoritesApi.ts';
import { ChatsApi } from '@app/store/api/ChatsApi.ts';
import authReducer from '@app/store/slices/authSlice.ts';
import { authErrorMiddleware } from './middleware/authErrorMiddleware.ts';
import { authResetMiddleware } from './middleware/authResetMiddleware.ts';
import { UsersApi } from './api/UsersApi.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [OffersApi.reducerPath]: OffersApi.reducer,
    [BooksApi.reducerPath]: BooksApi.reducer,
    [GenresApi.reducerPath]: GenresApi.reducer,
    [AuthApi.reducerPath]: AuthApi.reducer,
    [ImagesApi.reducerPath]: ImagesApi.reducer,
    [UsersApi.reducerPath]: UsersApi.reducer,
    [FavoritesApi.reducerPath]: FavoritesApi.reducer,
    [ChatsApi.reducerPath]: ChatsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      OffersApi.middleware,
      BooksApi.middleware,
      GenresApi.middleware,
      AuthApi.middleware,
      ImagesApi.middleware,
      UsersApi.middleware,
      FavoritesApi.middleware,
      ChatsApi.middleware,
      authErrorMiddleware,
      authResetMiddleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
