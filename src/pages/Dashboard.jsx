import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/constants'; // Asegúrate que esta ruta es correcta y que API_ENDPOINTS.ME existe
import { getCookie, deleteCookie } from '../utils/cookieUtils';
import { useTranslation } from 'react-i18next';
import '../i18n';

const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const availableLanguages = {
        en: { name: t('navbar.userMenu.languages.en') },
        es: { name: t('navbar.userMenu.languages.es') },
        ca: { name: t('navbar.userMenu.languages.ca') },
    };
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = getCookie('userToken');
            if (!token) {
                setIsLoading(false);
                navigate('/');
                return;
            }

            try {
                if (!API_ENDPOINTS.ME) {
                    throw new Error(t('dashboard.apiConfigError'));
                }

                const response = await fetch(API_ENDPOINTS.ME, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        deleteCookie('userToken');
                        navigate('/login');
                        return;
                    }
                    throw new Error(data.message || t('dashboard.fetchUserError', { statusCode: response.status }));
                }

                setUserData(data);
            } catch (err) {
                setError(err.message || t('dashboard.loadUserDataError'));
                deleteCookie('userToken');
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate, t]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-xl">{t('common.loading')}</p></div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
                    <p className="font-bold">{t('common.error')}</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        deleteCookie('userToken');
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsUserMenuOpen(false);
    };

    return (
        <>
            <nav className="bg-white border-gray-200 dark:bg-gray-900">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        {/* <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt={t('navbar.altLogo')} /> */}
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Shoplist Wiz</span>
                    </a>
                    {/* Botón de hamburguesa (visible en <md, oculto en >=md) */}
                    <button
                        onClick={toggleMobileMenu}
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        aria-controls="navbar-default"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <span className="sr-only">{t('navbar.openMainMenu')}</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>
                    {/* Main Navigation Links */}
                    <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
                        <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:items-center md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                            <li>
                                <a href="#" className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 dark:text-white md:dark:text-blue-500" aria-current="page">{t('navbar.home')}</a>
                            </li>
                            <li>
                                <a href="#" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">{t('navbar.about')}</a>
                            </li>
                            <li>
                                <a href="#" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">{t('navbar.services')}</a>
                            </li>
                            <li>
                                <a href="#" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">{t('navbar.pricing')}</a>
                            </li>
                            <li>
                                <a href="#" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">{t('navbar.contact')}</a>
                            </li>
                            {/* User Menu Dropdown Button como un elemento de la lista */}
                            <li className="relative" ref={userMenuRef}>
                                <button
                                    type="button"
                                    onClick={toggleUserMenu}
                                    className="flex text-sm bg-gray-100 rounded-full p-1 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 md:ml-0" // md:ml-0 para anular cualquier margen heredado si es necesario
                                    id="user-menu-button"
                                    aria-expanded={isUserMenuOpen}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <svg className="w-8 h-8 rounded-full text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                                </button>
                                {/* User Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600 z-50" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                                        <div className="px-4 py-3">
                                            <span className="block text-sm text-gray-900 dark:text-white">{userData?.name || t('navbar.userMenu.defaultName')}</span>
                                            <span className="block text-sm text-gray-500 truncate dark:text-gray-400">{userData?.email || t('navbar.userMenu.defaultEmail')}</span>
                                        </div>
                                        <ul className="py-1" role="none">
                                            <li>
                                                <a href="#" onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); /* Lógica para ir a Profile */ }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" role="menuitem">{t('navbar.userMenu.profile')}</a>
                                            </li>
                                        </ul>
                                        {/* Language Switcher */}
                                        <div className="py-1">
                                            <span className="block px-4 py-2 text-xs text-gray-400 dark:text-gray-500">{t('navbar.userMenu.language')}</span>
                                            {Object.keys(availableLanguages).map((lng) => (
                                                <button
                                                    key={lng}
                                                    onClick={() => changeLanguage(lng)}
                                                    className={`block w-full text-left px-4 py-2 text-sm ${currentLanguage === lng ? 'font-semibold text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-600' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white`}
                                                    role="menuitem"
                                                >
                                                    {availableLanguages[lng].name}
                                                </button>
                                            ))}
                                        </div>
                                        <ul className="py-1" role="none">
                                            <li>
                                                <button onClick={() => { handleLogout(); setIsUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" role="menuitem">{t('common.logout')}</button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.pageTitle')}</h1>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            {t('common.logout')}
                        </button>
                    </div>
                    {userData && (
                        <div className="space-y-4">
                            <p className="text-lg"><span className="font-semibold">{t('dashboard.labels.name')}</span> {userData.name}</p>
                            +                            <p className="text-lg"><span className="font-semibold">{t('dashboard.labels.email')}</span> {userData.email}</p>
                            {/* <p className="text-lg"><span className="font-semibold">ID de Usuario:</span> {userData.id}</p> */} {/* Opcional mostrar ID */}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;