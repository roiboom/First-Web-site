'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { fr } from './i18n/fr';
import { en } from './i18n/en';
import { ar } from './i18n/ar';

const LanguageContext = createContext();

const translations = { fr, en, ar };

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('fr'); // Default to French
    const [dir, setDir] = useState('ltr');

    useEffect(() => {
        const savedLang = localStorage.getItem('portal-lang') || 'fr';
        setLanguage(savedLang);
        updateDocument(savedLang);
    }, []);

    const updateDocument = (lang) => {
        const direction = lang === 'ar' ? 'rtl' : 'ltr';
        setDir(direction);
        document.documentElement.lang = lang;
        document.documentElement.dir = direction;
        localStorage.setItem('portal-lang', lang);
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
        updateDocument(lang);
    };

    const t = translations[language] || translations.fr;

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, dir }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
