import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/constants';
import { getCookie, deleteCookie } from '../utils/cookieUtils';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const { t } = useTranslation();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
    
    return (
        <>
            {/* La Navbar ya no está aquí, está en MainLayout */}
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
                            <p className="text-lg"><span className="font-semibold">{t('dashboard.labels.email')}</span> {userData.email}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;