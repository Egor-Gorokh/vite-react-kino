import s from './MoviesSection.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Movie {
    id: number;
    title: string;
    original_title: string;
    vote_average: number;
    poster_path?: string;
}

interface MoviesSectionProps {
    title: string;
    movies: Movie[];
    isLoading: boolean;
    error: any;
    viewMoreLink: string;
    showViewMore?: boolean;
}

export const MoviesSection = ({
                                  title,
                                  movies,
                                  isLoading,
                                  error,
                                  viewMoreLink,
                                  showViewMore = true
                              }: MoviesSectionProps) => {
    const [favorites, setFavorites] = useState<number[]>([]);
    const navigate = useNavigate();

    const handleViewMore = () => {
        navigate(viewMoreLink);
    };

    // Функция для перехода на детальную страницу фильма
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

    if (isLoading) {
        return <div className={s.loading}>Loading {title.toLowerCase()}...</div>;
    }

    if (error) {
        console.error(`Error loading ${title.toLowerCase()}:`, error);
        return <div className={s.error}>Error loading {title.toLowerCase()}. Please try again later.</div>;
    }

    // Берем только первые 6 фильмов
    const displayedMovies = movies.slice(0, 6);

    return (
        <div className={s.moviesSection}>
            <div className={s.header}>
                <h1 className={s.title}>{title}</h1>
                {showViewMore && (
                    <button className={s.viewMore} onClick={handleViewMore}>
                        View more
                    </button>
                )}
            </div>

            <div className={s.moviesGrid}>
                {displayedMovies.map((movie) => (
                    <div
                        key={movie.id}
                        className={s.movieCard}
                        onClick={() => handleMovieClick(movie.id)}
                    >
                        <div className={s.movieImage}>
                            {movie.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className={s.movieImage}
                                    loading="lazy"
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