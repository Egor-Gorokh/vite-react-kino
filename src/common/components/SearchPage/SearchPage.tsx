
import { useSearchMoviesQuery } from '../../../features/movies/api/moviesApi.ts';
import s from './SearchPage.module.css';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from '../Search/Search.tsx';

import { toggleFavorite as toggleFavoriteAction } from "../../../features/favorites/favoritesSlice.ts";
import {useDispatch} from "react-redux";


interface Movie {
    id: number;
    title: string;
    original_title: string;
    vote_average: number;
    genre_ids: number[];
    poster_path?: string;
    release_date: string;
}

interface Genre {
    id: number;
    name: string;
}

const TMDB_GENRES: Genre[] = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
];

export const SearchPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [favorites, setFavorites] = useState<number[]>([]);

    // Берем поисковый запрос из URL параметров
    const urlQuery = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(urlQuery);

    // Используем urlQuery для API запроса - сразу при загрузке страницы
    const { data: searchResults, isLoading, error } = useSearchMoviesQuery(
        urlQuery,
        { skip: !urlQuery.trim() }
    );

    // Автоматически устанавливаем поисковый запрос при загрузке страницы
    useEffect(() => {
        if (urlQuery) {
            setSearchQuery(urlQuery);
            // Поиск автоматически выполнится через useSearchMoviesQuery
        }
    }, [urlQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.trim();

        if (query) {
            // Обновляем URL параметры
            setSearchParams({ q: query });
            // API запрос автоматически сработает из-за изменения urlQuery
        }
    };

    // Функция для сброса поиска
    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchParams({});
    };

    // Функция для обработки изменения поиска
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);

        if (query === '') {
            handleClearSearch();
        }
    };

    // Навигация на страницу деталей фильма
    const handleMovieClick = (movieId: number) => {
        navigate(`/movie/${movieId}`);
    };

    // Добавление/удаление из избранного
    const toggleFavorite = (movieId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(movieId)
                ? prev.filter(id => id !== movieId)
                : [...prev, movieId]
        );
        dispatch(toggleFavoriteAction(movieId));
    };

    // Функция для получения URL изображения
    const getImageUrl = (path: string | undefined, size: string = 'w500') => {
        if (!path) return null;
        return `https://image.tmdb.org/t/p/${size}${path}`;
    };

    // Получаем отфильтрованные фильмы
    const movies = searchResults?.results || [];

    return (
        <div className={s.searchPage}>
            <div className={s.header}>
                <h1 className={s.title}>Search Movies</h1>
            </div>

            <div className={s.searchSection}>
                <Search
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    onSearchSubmit={handleSearch}
                />
            </div>

            {/* Состояние загрузки */}
            {isLoading && (
                <div className={s.loading}>
                    <div className={s.loadingSpinner}></div>
                    <p>Searching for "{urlQuery}"...</p>
                </div>
            )}

            {/* Состояние ошибки */}
            {error && (
                <div className={s.error}>
                    <div className={s.errorIcon}>⚠️</div>
                    <p>Error searching movies. Please try again later.</p>
                </div>
            )}

            {/* Состояние когда поиск пустой */}
            {!urlQuery && !isLoading && (
                <div className={s.placeholderText}>
                    Enter a movie title to start searching.
                </div>
            )}

            {/* Состояние когда есть результаты поиска */}
            {urlQuery && movies.length > 0 && !isLoading && (
                <div className={s.resultsInfo}>
                    <p className={s.resultsCount}>
                        Found {movies.length} results for <span className={s.searchQuery}>"{urlQuery}"</span>
                    </p>

                    <div className={s.moviesGrid}>
                        {movies.map((movie) => {
                            const imageUrl = getImageUrl(movie.poster_path);

                            return (
                                <div
                                    key={movie.id}
                                    className={s.movieCard}
                                    onClick={() => handleMovieClick(movie.id)}
                                >
                                    <div className={s.movieImage}>
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={movie.title}
                                                className={s.movieImg}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : null}
                                        <div className={s.moviePlaceholder}>
                                            {movie.title}
                                        </div>
                                    </div>

                                    <button
                                        className={`${s.favoriteButton} ${favorites.includes(movie.id) ? s.active : ''}`}
                                        onClick={(e) => toggleFavorite(movie.id, e)}
                                    >
                                        <span className={s.heartIcon}>❤</span>
                                    </button>

                                    <div className={s.movieInfo}>
                                        <h3 className={s.movieTitle}>{movie.title}</h3>
                                        {movie.original_title !== movie.title && (
                                            <p className={s.movieOriginalTitle}>{movie.original_title}</p>
                                        )}

                                        <div className={s.movieRating}>
                                            <span className={s.ratingValue}>{movie.vote_average.toFixed(1)}/10</span>
                                        </div>

                                        <div className={s.movieDetails}>
                                            <span className={s.releaseDate}>
                                                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                                            </span>
                                            <div className={s.movieGenres}>
                                                {movie.genre_ids.slice(0, 2).map(genreId => {
                                                    const genre = TMDB_GENRES.find(g => g.id === genreId);
                                                    return genre ? (
                                                        <span key={genreId} className={s.genreTag}>
                                                            {genre.name}
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Состояние когда ничего не найдено */}
            {urlQuery && movies.length === 0 && !isLoading && (
                <div className={s.noResults}>
                    <div className={s.noResultsIcon}>🔍</div>
                    <p className={s.noResultsText}>
                        No matches found for <span className={s.searchQuery}>"{urlQuery}"</span>
                    </p>
                    <p className={s.noResultsHint}>
                        Try checking the spelling or using different keywords.
                    </p>
                </div>
            )}
        </div>
    );
};