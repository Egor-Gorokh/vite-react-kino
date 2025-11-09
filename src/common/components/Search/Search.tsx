import s from './Search.module.css';

interface SearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onClearSearch?: () => void;
    placeholder?: string;
    className?: string;
}

export const Search = ({
                           searchQuery,
                           onSearchChange,
                           onSearchSubmit,
                           onClearSearch,
                           placeholder = "Search for a movie",
                           className = ''
                       }: SearchProps) => {

    const handleClear = () => {
        onSearchChange('');
        if (onClearSearch) {
            onClearSearch();
        }
    };

    return (
        <div className={`${s.search} ${className}`}>
            <form className={s.searchForm} onSubmit={onSearchSubmit}>
                <div className={s.searchContainer}>
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={s.searchInput}
                    />

                    {/* Кнопка очистки */}
                    {searchQuery && (
                        <button
                            type="button"
                            className={s.clearButton}
                            onClick={handleClear}
                            aria-label="Clear search"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    )}

                    <button
                        type="submit"
                        className={s.searchButton}
                        disabled={!searchQuery.trim()}
                    >
                        Search
                    </button>
                </div>
            </form>
        </div>
    );
};