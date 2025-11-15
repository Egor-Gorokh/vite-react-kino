import s from './MoviesSection.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleFavorite as toggleFavoriteAction } from "../../../features/favorites/favoritesSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import { selectIsFavorite } from "../../../features/favorites/favoritesSlice.ts";

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
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleViewMore = () => {
        navigate(viewMoreLink);
    };

    // Функция для перехода на детальную страницу фильма
    const handleMovieClick = (movieId: number) => {
        navigate(`/movie/${movieId}`);
    };

    const handleToggleFavorite = (movieId: number, e: React.MouseEvent) => {
        e.stopPropagation();
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
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                        onMovieClick={handleMovieClick}
                        onToggleFavorite={handleToggleFavorite}
                        renderStars={renderStars}
                    />
                ))}
            </div>
        </div>
    );
};

// Отдельный компонент для карточки фильма чтобы использовать useSelector
const MovieCard = ({
                       movie,
                       onMovieClick,
                       onToggleFavorite,
                       renderStars
                   }: {
    movie: Movie;
    onMovieClick: (movieId: number) => void;
    onToggleFavorite: (movieId: number, e: React.MouseEvent) => void;
    renderStars: (rating: number) => JSX.Element[];
}) => {
    const isFavorite = useSelector(selectIsFavorite(movie.id));

    return (
        <div
            className={s.movieCard}
            onClick={() => onMovieClick(movie.id)}
        >
            <div className={s.movieImage}>
                {movie.poster_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className={s.movieImg}
                        loading="lazy"
                    />
                ) : (
                    <div className={s.noImage}>
                        {movie.title}
                    </div>
                )}
            </div>

            <button
                className={`${s.favoriteButton} ${isFavorite ? s.active : ''}`}
                onClick={(e) => onToggleFavorite(movie.id, e)}
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
    );
};