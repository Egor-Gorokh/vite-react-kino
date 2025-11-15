import s from './CategoryMovies.module.css';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    useGetPopularMoviesQuery,
    useGetTopRatedMoviesQuery,
    useGetUpcomingMoviesQuery,
    useGetNowPlayingMoviesQuery
} from '../../../features/movies/api/moviesApi.ts';
import { toggleFavorite as toggleFavoriteAction } from "../../../features/favorites/favoritesSlice.ts";
import {useDispatch} from "react-redux";

type TabType = 'popular' | 'top-rated' | 'upcoming' | 'now-playing';

export const CategoryMovies = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('popular');
    const [favorites, setFavorites] = useState<number[]>([]);
    const navigate = useNavigate(); // Добавил навигацию
    const dispatch = useDispatch();
    // Читаем параметр tab из URL при загрузке компонента
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab') as TabType;
        if (tabFromUrl && ['popular', 'top-rated', 'upcoming', 'now-playing'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    // Используем хуки для всех типов фильмов
    const { data: popularMovies, isLoading: popularLoading, error: popularError } = useGetPopularMoviesQuery(1);
    const { data: topRatedMovies, isLoading: topRatedLoading, error: topRatedError } = useGetTopRatedMoviesQuery(1);
    const { data: upcomingMovies, isLoading: upcomingLoading, error: upcomingError } = useGetUpcomingMoviesQuery(1);
    const { data: nowPlayingMovies, isLoading: nowPlayingLoading, error: nowPlayingError } = useGetNowPlayingMoviesQuery(1);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        // Обновляем URL с новым параметром tab
        setSearchParams({ tab });
    };

    // Добавил функцию для перехода на детальную страницу
    const handleMovieClick = (movieId: number) => {
        navigate(`/movie/${movieId}`);
    };

    const toggleFavorite = (movieId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Предотвращаем всплытие
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

    // Выбираем данные в зависимости от активного таба
    const getCurrentMoviesData = () => {
        switch (activeTab) {
            case 'popular':
                return { movies: popularMovies?.results || [], isLoading: popularLoading, error: popularError };
            case 'top-rated':
                return { movies: topRatedMovies?.results || [], isLoading: topRatedLoading, error: topRatedError };
            case 'upcoming':
                return { movies: upcomingMovies?.results || [], isLoading: upcomingLoading, error: upcomingError };
            case 'now-playing':
                return { movies: nowPlayingMovies?.results || [], isLoading: nowPlayingLoading, error: nowPlayingError };
            default:
                return { movies: popularMovies?.results || [], isLoading: popularLoading, error: popularError };
        }
    };

    const { movies, isLoading, error } = getCurrentMoviesData();

    const tabs = [
        { id: 'popular', label: 'Popular Movies' },
        { id: 'top-rated', label: 'Top Rated Movies' },
        { id: 'upcoming', label: 'Upcoming Movies' },
        { id: 'now-playing', label: 'Now Playing Movies' }
    ];

    if (isLoading) {
        return <div className={s.loading}>Loading movies...</div>;
    }

    if (error) {
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
                {movies.map((movie) => (
                    <div
                        key={movie.id}
                        className={s.movieCard}
                        onClick={() => handleMovieClick(movie.id)} // Добавил клик на карточку
                    >
                        <div className={s.movieImage}>
                            {movie.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className={s.movieImage}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(45deg, #1a1a2e, #16213e)',
                                    color: '#666',
                                    fontSize: '0.8rem',
                                    textAlign: 'center',
                                    padding: '0.5rem'
                                }}>
                                    {movie.title}
                                </div>
                            )}
                        </div>

                        <button
                            className={`${s.favoriteButton} ${favorites.includes(movie.id) ? s.active : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(movie.id, e);
                            }}
                        >
                            <span className={s.heartIcon}>❤</span>
                        </button>

                        <div className={s.movieInfo}>
                            <h3 className={s.movieTitle}>{movie.title}</h3>
                            <p className={s.movieOriginalTitle}>{movie.original_title}</p>

                            <div className={s.movieRating}>
                                <div className={s.ratingStars}>
                                    {renderStars(movie.vote_average)}
                                </div>
                                <span className={s.ratingValue}>{movie.vote_average.toFixed(1)}/10</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};