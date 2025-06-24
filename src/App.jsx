import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import HandleResetPasswordPage from './pages/HandleResetPasswordPage';
import Dashboard from './pages/Dashboard';
import IngredientsPage from './pages/IngredientsPage';
import MainLayout from './components/MainLayout'; // Importar el MainLayout
import RecipesPage from './pages/RecipesPage';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Welcome />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/reset-password" element={<HandleResetPasswordPage />} />

				{/* Rutas que usan MainLayout */}
				<Route element={<MainLayout />}>
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/ingredients" element={<IngredientsPage />} />
					<Route path="/recipes" element={<RecipesPage />} /> {/* Temporalmente apunta a Dashboard, idealmente a RecipesPage */}
				</Route>

				<Route path="*" element={<Welcome />} /> {/* Ruta para páginas no encontradas */}
			</Routes>
		</Router>
	);
}
export default App; 