// features/favorites/FavoritesPage.tsx
import { useSelector } from 'react-redux';
import { selectFavoriteIds } from './favoritesSlice';
import { useGetMovieDetailsQuery } from '../movies/api/moviesApi';

export const FavoritesPage = () => {
    const favoriteIds = useSelector(selectFavoriteIds);

    return (
        <div>
            <h1>Favorite Movies</h1>
            {favoriteIds.map(movieId => (
                <FavoriteMovieItem key={movieId} movieId={movieId} />
            ))}
        </div>
    );
};

// Компонент для загрузки деталей фильма по ID
const FavoriteMovieItem = ({ movieId }: { movieId: number }) => {
    const { data: movie, isLoading } = useGetMovieDetailsQuery(movieId);

    if (isLoading) return <div>Loading...</div>;
    if (!movie) return null;

    return (
        <div>
            <h3>{movie.title}</h3>
            <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
            />
        </div>
    );
};