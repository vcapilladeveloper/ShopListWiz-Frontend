import React, { useState } from 'react';
import { Link }
	from 'react-router-dom';
import { API_ENDPOINTS } from '../config/constants';
import { useTranslation } from 'react-i18next';

const ResetPassword = () => {
	const { t } = useTranslation();

	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage('');
		setError('');




		if (!API_ENDPOINTS.REQUEST_RESET) {
			setError(t('resetPassword.endpointMissing'));
			setIsLoading(false);
			return;
		}

		try {
			const url = new URL(API_ENDPOINTS.REQUEST_RESET);
			url.searchParams.append('email', email);

			const response = await fetch(url.toString(), {
				method: 'GET',
			});

			if (!response.ok) {

				let errorMessage = t('resetPassword.requestFailed');
				try {
					const errorData = await response.json();
					if (errorData && errorData.message) {
						errorMessage = errorData.message;
					} else {

						errorMessage = t('resetPassword.serverError', { statusCode: response.status, statusText: response.statusText || t('resetPassword.unknownServerError') });
					}
				} catch (e) {

					errorMessage = t('resetPassword.invalidResponse', { statusCode: response.status, statusText: response.statusText || t('resetPassword.unknownServerError') });
					console.error("La respuesta de error no era JSON válido o estaba vacía:", e);
				}
				throw new Error(errorMessage);
			}





			setMessage(t('resetPassword.successMessage'));
			setEmail('');
		} catch (err) {
			setError(err.message || t('resetPassword.genericError'));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
			<Link to="/" className="absolute top-6 left-6 text-indigo-600 hover:text-indigo-800 transition-colors duration-200 z-10" title={t('common.backToHome')}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
					<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
				</svg>
			</Link>
			<div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('resetPassword.pageTitle')}</h2>
					<p className="mt-2 text-center text-sm text-gray-600">{t('resetPassword.instructions')}</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					{message && <p className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}
					{error && <p className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
					<div>
						<label htmlFor="email-address" className="sr-only">{t('resetPassword.emailLabel')}</label>
						<input
							id="email-address"
							name="email"
							type="email"
							autoComplete="email"
							required
							className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder={t('resetPassword.emailPlaceholder')}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div>
						<button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
							{isLoading ? t('resetPassword.submitButtonLoading') : t('resetPassword.submitButton')}
						</button>
					</div>
				</form>
				<p className="mt-4 text-center text-sm text-gray-600">
					{t('resetPassword.rememberedPassword')}{' '} <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">{t('resetPassword.loginLink')}</Link>
				</p>
			</div>
		</div>
	);
};

export default ResetPassword;