import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ResetPassword from './ResetPassword'; // Tu componente existente para solicitar el reseteo
import SetNewPassword from './SetNewPassword'; // El nuevo componente para establecer la contraseña

const HandleResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    if (token) {
        return <SetNewPassword token={token} />;
    } else {
        return <ResetPassword />;
    }
};

export default HandleResetPasswordPage;