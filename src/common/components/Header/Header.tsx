import s from './Header.module.css';
import logo from '../../../assets/images/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg'
import { useTheme } from '../ThemeContext/ThemeContext.tsx';

export const Header = () => {
    const { isDarkTheme, toggleTheme } = useTheme();

    return (
        <header className={s.header}>
            <div className={s.logo}>
                <a href={'/'}>  <img src={logo} alt="TMDB Logo"/></a>
            </div>
            <div className={s.menu}>
                <nav>
                    <li><a href={'/'}>Main</a></li>
                    <li><a href={'/categoryMovies'}>Category movies</a></li>
                    <li><a href={'/filteredMovies'}>Filtered movies</a></li>
                    <li><a href={'/search'}>Search</a></li>
                    <li><a href={'/favorites'}>Favorites</a></li>
                </nav>
            </div>
            <div className={s.day}>
                <button onClick={toggleTheme}>
                    {isDarkTheme ? '🌙 Dark' : '☀️ Light'}
                </button>
            </div>
        </header>
    )
}