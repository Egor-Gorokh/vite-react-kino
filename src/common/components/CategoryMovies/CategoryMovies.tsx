import s from './CategoryMovies.module.css';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    useGetPopularMoviesQuery,
    useGetTopRatedMoviesQuery,
    useGetUpcomingMoviesQuery,
    useGetNowPlayingMoviesQuery
} from '../../../features/movies/api/moviesApi.ts';
import { toggleFavorite as toggleFavoriteAction } from "../../../features/favorites/favoritesSlice.ts";
import { useDispatch } from "react-redux";

type TabType = 'popular' | 'top-rated' | 'upcoming' | 'now-playing';

export const CategoryMovies = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('popular');
    const [favorites, setFavorites] = useState<number[]>([]);
    const [currentPages, setCurrentPages] = useState({
        popular: 1,
        'top-rated': 1,
        upcoming: 1,
        'now-playing': 1
    });
    const [allMovies, setAllMovies] = useState<Record<TabType, any[]>>({
        popular: [],
        'top-rated': [],
        upcoming: [],
        'now-playing': []
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Читаем параметр tab из URL при загрузке компонента
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab') as TabType;
        if (tabFromUrl && ['popular', 'top-rated', 'upcoming', 'now-playing'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    // Используем хуки для всех типов фильмов с пагинацией
    const { data: popularMovies, isLoading: popularLoading, error: popularError } =
        useGetPopularMoviesQuery(currentPages.popular);
    const { data: topRatedMovies, isLoading: topRatedLoading, error: topRatedError } =
        useGetTopRatedMoviesQuery(currentPages['top-rated']);
    const { data: upcomingMovies, isLoading: upcomingLoading, error: upcomingError } =
        useGetUpcomingMoviesQuery(currentPages.upcoming);
    const { data: nowPlayingMovies, isLoading: nowPlayingLoading, error: nowPlayingError } =
        useGetNowPlayingMoviesQuery(currentPages['now-playing']);

    // Получаем текущие данные для активного таба
    const getCurrentData = () => {
        switch (activeTab) {
            case 'popular':
                return {
                    data: popularMovies,
                    isLoading: popularLoading,
                    error: popularError,
                    currentPage: currentPages.popular
                };
            case 'top-rated':
                return {
                    data: topRatedMovies,
                    isLoading: topRatedLoading,
                    error: topRatedError,
                    currentPage: currentPages['top-rated']
                };
            case 'upcoming':
                return {
                    data: upcomingMovies,
                    isLoading: upcomingLoading,
                    error: upcomingError,
                    currentPage: currentPages.upcoming
                };
            case 'now-playing':
                return {
                    data: nowPlayingMovies,
                    isLoading: nowPlayingLoading,
                    error: nowPlayingError,
                    currentPage: currentPages['now-playing']
                };
            default:
                return {
                    data: popularMovies,
                    isLoading: popularLoading,
                    error: popularError,
                    currentPage: currentPages.popular
                };
        }
    };

    const { data: currentData, isLoading: currentLoading, currentPage } = getCurrentData();

    // Эффект для добавления новых данных при изменении currentData
    useEffect(() => {
        if (currentData?.results && currentData.results.length > 0) {
            setAllMovies(prev => {
                const currentTabMovies = prev[activeTab] || [];

                // Если это первая страница, заменяем все фильмы
                if (currentPage === 1) {
                    return {
                        ...prev,
                        [activeTab]: currentData.results
                    };
                }

                // Если это не первая страница, добавляем фильмы, избегая дубликатов
                const newMovies = currentData.results.filter(
                    newMovie => !currentTabMovies.some(existingMovie => existingMovie.id === newMovie.id)
                );

                return {
                    ...prev,
                    [activeTab]: [...currentTabMovies, ...newMovies]
                };
            });
        }
    }, [currentData, activeTab, currentPage]);

    // Функция для загрузки следующей страницы
    const loadMore = useCallback(() => {
        if (currentLoading || !currentData) return;

        // Проверяем, есть ли еще страницы для загрузки
        if (currentData.total_pages && currentPage < currentData.total_pages) {
            setCurrentPages(prev => ({
                ...prev,
                [activeTab]: prev[activeTab] + 1
            }));
        }
    }, [activeTab, currentLoading, currentData, currentPage]);

    // Обработчик скролла
    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

            // Загружаем следующую страницу когда до конца осталось 300px
            if (scrollHeight - (scrollTop + clientHeight) < 300 && !currentLoading) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMore, currentLoading]);

    const handleTabChange = (tab: TabType) => {
        // Сбрасываем страницу на 1 при смене таба
        setCurrentPages(prev => ({
            ...prev,
            [tab]: 1
        }));
        setActiveTab(tab);
        setSearchParams({ tab });

        // Очищаем фильмы для нового таба (начинаем с пустого массива)
        setAllMovies(prev => ({
            ...prev,
            [tab]: []
        }));
    };

    const handleMovieClick = (movieId: number) => {
        navigate(`/movie/${movieId}`);
    };

    const toggleFavorite = (movieId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(movieId)
                ? prev.filter(id => id !== movieId)
                : [...prev, movieId]
        );
        dispatch(toggleFavoriteAction(movieId));
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const filledStars = Math.round(rating / 2);

        for (let i = 0; i < 5; i++) {
            stars.push(
                <span key={i} className={s.ratingStars}>
                    {i < filledStars ? '★' : '☆'}
                </span>
            );
        }
        return stars;
    };

    const currentMovies = allMovies[activeTab] || [];
    const hasMore = currentData?.total_pages && currentPage < currentData.total_pages;

    const tabs = [
        { id: 'popular', label: 'Popular Movies' },
        { id: 'top-rated', label: 'Top Rated Movies' },
        { id: 'upcoming', label: 'Upcoming Movies' },
        { id: 'now-playing', label: 'Now Playing Movies' }
    ];

    const currentError = getCurrentData().error;

    if (currentError) {
        return <div className={s.error}>Error loading movies. Please try again later.</div>;
    }

    return (
        <div className={s.categoryMovies}>
            <div className={s.header}>
                <h1 className={s.title}>Category Movies</h1>

                <div className={s.tabs}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`${s.tab} ${activeTab === tab.id ? s.active : ''}`}
                            onClick={() => handleTabChange(tab.id as TabType)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={s.moviesGrid}>
                {currentMovies.map((movie, index) => (
                    <div
                        key={`${movie.id}-${index}`}
                        className={s.movieCard}
                        onClick={() => handleMovieClick(movie.id)}
                    >
                        <div className={s.movieImage}>
                            {movie.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className={s.posterImage}
                                />
                            ) : (
                                <div className={s.noImage}>
                                    {movie.title}
                                </div>
                            )}
                        </div>

                        <button
                            className={`${s.favoriteButton} ${favorites.includes(movie.id) ? s.active : ''}`}
                            onClick={(e) => toggleFavorite(movie.id, e)}
                        >
                            <span className={s.heartIcon}>❤</span>
                        </button>

                        <div className={s.movieInfo}>
                            <h3 className={s.movieTitle}>{movie.title}</h3>
                            <p className={s.movieOriginalTitle}>{movie.original_title}</p>

                            <div className={s.movieRating}>
                                <div className={s.starsContainer}>
                                    {renderStars(movie.vote_average)}
                                </div>
                                <span className={s.ratingValue}>{movie.vote_average.toFixed(1)}/10</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Индикатор загрузки */}
            {currentLoading && (
                <div className={s.loading}>
                    Loading more movies...
                </div>
            )}

            {/* Сообщение когда все загружено */}
            {!hasMore && currentMovies.length > 0 && (
                <div className={s.endMessage}>
                    You've seen all movies in this category!
                </div>
            )}

            {/* Сообщение если нет фильмов */}
            {!currentLoading && currentMovies.length === 0 && (
                <div className={s.noMovies}>
                    No movies found in this category.
                </div>
            )}
        </div>
    );
};