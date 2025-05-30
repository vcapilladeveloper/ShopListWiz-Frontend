// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importa tus archivos de traducción
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationCA from './locales/ca/translation.json';

const resources = {
    en: {
        translation: translationEN
    },
    es: {
        translation: translationES
    },
    ca: {
        translation: translationCA
    }
};

i18n
    .use(LanguageDetector) // Detecta el idioma del usuario
    .use(initReactI18next) // Pasa i18nลงไปยัง react-i18next
    .init({
        resources,
        fallbackLng: 'es', // Idioma por defecto si el detectado no está disponible
        debug: process.env.NODE_ENV === 'development', // Muestra logs en desarrollo
        interpolation: {
            escapeValue: false // React ya protege contra XSS
        },
        detection: {
            // Orden y desde dónde detectar el idioma
            order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            // Clave para guardar en localStorage
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        }
    });

export default i18n;
