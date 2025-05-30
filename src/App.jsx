import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import HandleResetPasswordPage from './pages/HandleResetPasswordPage'; // Importar el nuevo manejador
import Dashboard from './pages/Dashboard';
function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Welcome />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/reset-password" element={<HandleResetPasswordPage />} />
				<Route path="*" element={<Welcome />} /> {/* Ruta para páginas no encontradas */}
			</Routes>
		</Router>
	);
}

export default App; 