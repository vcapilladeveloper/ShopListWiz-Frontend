import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/constants'; // Asegúrate que esta ruta es correcta
import { setCookie, getCookie } from '../utils/cookieUtils';


const Login = () => {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [error, setError] = useState('');
	const [cargando, setCargando] = useState(false); // Añadido para feedback al usuario
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
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setCargando(true); // Inicia la carga

		try {
			// Codificar las credenciales para la Autenticación Básica
			const credentials = `${formData.email}:${formData.password}`;
			const encodedCredentials = btoa(credentials); // btoa codifica a Base64
			const response = await fetch(API_ENDPOINTS.LOGIN, { // Usar la URL base del endpoint
				method: 'GET',
				// headers: {
				//   'Content-Type': 'application/json', // No es necesario para GET sin body
				// },
				// body: JSON.stringify(formData), // <<-- ESTO SE ELIMINA PARA GET
				headers: {
					'Authorization': `Basic ${encodedCredentials}`,
					'Content-Type': 'application/json', // Como se especifica en el ejemplo de cURL
				},
				// Para una solicitud GET, no se envía 'body'.
				// El '--data-raw ""' en cURL para GET generalmente significa que no hay cuerpo.
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Login failed');
			}

			console.log('Login successful:', data);
			// Aquí deberías manejar la respuesta exitosa, por ejemplo:
			// - Guardar el token de usuario (si lo devuelve la API)
			// - Redirigir al usuario a otra página
			// Ejemplo: localStorage.setItem('userToken', data.token);
			//          history.push('/dashboard'); // Si usas useHistory de react-router-dom v5 o navigate en v6
			setCookie('userToken', data.value, 30); // Guardar el token en una cookie por 7 días
			navigate('/dashboard'); // Redirigir a la página de dashboard

		} catch (err) {
			setError(err.message || 'Ocurrió un error desconocido.'); // Mensaje de error más genérico si err.message no existe
		} finally {
			setCargando(false); // Finaliza la carga
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
						Inicia sesión en tu cuenta
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<input type="hidden" name="remember" defaultValue="true" />
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email-address" className="sr-only">Email address</label>
							<input
								id="email-address"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Correo electrónico"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">Password</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Contraseña"
								value={formData.password}
								onChange={handleChange}
							/>
						</div>
					</div>
					<div className="flex items-center justify-end">
						<div className="text-sm">
							<Link to="/reset-password" // Enlace a la página de reseteo
								className="font-medium text-indigo-600 hover:text-indigo-500">
								¿Olvidaste tu contraseña?
							</Link>
						</div>
					</div>
					{error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

					<div>
						<button type="submit" disabled={cargando} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
							{cargando ? 'Cargando...' : 'Iniciar Sesión'}
						</button>
					</div>
				</form>
				<p className="mt-2 text-center text-sm text-gray-600">
					¿No tienes una cuenta?{' '}
					<Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
						Regístrate aquí
					</Link>
				</p>
			</div>
		</div>
	);
};

export default Login;