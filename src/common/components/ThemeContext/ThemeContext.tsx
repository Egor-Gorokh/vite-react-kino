import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
    isDarkTheme: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Получаем тему из localStorage или используем темную тему по умолчанию
    const getInitialTheme = (): boolean => {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme !== null) {
                return JSON.parse(savedTheme);
            }
        } catch (error) {
            console.warn('Ошибка при чтении темы из localStorage:', error);
        }

        // Если в localStorage ничего нет, используем темную тему по умолчанию
        // или можно проверить предпочтения системы:
        // return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return true;
    };

    const [isDarkTheme, setIsDarkTheme] = useState<boolean>(getInitialTheme);

    // Сохраняем тему в localStorage при изменении
    useEffect(() => {
        try {
            localStorage.setItem('theme', JSON.stringify(isDarkTheme));
        } catch (error) {
            console.warn('Ошибка при сохранении темы в localStorage:', error);
        }
    }, [isDarkTheme]);

    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme);
    };

    return (
        <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};