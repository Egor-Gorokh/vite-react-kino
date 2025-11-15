


/*import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../api/baseApi.ts'

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
*/

import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../api/baseApi.ts'
import favoritesReducer from '../../features/favorites/favoritesSlice.ts' // Импортируем наш slice

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        favorites: favoritesReducer, // Добавляем favorites
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch