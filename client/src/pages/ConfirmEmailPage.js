import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService from '../services/userService';

const ConfirmEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await userService.confirmEmail(token);
        toast.success(response.data.message);
        navigate('/login');
      } catch (error) {
        console.error('Error confirming email:', error);
        toast.error(error.response?.data?.error || 'Invalid or expired token');
      }
    };

    confirmEmail();
  }, [token, navigate]);

  return <div>Confirming your email...</div>;
};

export default ConfirmEmailPage;