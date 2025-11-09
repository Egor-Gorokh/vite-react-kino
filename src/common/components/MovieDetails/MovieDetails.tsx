import s from './MovieDetails.module.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useGetMovieDetailsQuery,
    useGetMovieCreditsQuery,
    useGetMovieImagesQuery,
    useGetMovieRecommendationsQuery,
    useGetMovieVideosQuery
} from '../../../features/movies/api/moviesApi.ts';

export const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeImageTab, setActiveImageTab] = useState<'backdrops' | 'posters'>('backdrops');

    const movieId = parseInt(id!);

    // Запросы для получения данных о фильме
    const { data: movie, isLoading: movieLoading, error: movieError } = useGetMovieDetailsQuery(movieId);
    const { data: credits, isLoading: creditsLoading } = useGetMovieCreditsQuery(movieId);
    const { data: images, isLoading: imagesLoading } = useGetMovieImagesQuery(movieId);
    const { data: recommendations, isLoading: recommendationsLoading } = useGetMovieRecommendationsQuery(movieId);
    const { data: videos, isLoading: videosLoading } = useGetMovieVideosQuery(movieId);

    // Проверяем есть ли трейлер
    const trailer = videos?.results?.find(video =>
        video.type === 'Trailer' && video.site === 'YouTube'
    );

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleGoBack = () => {
        navigate(-1); // Возврат на предыдущую страницу
    };

    const formatRuntime = (minutes: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatCurrency = (amount: number) => {
        if (!amount || amount === 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    // Скролл к верху при загрузке
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [movieId]);

    if (movieLoading) {
        return <div className={s.loading}>Loading movie details...</div>;
    }

    if (movieError || !movie) {
        return (
            <div className={s.error}>
                <h2>Error loading movie details</h2>
                <p>Please try again later.</p>
                <button onClick={handleGoBack} className={s.backButton}>
                    Go Back
                </button>
            </div>
        );
    }

    const director = credits?.crew?.find(person => person.job === 'Director');
    const mainCast = credits?.cast?.slice(0, 12) || [];
    const backdrops = images?.backdrops?.slice(0, 10) || [];
    const posters = images?.posters?.slice(0, 10) || [];
    const recommendationMovies = recommendations?.results?.slice(0, 8) || [];

    return (
        <div className={s.movieDetails}>
            {/* Hero секция с бэкдропом и основной информацией */}
            <div className={s.movieHero}>
                {movie.backdrop_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
                        alt={movie.title}
                        className={s.backdropImage}
                    />
                ) : (
                    <div className={s.backdropPlaceholder}></div>
                )}
                <div className={s.heroOverlay}></div>

                {/* Кнопка назад в правом верхнем углу */}
                <button className={s.backButton} onClick={handleGoBack}>
                    ← Back
                </button>

                <div className={s.heroContent}>
                    <div className={s.posterContainer}>
                        <img
                            src={movie.poster_path
                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                : '/placeholder-poster.jpg'
                            }
                            alt={movie.title}
                            className={s.poster}
                        />
                    </div>

                    <div className={s.movieInfo}>
                        <h1 className={s.movieTitle}>{movie.title}</h1>
                        {movie.original_title !== movie.title && (
                            <p className={s.movieOriginalTitle}>{movie.original_title}</p>
                        )}

                        <div className={s.actions}>
                            {trailer && (
                                <button
                                    className={`${s.actionButton} ${s.watchTrailer}`}
                                    onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                                >
                                    <span>▶</span>
                                    Watch Trailer
                                </button>
                            )}
                            <button
                                className={`${s.actionButton} ${s.addToFavorites}`}
                                onClick={toggleFavorite}
                            >
                                <span>{isFavorite ? '❤' : '🤍'}</span>
                                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                            </button>
                        </div>

                        <div className={s.movieMeta}>
                            <div className={s.metaItem}>
                                <span className={s.metaLabel}>Release Date</span>
                                <span className={s.metaValue}>{formatDate(movie.release_date)}</span>
                            </div>

                            <div className={s.metaItem}>
                                <span className={s.metaLabel}>Rating</span>
                                <div className={s.rating}>
                                    <div className={s.ratingStars}>
                                        {renderStars(movie.vote_average)}
                                    </div>
                                    <span>{movie.vote_average.toFixed(1)}/10</span>
                                </div>
                            </div>

                            <div className={s.metaItem}>
                                <span className={s.metaLabel}>Runtime</span>
                                <span className={s.metaValue}>{formatRuntime(movie.runtime)}</span>
                            </div>

                            {movie.budget > 0 && (
                                <div className={s.metaItem}>
                                    <span className={s.metaLabel}>Budget</span>
                                    <span className={s.metaValue}>{formatCurrency(movie.budget)}</span>
                                </div>
                            )}

                            {movie.revenue > 0 && (
                                <div className={s.metaItem}>
                                    <span className={s.metaLabel}>Revenue</span>
                                    <span className={s.metaValue}>{formatCurrency(movie.revenue)}</span>
                                </div>
                            )}

                            {director && (
                                <div className={s.metaItem}>
                                    <span className={s.metaLabel}>Director</span>
                                    <span className={s.metaValue}>{director.name}</span>
                                </div>
                            )}
                        </div>

                        <div className={s.genres}>
                            {movie.genres?.map(genre => (
                                <span key={genre.id} className={s.genre}>
                                    {genre.name}
                                </span>
                            ))}
                        </div>

                        <p className={s.overview}>{movie.overview || 'No overview available.'}</p>
                    </div>
                </div>
            </div>

            {/* Основной контент */}
            <div className={s.movieContent}>
                {/* Актерский состав */}
                {mainCast.length > 0 && (
                    <section className={s.section}>
                        <h2 className={s.sectionTitle}>Cast</h2>
                        <div className={s.castGrid}>
                            {mainCast.map(actor => (
                                <div key={actor.id} className={s.castCard}>
                                    <img
                                        src={actor.profile_path
                                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                            : '/placeholder-actor.jpg'
                                        }
                                        alt={actor.name}
                                        className={s.castPhoto}
                                        onError={(e) => {
                                            e.currentTarget.src = '/placeholder-actor.jpg';
                                        }}
                                    />
                                    <div className={s.castInfo}>
                                        <div className={s.castName}>{actor.name}</div>
                                        <div className={s.castCharacter}>{actor.character}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Рекомендации */}
                {recommendationMovies.length > 0 && (
                    <section className={s.section}>
                        <h2 className={s.sectionTitle}>Recommendations</h2>
                        <div className={s.recommendationsGrid}>
                            {recommendationMovies.map(recommendation => (
                                <div
                                    key={recommendation.id}
                                    className={s.recommendationCard}
                                    onClick={() => navigate(`/movie/${recommendation.id}`)}
                                >
                                    <img
                                        src={recommendation.poster_path
                                            ? `https://image.tmdb.org/t/p/w500${recommendation.poster_path}`
                                            : '/placeholder-poster.jpg'
                                        }
                                        alt={recommendation.title}
                                        className={s.recommendationPoster}
                                        onError={(e) => {
                                            e.currentTarget.src = '/placeholder-poster.jpg';
                                        }}
                                    />
                                    <div className={s.recommendationInfo}>
                                        <div className={s.recommendationTitle}>{recommendation.title}</div>
                                        <div className={s.recommendationRating}>
                                            <div className={s.ratingStars}>
                                                {renderStars(recommendation.vote_average)}
                                            </div>
                                            <span>{recommendation.vote_average.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};