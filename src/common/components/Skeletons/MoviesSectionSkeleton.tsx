// components/Skeletons/MoviesSectionSkeleton.tsx
import s from './MoviesSectionSkeleton.module.css';
import { MovieCardSkeleton } from './MovieCardSkeleton';

export const MoviesSectionSkeleton = () => {
    return (
        <div className={s.skeletonSection}>
            <div className={s.skeletonHeader}>
                <div className={s.skeletonSectionTitle}></div>
                <div className={s.skeletonViewMore}></div>
            </div>
            <div className={s.skeletonGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <MovieCardSkeleton key={index} />
                ))}
            </div>
        </div>
    );
};