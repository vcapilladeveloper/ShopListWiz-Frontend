import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/constants'; // Asumimos que tendrás un endpoint para esto

const SetNewPassword = ({ token }) => {
	const navigate = useNavigate();
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!token) {
			setError('Token de restablecimiento no válido o ausente.');
			// Opcionalmente redirigir si no hay token
			// setTimeout(() => navigate('/login'), 3000);
		} else {
			// Si el token (prop) existe, limpiar cualquier mensaje de error previo.
			setError('');
		}
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		// Limpiar mensajes de estado antes de cualquier validación o lógica
		setMessage('');
		setError('');

		// Validar usando el token de la prop
		if (!token) {
			setError('Token de restablecimiento no válido o ausente. No se puede enviar el formulario.');
			return;
		}
		if (password !== confirmPassword) {
			setError('Las contraseñas no coinciden.');
			return;
		}
		if (password.length < 8) {
			setError('La contraseña debe tener al menos 8 caracteres.');
			return;
		}

		// Asumimos un endpoint como API_ENDPOINTS.RESET_PASSWORD
		// Deberás añadirlo a tu archivo constants.js, ej:
		// SET_NEW_PASSWORD: `${API_BASE_URL}/password/set-new`
		if (!API_ENDPOINTS.RESET_PASSWORD) {
			setError("La funcionalidad de establecer nueva contraseña no está configurada (endpoint no definido).");
			setIsLoading(false);
			return;
		}
		setIsLoading(true);
		try {
			const response = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token, password }), // Enviar token y nueva contraseña
			});

			if (!response.ok) {
				// Intentar leer el cuerpo del error como JSON solo si la respuesta no fue ok
				let errorMessage = 'No se pudo restablecer la contraseña.';
				try {
					const errorData = await response.json();
					if (errorData && errorData.message) {
						errorMessage = errorData.message;
					} else {
						errorMessage = `Error ${response.status}: ${response.statusText || 'Error desconocido del servidor.'}`;
					}
				} catch (e) {
					// Si el cuerpo del error no es JSON o está vacío
					errorMessage = `Error ${response.status}: ${response.statusText || 'Respuesta no válida del servidor.'}`;
					console.error("La respuesta de error no era JSON válido o estaba vacía:", e);
				}
				throw new Error(errorMessage);
			}
			// Si response.ok es true, la operación fue exitosa. No es necesario parsear JSON si el backend no envía cuerpo.
			setMessage('Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión.');
			setPassword('');
			setConfirmPassword('');
			setTimeout(() => navigate('/login'), 3000); // Redirigir a login después de un tiempo
		} catch (err) {
			setError(err.message || 'Ocurrió un error. Inténtalo de nuevo.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
			{/* Flecha para volver a la página principal */}
			<Link to="/" className="absolute top-6 left-6 text-indigo-600 hover:text-indigo-800 transition-colors duration-200 z-10" title="Volver a la página principal">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
					<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
				</svg>
			</Link>
			<div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Establecer Nueva Contraseña
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					{message && <p className="text-center text-sm text-green-600 bg-green-50 p-3 rounded-md">{message}</p>}
					{error && <p className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
					{!token && <p className="text-center text-sm text-red-600">Enlace no válido o expirado.</p>}
					{token && (
						<>
							<div>
								<label htmlFor="password_id" className="sr-only">Nueva Contraseña</label>
								<input id="password_id" name="password" type="password" required className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Nueva Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
							</div>
							<div>
								<label htmlFor="confirm-password_id" className="sr-only">Confirmar Nueva Contraseña</label>
								<input id="confirm-password_id" name="confirmPassword" type="password" required className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Confirmar Nueva Contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
							</div>
							<div>
								<button type="submit" disabled={isLoading || !token} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
									{isLoading ? 'Estableciendo...' : 'Establecer Nueva Contraseña'}
								</button>
							</div>
						</>
					)}
				</form>
				<p className="mt-4 text-center text-sm text-gray-600">
					<Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Volver a Iniciar sesión</Link>
				</p>
			</div>
		</div>
	);
};

export default SetNewPassword;