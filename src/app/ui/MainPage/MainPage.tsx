import s from './MainPage.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from "../../../common/components/Search/Search.tsx";
import { MoviesSection } from "../../../common/components/MoviesSection/MoviesSection.tsx";
import {
    useGetPopularMoviesQuery,
    useGetTopRatedMoviesQuery,
    useGetUpcomingMoviesQuery,
    useGetNowPlayingMoviesQuery
} from '../../../features/movies/api/moviesApi.ts';

export const MainPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');
    const navigate = useNavigate();

    // Используем хуки для получения всех типов фильмов
    const { data: popularMovies, isLoading: popularLoading, error: popularError } = useGetPopularMoviesQuery(1);
    const { data: topRatedMovies, isLoading: topRatedLoading, error: topRatedError } = useGetTopRatedMoviesQuery(1);
    const { data: upcomingMovies, isLoading: upcomingLoading, error: upcomingError } = useGetUpcomingMoviesQuery(1);
    const { data: nowPlayingMovies, isLoading: nowPlayingLoading, error: nowPlayingError } = useGetNowPlayingMoviesQuery(1);

    // Устанавливаем backdrop популярного фильма как фон
    useEffect(() => {
        if (popularMovies?.results && popularMovies.results.length > 0) {
            // Берем первый популярный фильм у которого есть backdrop
            const movieWithBackdrop = popularMovies.results.find(movie => movie.backdrop_path);
            if (movieWithBackdrop) {
                const backdropUrl = `https://image.tmdb.org/t/p/w1280${movieWithBackdrop.backdrop_path}`;
                setBackgroundImage(backdropUrl);
            }
        }
    }, [popularMovies]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.trim();

        if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <>
            <div
                className={s.mainPage}
                style={{
                    backgroundImage: backgroundImage
                        ? `url(${backgroundImage})`
                        : 'linear-gradient(45deg, #1a1a2e, #16213e)' // fallback градиент
                }}
            >
                <div className={s.backgroundOverlay}></div>
                <div className={s.heroSection}>
                    <h1 className={s.welcomeTitle}>WELCOME</h1>
                    <p className={s.subtitle}>Browse highlighted titles from TMDB</p>

                    <Search
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        onSearchSubmit={handleSearch}
                    />
                </div>
            </div>

            {/* Popular Movies */}
            <MoviesSection
                title="Popular Movies"
                movies={popularMovies?.results || []}
                isLoading={popularLoading}
                error={popularError}
                viewMoreLink="/categoryMovies?tab=popular"
            />

            {/* Top Rated Movies */}
            <MoviesSection
                title="Top Rated Movies"
                movies={topRatedMovies?.results || []}
                isLoading={topRatedLoading}
                error={topRatedError}
                viewMoreLink="/categoryMovies?tab=top-rated"
            />

            {/* Upcoming Movies */}
            <MoviesSection
                title="Upcoming Movies"
                movies={upcomingMovies?.results || []}
                isLoading={upcomingLoading}
                error={upcomingError}
                viewMoreLink="/categoryMovies?tab=upcoming"
            />

            {/* Now Playing Movies */}
            <MoviesSection
                title="Now Playing Movies"
                movies={nowPlayingMovies?.results || []}
                isLoading={nowPlayingLoading}
                error={nowPlayingError}
                viewMoreLink="/categoryMovies?tab=now-playing"
            />
        </>
    );
};