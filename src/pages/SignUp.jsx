import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/constants'; // Asegúrate que esta ruta es correcta y que API_ENDPOINTS.SIGNUP es 'http://localhost:8081/api/signup'
import { setCookie, getCookie } from '../utils/cookieUtils'; // Asegúrate que esta ruta es correcta y que setCookie está definido
import { useTranslation } from 'react-i18next';

const SignUp = () => {
	const { t } = useTranslation();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState(''); // Para feedback de éxito
	const [isLoading, setIsLoading] = useState(false); // Para feedback de carga
	const navigate = useNavigate();

	useEffect(() => {
		// Verificar si ya hay un token en las cookies
		const token = getCookie('userToken');
		if (token) {
			// Si el token existe, redirigir al dashboard
			navigate('/dashboard');
		}
	}
		, [navigate]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prevState => ({
			...prevState,
			[name]: value
		}));
		// Limpiar errores al empezar a escribir de nuevo
		if (error) setError('');
		if (successMessage) setSuccessMessage('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccessMessage('');
		setIsLoading(true);

		if (formData.password !== formData.confirmPassword) {
			setError(t('signup.passwordsDoNotMatch'));
			setIsLoading(false);
			return;
		}

		// Validaciones adicionales básicas (puedes expandirlas)
		if (formData.password.length < 8) {
			setError(t('signup.passwordTooShort', { minLength: 8 }));
			setIsLoading(false);
			return;
		}

		try {
			const payload = {
				name: formData.name,
				email: formData.email,
				password: formData.password,
				roles: ['user'], // O ['admin'] si es lo que necesitas, o hacerlo configurable si es necesario.
				// Para un signup general, 'user' suele ser el rol por defecto.
			};

			const response = await fetch(API_ENDPOINTS.SIGNUP, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			const data = await response.json(); // Intenta parsear JSON incluso si hay error, a veces el error viene en JSON

			if (!response.ok) {
				// data.message es común, pero podría ser data.error u otra estructura
				throw new Error(data.message || data.error || t('signup.registrationError', { statusCode: response.status }));
			}

			setSuccessMessage(t('signup.registrationSuccess'));
			console.log('Signup successful:', data);
			// Podrías resetear el formulario o redirigir al usuario
			setFormData({
				name: '', // Corregido de userName a name para coincidir con el estado inicial
				email: '',
				password: '',
				confirmPassword: '',
			});
			// Ejemplo de redirección (necesitarías react-router-dom y su hook useNavigate):
			// const navigate = useNavigate();
			// navigate('/login');
			setCookie('userToken', data.value, 30); // Guardar el token en cookies por 7 días
			navigate('/dashboard'); // Redirigir a la página de dashboard

		} catch (err) {
			setError(err.message || t('signup.genericError'));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
			{/* Flecha para volver a la página principal */}
			<Link to="/" className="absolute top-6 left-6 text-indigo-600 hover:text-indigo-800 transition-colors duration-200 z-10" title={t('common.backToHome')}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
					<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
				</svg>
			</Link>
			<div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						{t('signup.pageTitle')}
					</h2>
				</div>
				{successMessage && <p className="mt-2 text-center text-sm text-green-600">{successMessage}</p>}
				{error && !successMessage && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="name" className="sr-only">{t('signup.nameLabel')}</label>
							<input
								id="name"
								name="name"
								type="text"
								autoComplete="name"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder={t('signup.namePlaceholder')}
								value={formData.name}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label htmlFor="email-address" className="sr-only">{t('signup.emailLabel')}</label>
							<input
								id="email-address"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder={t('signup.emailPlaceholder')}
								value={formData.email}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">{t('signup.passwordLabel')}</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder={t('signup.passwordPlaceholder')}
								value={formData.password}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label htmlFor="confirmPassword" className="sr-only">{t('signup.confirmPasswordLabel')}</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder={t('signup.confirmPasswordPlaceholder')}
								value={formData.confirmPassword}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
						>
							{isLoading ? t('signup.submitButtonLoading') : t('signup.submitButton')}
						</button>
					</div>
				</form>
				<p className="mt-2 text-center text-sm text-gray-600">
					{t('signup.alreadyHaveAccount')}{' '}
					<Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
						{t('signup.loginLink')}
					</Link>
				</p>
			</div>
		</div>
	);
};

export default SignUp;