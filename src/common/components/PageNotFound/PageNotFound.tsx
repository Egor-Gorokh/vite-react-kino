import s from './PageNotFound.module.css'
import { Link } from 'react-router-dom'

export const PageNotFound = () => {
    return (
        <div className={s.container}>
            <h1 className={s.title}>404</h1>
            <h2 className={s.subtitle}>page not found</h2>
            <Link to="/" className={s.button}>
                На главную
            </Link>
        </div>
    )
}