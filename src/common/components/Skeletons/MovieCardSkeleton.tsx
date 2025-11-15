// components/Skeletons/MovieCardSkeleton.tsx
import s from './MovieCardSkeleton.module.css';

export const MovieCardSkeleton = () => {
    return (
        <div className={s.skeletonCard}>
            <div className={s.skeletonImage}></div>
            <div className={s.skeletonContent}>
                <div className={s.skeletonTitle}></div>
                <div className={s.skeletonSubtitle}></div>
                <div className={s.skeletonRating}></div>
            </div>
        </div>
    );
};