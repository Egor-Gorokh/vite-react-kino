import { baseApi } from '../../../app/api/baseApi.ts'

export const moviesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Основные endpoints для списков фильмов
        getNowPlayingMovies: builder.query({
            query: (page: number = 1) => ({
                url: 'movie/now_playing',
                params: {
                    api_key: import.meta.env.VITE_API_KEY,
                    language: 'en-US',
                    page: page
                }
            }),
            providesTags: ['Movies']
        }),

        getPopularMovies: builder.query({
            query: (page: number = 1) => ({
                url: 'movie/popular',
                params: {
                    api_key: import.meta.env.VITE_API_KEY,
                    language: 'en-US',
                    page: page
                }
            }),
            providesTags: ['Movies']
        }),

        getTopRatedMovies: builder.query({
            query: (page: number = 1) => ({
                url: 'movie/top_rated',
                params: {
                    api_key: import.meta.env.VITE_API_KEY,
                    language: 'en-US',
                    page: page
                }
            }),
            providesTags: ['Movies']
        }),

        getUpcomingMovies: builder.query({
            query: (page: number = 1) => ({
                url: 'movie/upcoming',
                params: {
                    api_key: import.meta.env.VITE_API_KEY,
                    language: 'en-US',
                    page: page
                }
            }),
            providesTags: ['Movies']
        }),

        // Поиск фильмов
        searchMovies: builder.query({
            query: (searchQuery: string) => ({
                url: 'search/movie',
                params: {
                    api_key: import.meta.env.VITE_API_KEY,
                    query: searchQuery,
                    language: 'en-US',
                    page: 1,
                    include_adult: false
                }
            }),
            providesTags: ['Movies']
        }),

        // Детальная информация о фильме
        getMovieDetails: builder.query({
            query: (movieId: number) => ({
                url: `movie/${movieId}`,
                params: {
                    api_key: import.meta.env.VITE_API_KEY,
                    language: 'en-US'
                }
            })
        }),

        // Актерский состав и команда
        getMovieCredits: builder.query({
            query: (movieId: number) => ({
                url: `movie/${movieId}/credits`,
                params: {
                    api_key: import.meta.env.VITE_API_KEY,
                    language: 'en-US'
                }
            })
        }),

        // Изображения фильма
        getMovieImages: builder.query({
            query: (movieId: number) => ({
                url: `movie/${movieId}/images`,
                params: {
                    api_key: import.meta.env.VITE_API_KEY
                }
            })
        }),

        // Рекомендации
        getMovieRecommendations: builder.query({
            query: (movieId: number) => ({
                url: `movie/${movieId}/recommendations`,
                params: {
                    api_key: import.meta.env.VITE_API_KEY,
                    language: 'en-US',
                    page: 1
                }
            })
        }),

        // Похожие фильмы
        getSimilarMovies: builder.query({
            query: (movieId: number) => ({
                url: `movie/${movieId}/similar`,
                params: {
                    api_key: import.meta.env.VITE_API_KEY,
                    language: 'en-US',
                    page: 1
                }
            })
        }),

        // Видео (трейлеры)
        getMovieVideos: builder.query({
            query: (movieId: number) => ({
                url: `movie/${movieId}/videos`,
                params: {
                    api_key: import.meta.env.VITE_API_KEY,
                    language: 'en-US'
                }
            })
        })
    })
})

export const {
    useGetNowPlayingMoviesQuery,
    useGetPopularMoviesQuery,
    useGetTopRatedMoviesQuery,
    useGetUpcomingMoviesQuery,
    useSearchMoviesQuery,
    useGetMovieDetailsQuery,
    useGetMovieCreditsQuery,
    useGetMovieImagesQuery,
    useGetMovieRecommendationsQuery,
    useGetSimilarMoviesQuery,
    useGetMovieVideosQuery
} = moviesApi