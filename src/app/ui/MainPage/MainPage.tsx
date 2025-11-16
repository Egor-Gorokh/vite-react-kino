// MainPage.tsx
import s from './MainPage.module.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from "../../../common/components/Search/Search.tsx";
import { MoviesSection } from "../../../common/components/MoviesSection/MoviesSection.tsx";
import { MoviesSectionSkeleton } from '../../../common/components/Skeletons/MoviesSectionSkeleton.tsx';
import {
    useGetPopularMoviesQuery,
    useGetTopRatedMoviesQuery,
    useGetUpcomingMoviesQuery,
    useGetNowPlayingMoviesQuery
} from '../../../features/movies/api/moviesApi.ts';

interface Movie {
    id: number;
    title: string;
    backdrop_path?: string;
    poster_path?: string;
    vote_average: number;
    release_date: string;
    overview: string;
    genre_ids: number[];
    original_title: string;
    popularity: number;
    vote_count: number;
    adult: boolean;
    video: boolean;
}

interface MoviesResponse {
    results: Movie[];
    total_pages: number;
    total_results: number;
    page: number;
}

export const MainPage = () => {
 
    const [searchQuery, setSearchQuery] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');
    const navigate = useNavigate();

    // Используем хуки для получения всех типов фильмов
    const { data: popularMovies, isLoading: popularLoading, error: popularError } = useGetPopularMoviesQuery(1);
    const { data: topRatedMovies, isLoading: topRatedLoading, error: topRatedError } = useGetTopRatedMoviesQuery(1);
    const { data: upcomingMovies, isLoading: upcomingLoading, error: upcomingError } = useGetUpcomingMoviesQuery(1);
    const { data: nowPlayingMovies, isLoading: nowPlayingLoading, error: nowPlayingError } = useGetNowPlayingMoviesQuery(1);

    // Проверяем, идет ли загрузка хотя бы одного раздела
    const isLoading = popularLoading || topRatedLoading || upcomingLoading || nowPlayingLoading;

    // Устанавливаем backdrop популярного фильма как фон
    useEffect(() => {
        if (popularMovies?.results && popularMovies.results.length > 0) {
            const movieWithBackdrop = popularMovies.results.find((movie: Movie) => movie.backdrop_path);
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

    // Показываем скелетоны во время загрузки
    if (isLoading) {
        return (
            <>
                <div className={s.mainPage}>
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

                {/* Скелетоны для всех разделов */}
                <MoviesSectionSkeleton />
                <MoviesSectionSkeleton />
                <MoviesSectionSkeleton />
                <MoviesSectionSkeleton />
            </>
        );
    }

    return (
        <>
            <div
                className={s.mainPage}
                style={{
                    backgroundImage: backgroundImage
                        ? `url(${backgroundImage})`
                        : 'linear-gradient(45deg, #1a1a2e, #16213e)'
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
                movies={(popularMovies as MoviesResponse)?.results || []}
                isLoading={false}
                error={popularError}
                viewMoreLink="/categoryMovies?tab=popular"
            />

            {/* Top Rated Movies */}
            <MoviesSection
                title="Top Rated Movies"
                movies={(topRatedMovies as MoviesResponse)?.results || []}
                isLoading={false}
                error={topRatedError}
                viewMoreLink="/categoryMovies?tab=top-rated"
            />

            {/* Upcoming Movies */}
            <MoviesSection
                title="Upcoming Movies"
                movies={(upcomingMovies as MoviesResponse)?.results || []}
                isLoading={false}
                error={upcomingError}
                viewMoreLink="/categoryMovies?tab=upcoming"
            />

            {/* Now Playing Movies */}
            <MoviesSection
                title="Now Playing Movies"
                movies={(nowPlayingMovies as MoviesResponse)?.results || []}
                isLoading={false}
                error={nowPlayingError}
                viewMoreLink="/categoryMovies?tab=now-playing"
            />
        </>
    );
};
