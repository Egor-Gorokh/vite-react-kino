import { useSearchMoviesQuery } from '../../../features/movies/api/moviesApi.ts';
import s from './SearchPage.module.css';
import { useState, useEffect, useRef, useCallback } from 'react';
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
    const [page, setPage] = useState(1);
    const [movies, setMovies] = useState<Movie[]>([]);

    const isLoadingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout>();
    const lastSearchQueryRef = useRef('');

    // Берем поисковый запрос из URL параметров
    const urlQuery = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(urlQuery);

    // Используем urlQuery и page для API запроса
    const { data: searchResults, isLoading, error } = useSearchMoviesQuery(
        { query: urlQuery, page: page },
        { skip: !urlQuery.trim() }
    );

    // Обновляем ref при изменении loading состояния
    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    // Эффект для добавления новых данных
    useEffect(() => {
        if (searchResults?.results) {
            const newMovies: Movie[] = searchResults.results.map(movie => ({
                id: movie.id,
                title: movie.title,
                original_title: movie.original_title,
                vote_average: movie.vote_average,
                genre_ids: movie.genre_ids,
                poster_path: movie.poster_path,
                release_date: movie.release_date
            }));

            setMovies(prev => {
                if (page === 1 || lastSearchQueryRef.current !== urlQuery) {
                    lastSearchQueryRef.current = urlQuery;
                    return newMovies;
                }

                // Фильтруем дубликаты по ID
                const existingIds = new Set(prev.map(m => m.id));
                const uniqueNewMovies = newMovies.filter(movie => !existingIds.has(movie.id));

                return [...prev, ...uniqueNewMovies];
            });
        }
    }, [searchResults, page, urlQuery]);

    // Сбрасываем пагинацию при изменении поискового запроса
    useEffect(() => {
        if (urlQuery && lastSearchQueryRef.current !== urlQuery) {
            setPage(1);
            lastSearchQueryRef.current = urlQuery;
        }
    }, [urlQuery]);

    // Функция для загрузки следующей страницы
    const loadMore = useCallback(() => {
        if (isLoadingRef.current || !searchResults) return;

        const totalPages = searchResults.total_pages || 1;
        if (page < totalPages) {
            setPage(prev => prev + 1);
        }
    }, [searchResults, page]);

    // Оптимизированный обработчик скролла с троттлингом
    const handleScroll = useCallback(() => {
        if (isLoadingRef.current) return;

        // Очищаем предыдущий таймаут
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Устанавливаем новый таймаут для троттлинга
        scrollTimeoutRef.current = setTimeout(() => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

            // Загружаем когда до конца осталось 500px
            if (scrollHeight - (scrollTop + clientHeight) < 500) {
                loadMore();
            }
        }, 50); // Уменьшил задержку для лучшей отзывчивости
    }, [loadMore]);

    // Эффект для скролла
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [handleScroll]);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.trim();

        if (query) {
            setSearchParams({ q: query });
            setPage(1);
        }
    }, [searchQuery, setSearchParams]);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
        setSearchParams({});
        setPage(1);
        setMovies([]);
    }, [setSearchParams]);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        if (query === '') {
            handleClearSearch();
        }
    }, [handleClearSearch]);

    const handleMovieClick = useCallback((movieId: number) => {
        navigate(`/movie/${movieId}`);
    }, [navigate]);

    const toggleFavorite = useCallback((movieId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(movieId)
                ? prev.filter(id => id !== movieId)
                : [...prev, movieId]
        );
        dispatch(toggleFavoriteAction(movieId));
    }, [dispatch]);

    const getImageUrl = useCallback((path: string | undefined, size: string = 'w500') => {
        if (!path) return null;
        return `https://image.tmdb.org/t/p/${size}${path}`;
    }, []);

    const hasMore = searchResults?.total_pages && page < searchResults.total_pages;

    // Мемоизируем рендер карточек фильмов
    const movieCards = movies.map((movie, index) => {
        const imageUrl = getImageUrl(movie.poster_path);

        return (
            <div
                key={`${movie.id}-${index}`}
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
    });

    if (isLoading && movies.length === 0) {
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

                <div className={s.loading}>
                    <div className={s.loadingSpinner}></div>
                    <p>Searching for "{urlQuery}"...</p>
                </div>
            </div>
        );
    }

    if (error) {
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

                <div className={s.error}>
                    <div className={s.errorIcon}>⚠️</div>
                    <p>Error searching movies. Please try again later.</p>
                </div>
            </div>
        );
    }

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

            {!urlQuery && !isLoading && (
                <div className={s.placeholderText}>
                    Enter a movie title to start searching.
                </div>
            )}

            {urlQuery && movies.length > 0 && (
                <div className={s.resultsInfo}>
                    <p className={s.resultsCount}>
                        Found {searchResults?.total_results || 0} results for <span className={s.searchQuery}>"{urlQuery}"</span>
                        {movies.length < (searchResults?.total_results || 0) && (
                            <span className={s.showingCount}> (showing {movies.length})</span>
                        )}
                    </p>

                    <div className={s.moviesGrid}>
                        {movieCards}
                    </div>

                    {isLoading && (
                        <div className={s.loading}>
                            <div className={s.spinner}></div>
                            Loading more movies... (Page {page})
                        </div>
                    )}

                    {!hasMore && movies.length > 0 && (
                        <div className={s.endMessage}>
                            🎉 You've seen all {movies.length} search results!
                        </div>
                    )}
                </div>
            )}

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