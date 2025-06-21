import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ResetPassword from './ResetPassword';
import SetNewPassword from './SetNewPassword';

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