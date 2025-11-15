// features/favorites/FavoritesPage.tsx
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectFavoriteIds, toggleFavorite } from './favoritesSlice';
import { useGetMovieDetailsQuery } from '../movies/api/moviesApi';
import { useDispatch } from 'react-redux';
import s from './FavoritesPage.module.css';

export const FavoritesPage = () => {
    const favoriteIds = useSelector(selectFavoriteIds);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleMovieClick = (movieId: number) => {
        navigate(`/movie/${movieId}`);
    };

    const handleToggleFavorite = (movieId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(toggleFavorite(movieId));
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

    if (favoriteIds.length === 0) {
        return (
            <div className={s.favoritesPage}>
                <div className={s.header}>
                    <h1 className={s.title}>Favorite Movies</h1>
                </div>
                <div className={s.emptyState}>
                    <div className={s.emptyIcon}>❤</div>
                    <h2 className={s.emptyTitle}>No favorites yet</h2>
                    <p className={s.emptyText}>
                        Start adding movies to your favorites by clicking the heart icon on any movie card.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={s.favoritesPage}>
            <div className={s.header}>
                <h1 className={s.title}>Favorite Movies</h1>
                <div className={s.favoritesCount}>
                    {favoriteIds.length} {favoriteIds.length === 1 ? 'movie' : 'movies'}
                </div>
            </div>

            <div className={s.moviesGrid}>
                {favoriteIds.map((movieId) => (
                    <FavoriteMovieItem
                        key={movieId}
                        movieId={movieId}
                        onMovieClick={handleMovieClick}
                        onToggleFavorite={handleToggleFavorite}
                        renderStars={renderStars}
                    />
                ))}
            </div>
        </div>
    );
};

// Компонент для загрузки деталей фильма по ID
const FavoriteMovieItem = ({
                               movieId,
                               onMovieClick,
                               onToggleFavorite,
                               renderStars
                           }: {
    movieId: number;
    onMovieClick: (movieId: number) => void;
    onToggleFavorite: (movieId: number, e: React.MouseEvent) => void;
    renderStars: (rating: number) => JSX.Element[];
}) => {
    const { data: movie, isLoading } = useGetMovieDetailsQuery(movieId);

    if (isLoading) {
        return (
            <div className={s.movieCard}>
                <div className={s.loadingPlaceholder}>
                    <div className={s.loadingSpinner}></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!movie) return null;

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
                className={`${s.favoriteButton} ${s.active}`}
                onClick={(e) => onToggleFavorite(movie.id, e)}
            >
                <span className={s.heartIcon}>❤</span>
            </button>

            <div className={s.movieInfo}>
                <h3 className={s.movieTitle}>{movie.title}</h3>
                {movie.original_title !== movie.title && (
                    <p className={s.movieOriginalTitle}>{movie.original_title}</p>
                )}

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