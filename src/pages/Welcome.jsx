import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/cookieUtils';
import { useTranslation } from 'react-i18next';

const Welcome = () => {
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();
	const currentLanguage = i18n.language;

	const availableLanguages = {
		en: { name: t('navbar.userMenu.languages.en') },
		es: { name: t('navbar.userMenu.languages.es') },
		ca: { name: t('navbar.userMenu.languages.ca') },
	};
	useEffect(() => {
		const token = getCookie('userToken');
		if (token) {
		
			navigate('/dashboard');
		}
	}, [navigate]);

	const changeLanguage = (lng) => {
		i18n.changeLanguage(lng);
	};

	return (
		<div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center text-white p-6 relative">
			<div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
				<div className="flex space-x-1 md:space-x-2">
					{Object.keys(availableLanguages).map((lng) => (
						<button
							key={lng}
							onClick={() => changeLanguage(lng)}
							className={`px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-medium rounded-md transition-colors duration-200
										${currentLanguage === lng
											? 'bg-white text-indigo-600 shadow-md'
											: 'bg-transparent text-white hover:bg-white hover:bg-opacity-20 border border-white border-opacity-50 hover:border-opacity-75'
										}`}
						>
							{availableLanguages[lng].name}
						</button>
					))}
				</div>
			</div>
			<div className="text-center max-w-2xl">
				<h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
					{t('welcome.title')}
				</h1>
				<p className="text-xl md:text-2xl text-indigo-100 mb-10 drop-shadow-md">
					{t('welcome.subtitle')}
				</p>
				<div className="space-y-4 md:space-y-0 md:space-x-6">
					<Link
						to="/login"
						className="inline-block bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-50 transition duration-300 ease-in-out transform hover:-translate-y-1 text-lg">
						{t('welcome.loginButton')}
					</Link>
					<Link
						to="/signup"
						className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 text-lg">
						{t('welcome.signupButton')}
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Welcome; 