import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/constants';
import { getCookie, deleteCookie } from '../utils/cookieUtils';
import { useTranslation } from 'react-i18next';
import '../i18n'; // Asegúrate que i18n se inicializa

const MainLayout = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const currentLanguage = i18n.language;

    const availableLanguages = {
        en: { name: t('navbar.userMenu.languages.en') },
        es: { name: t('navbar.userMenu.languages.es') },
        ca: { name: t('navbar.userMenu.languages.ca') },
    };

    const [userData, setUserData] = useState(null);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true); // Renombrado para evitar conflicto
    const [userError, setUserError] = useState(''); // Renombrado para evitar conflicto
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = getCookie('userToken');
            if (!token) {
                setIsLoadingUserData(false);
                navigate('/login'); // Redirige si no hay token
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
                setUserError(err.message || t('dashboard.loadUserDataError'));
                deleteCookie('userToken');
                navigate('/login');
            } finally {
                setIsLoadingUserData(false);
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

    const handleLogout = () => {
        deleteCookie('userToken');
        navigate('/login');
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsUserMenuOpen(false);
    };

    const getLinkClass = (path) => {
        const baseClass = "block py-2 px-3 rounded-sm md:p-0";
        const activeClass = "text-white bg-blue-700 md:bg-transparent md:text-blue-700 dark:text-white md:dark:text-blue-500";
        const inactiveClass = "text-gray-900 hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent";
        return `${baseClass} ${location.pathname === path ? activeClass : inactiveClass}`;
    };

    if (isLoadingUserData) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-xl">{t('common.loading')}</p></div>;
    }
    if (userError) {
         return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
                 <p className="font-bold">{t('common.error')}</p><p>{userError}</p>
             </div>
         </div>;
    }

    return (
        <>
            <nav className="bg-white border-gray-200 dark:bg-gray-900 sticky top-0 z-50">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <Link to="/dashboard" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Shoplist Wiz</span>
                    </Link>
                    <button onClick={toggleMobileMenu} type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded={isMobileMenuOpen}>
                        <span className="sr-only">{t('navbar.openMainMenu')}</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" /></svg>
                    </button>
                    <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-default">
                        <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:items-center md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                            <li><Link to="/dashboard" className={getLinkClass("/dashboard")} aria-current={location.pathname === "/dashboard" ? "page" : undefined}>{t('navbar.home')}</Link></li>
                            <li><Link to="/ingredients" className={getLinkClass("/ingredients")}>{t('navbar.ingredients')}</Link></li>
                            <li><Link to="/recipes" className={getLinkClass("/recipes")}>{t('navbar.recipes')}</Link></li>
                            <li className="relative" ref={userMenuRef}>
                                <button type="button" onClick={toggleUserMenu} className="flex text-sm bg-gray-100 rounded-full p-1 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 md:ml-0" id="user-menu-button" aria-expanded={isUserMenuOpen}>
                                    <span className="sr-only">{t('navbar.userMenu.open')}</span>
                                    <svg className="w-8 h-8 rounded-full text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                                </button>
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 dark:divide-gray-600 z-50" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                                        <div className="px-4 py-3"><span className="block text-sm text-gray-900 dark:text-white">{userData?.name || t('navbar.userMenu.defaultName')}</span><span className="block text-sm text-gray-500 truncate dark:text-gray-400">{userData?.email || t('navbar.userMenu.defaultEmail')}</span></div>
                                        <ul className="py-1" role="none"><li><a href="#" onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); /* navigate('/profile') */ }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" role="menuitem">{t('navbar.userMenu.profile')}</a></li></ul>
                                        <div className="py-1"><span className="block px-4 py-2 text-xs text-gray-400 dark:text-gray-500">{t('navbar.userMenu.language')}</span>
                                            {Object.keys(availableLanguages).map((lng) => (<button key={lng} onClick={() => changeLanguage(lng)} className={`block w-full text-left px-4 py-2 text-sm ${currentLanguage === lng ? 'font-semibold text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-600' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white`} role="menuitem" >{availableLanguages[lng].name}</button>))}
                                        </div>
                                        <ul className="py-1" role="none"><li><button onClick={() => { handleLogout(); setIsUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white" role="menuitem">{t('common.logout')}</button></li></ul>
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <main>
                <Outlet /> {/* Aquí se renderizará el contenido de la página actual */}
            </main>
        </>
    );
};

export default MainLayout;