// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { moviesApi } from '../../features/movies/api/moviesApi';
import favoritesReducer from '../../features/favorites/favoritesSlice';
import loadingReducer from '../../features/loading/loadingSlice';
import { loadingMiddleware } from '../middleware/loadingMiddleware';

export const store = configureStore({
    reducer: {
        favorites: favoritesReducer,
        loading: loadingReducer,
        [moviesApi.reducerPath]: moviesApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(moviesApi.middleware)
            .concat(loadingMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;