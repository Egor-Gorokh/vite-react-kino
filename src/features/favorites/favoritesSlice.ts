// features/favorites/favoritesSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/model/store.ts';

interface FavoritesState {
    movieIds: number[];
}

const loadFavoritesFromStorage = (): number[] => {
    try {
        const stored = localStorage.getItem('favoriteMovieIds');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const initialState: FavoritesState = {
    movieIds: loadFavoritesFromStorage(),
};

export const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        addToFavorites: (state, action: PayloadAction<number>) => {
            if (!state.movieIds.includes(action.payload)) {
                state.movieIds.push(action.payload);
                localStorage.setItem('favoriteMovieIds', JSON.stringify(state.movieIds));
            }
        },
        removeFromFavorites: (state, action: PayloadAction<number>) => {
            state.movieIds = state.movieIds.filter(id => id !== action.payload);
            localStorage.setItem('favoriteMovieIds', JSON.stringify(state.movieIds));
        },
        toggleFavorite: (state, action: PayloadAction<number>) => {
            const movieId = action.payload;
            const existingIndex = state.movieIds.indexOf(movieId);

            if (existingIndex >= 0) {
                state.movieIds.splice(existingIndex, 1);
            } else {
                state.movieIds.push(movieId);
            }
            localStorage.setItem('favoriteMovieIds', JSON.stringify(state.movieIds));
        },
    },
});

export const { addToFavorites, removeFromFavorites, toggleFavorite } = favoritesSlice.actions;

// Selectors
export const selectFavoriteIds = (state: RootState) => state.favorites.movieIds;
export const selectIsFavorite = (movieId: number) => (state: RootState) =>
    state.favorites.movieIds.includes(movieId);

export default favoritesSlice.reducer;