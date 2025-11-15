import s from './FilteredMovies.module.css';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTopRatedMoviesQuery } from '../../../features/movies/api/moviesApi.ts';
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
    popularity: number;
}

interface Genre {
    id: number;
    name: string;
}

type SortOption = 'popularity_desc' | 'popularity_asc' | 'rating_desc' | 'rating_asc' | 'release_desc' | 'release_asc' | 'title_asc' | 'title_desc';

// Debounce функция
const useDebounce = (value: [number, number], delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Список жанров TMDB
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

export const FilteredMovies = () => {
    const dispatch = useDispatch();

    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState<SortOption>('popularity_desc');
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [ratingRange, setRatingRange] = useState<[number, number]>([0, 10]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Используем debounce для рейтинга с задержкой 200ms
    const debouncedRatingRange = useDebounce(ratingRange, 200);

    // Получаем данные из API - используем топ рейтинговые фильмы
    const { data: moviesData, isLoading, error } = useGetTopRatedMoviesQuery(1);

    // Преобразуем данные из API в наш формат
    const movies: Movie[] = moviesData?.results?.map(movie => ({
        id: movie.id,
        title: movie.title,
        original_title: movie.original_title,
        vote_average: movie.vote_average,
        genre_ids: movie.genre_ids,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        popularity: movie.popularity
    })) || [];

    const sortOptions = [
        { id: 'popularity_desc', label: 'Popularity ↓' },
        { id: 'popularity_asc', label: 'Popularity ↑' },
        { id: 'rating_desc', label: 'Rating ↓' },
        { id: 'rating_asc', label: 'Rating ↑' },
        { id: 'release_desc', label: 'Release Date ↓' },
        { id: 'release_asc', label: 'Release Date ↑' },
        { id: 'title_asc', label: 'Title A-Z' },
        { id: 'title_desc', label: 'Title Z-A' }
    ];

    // Сброс всех фильтров
    const resetFilters = () => {
        setSortBy('popularity_desc');
        setSelectedGenres([]);
        setRatingRange([0, 10]);
    };

    const toggleFavorite = (movieId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Предотвращаем переход на страницу фильма
        setFavorites(prev =>
            prev.includes(movieId)
                ? prev.filter(id => id !== movieId)
                : [...prev, movieId]
        );

        dispatch(toggleFavoriteAction(movieId));
    };

    const toggleGenre = (genreId: number) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    };

    // Функция для получения URL изображения
    const getImageUrl = (path: string | undefined, size: string = 'w500') => {
        if (!path) return null;
        return `https://image.tmdb.org/t/p/${size}${path}`;
    };

    // Навигация на страницу деталей фильма
    const handleMovieClick = (movieId: number) => {
        navigate(`/movie/${movieId}`);
    };

    // Обработчики для двойного ползунка с useCallback для оптимизации
    const handleMouseDown = useCallback((thumb: 'min' | 'max') => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(thumb);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;

        const slider = sliderRef.current;
        const rect = slider.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 10; // 0-10 scale

        if (isDragging === 'min') {
            setRatingRange(prev => [Math.min(percentage, prev[1] - 0.1), prev[1]]);
        } else {
            setRatingRange(prev => [prev[0], Math.max(percentage, prev[0] + 0.1)]);
        }
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(null);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Эффект для обработки изменений рейтинга (с debounce)
    useEffect(() => {
        console.log('Rating range changed (debounced):', debouncedRatingRange);
    }, [debouncedRatingRange]);

    // Фильтрация и сортировка фильмов (используем debounced рейтинг)
    const filteredAndSortedMovies = movies
        .filter(movie => {
            // Фильтрация по жанрам
            if (selectedGenres.length > 0) {
                return selectedGenres.some(genreId => movie.genre_ids.includes(genreId));
            }
            return true;
        })
        .filter(movie => movie.vote_average >= debouncedRatingRange[0] && movie.vote_average <= debouncedRatingRange[1])
        .sort((a, b) => {
            switch (sortBy) {
                case 'popularity_desc':
                    return b.popularity - a.popularity;
                case 'popularity_asc':
                    return a.popularity - b.popularity;
                case 'rating_desc':
                    return b.vote_average - a.vote_average;
                case 'rating_asc':
                    return a.vote_average - b.vote_average;
                case 'release_desc':
                    return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
                case 'release_asc':
                    return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'title_desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

    // Расчет позиций для ползунков (используем актуальные значения без debounce для плавности UI)
    const minPosition = (ratingRange[0] / 10) * 100;
    const maxPosition = (ratingRange[1] / 10) * 100;

    if (isLoading) {
        return (
            <div className={s.filteredMovies}>
                <div className={s.loading}>Loading movies...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={s.filteredMovies}>
                <div className={s.error}>Error loading movies. Please try again later.</div>
            </div>
        );
    }

    return (
        <div className={s.filteredMovies}>
            <div className={s.header}>
                <h1 className={s.title}>Filtered Movies</h1>
                <div className={s.resultsCount}>
                    Found {filteredAndSortedMovies.length} movies
                </div>
            </div>

            {/* Боковая панель фильтров */}
            <div className={s.filtersSidebar}>
                <div className={s.filtersHeader}>
                    <h2 className={s.filtersTitle}>Filters / Sort</h2>
                    <button className={s.resetButton} onClick={resetFilters}>
                        Reset filters
                    </button>
                </div>

                {/* Сортировка */}
                <div className={`${s.filterSection} ${s.sortSection}`}>
                    <h3 className={s.sectionTitle}>Sort by</h3>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className={s.sortSelect}
                    >
                        {sortOptions.map(option => (
                            <option key={option.id} value={option.id}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Жанры */}
                <div className={`${s.filterSection} ${s.genreSection}`}>
                    <h3 className={s.sectionTitle}>Genres</h3>
                    <div className={s.genresGrid}>
                        {TMDB_GENRES.map(genre => (
                            <label key={genre.id} className={s.genreCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={selectedGenres.includes(genre.id)}
                                    onChange={() => toggleGenre(genre.id)}
                                />
                                <span className={s.genreLabel}>{genre.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Рейтинг */}
                <div className={`${s.filterSection} ${s.ratingSection}`}>
                    <h3 className={s.sectionTitle}>Rating</h3>
                    <div className={s.ratingRangeContainer} ref={sliderRef}>
                        <div className={s.ratingSlider} />
                        <div
                            className={s.ratingSliderFill}
                            style={{
                                left: `${minPosition}%`,
                                width: `${maxPosition - minPosition}%`
                            }}
                        />
                        <div
                            className={s.ratingThumb}
                            style={{ left: `${minPosition}%` }}
                            onMouseDown={handleMouseDown('min')}
                        />
                        <div
                            className={s.ratingThumb}
                            style={{ left: `${maxPosition}%` }}
                            onMouseDown={handleMouseDown('max')}
                        />
                    </div>
                    <div className={s.ratingValues}>
                        <span>{ratingRange[0].toFixed(1)}</span>
                        <span>{ratingRange[1].toFixed(1)}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#90cea1', textAlign: 'center', marginTop: '0.5rem' }}>
                        Updates after 200ms delay
                    </div>
                </div>
            </div>

            {/* Сетка фильмов */}
            <div className={s.moviesContent}>
                {filteredAndSortedMovies.length === 0 ? (
                    <div className={s.noResults}>
                        No movies found matching your filters. Try adjusting your criteria.
                    </div>
                ) : (
                    <div className={s.moviesGrid}>
                        {filteredAndSortedMovies.map((movie) => {
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
                                                className={s.movieImage}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className={s.moviePlaceholder}>
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
                                            <span className={s.ratingValue}>{movie.vote_average.toFixed(1)}/10</span>
                                        </div>

                                        <div className={s.movieDetails}>
                                            <span className={s.releaseDate}>
                                                {new Date(movie.release_date).getFullYear()}
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
                )}
            </div>
        </div>
    );
};