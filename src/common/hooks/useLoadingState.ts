// hooks/useLoadingState.ts
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/model/store';

export const useLoadingState = () => {
    const isLoading = useSelector((state: RootState) => {
        const queries = state.baseApi.queries;

        // Отслеживаем только основные запросы фильмов
        const movieQueryKeys = [
            'getNowPlayingMovies',
            'getPopularMovies',
            'getTopRatedMovies',
            'getUpcomingMovies',
            'searchMovies'
        ];

        return Object.values(queries).some(query =>
            query?.status === 'pending' &&
            movieQueryKeys.some(key => query.endpointName?.includes(key))
        );
    });

    return { isLoading };
};