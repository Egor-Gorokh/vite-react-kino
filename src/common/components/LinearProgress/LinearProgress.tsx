// components/LinearProgress/LinearProgress.tsx
import s from './LinearProgress.module.css';

export const LinearProgress = () => {
    return (
        <div className={s.linearProgress}>
            <div className={s.progressBar}>
                <div className={s.progressIndicator}></div>
            </div>
        </div>
    );
};