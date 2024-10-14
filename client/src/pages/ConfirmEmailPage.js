import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ConfirmEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        await axios.get(`/api/users/confirm/${token}`);
        toast.success('Email confirmed successfully');
        navigate('/login');
      } catch (error) {
        toast.error('Invalid or expired token');
      }
    };

    confirmEmail();
  }, [token, navigate]);

  return <div>Confirming your email...</div>;
};

export default ConfirmEmailPage;