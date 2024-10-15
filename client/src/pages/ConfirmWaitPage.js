import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '../components';
import userService from '../services/userService';
import './Auth.scss';

const ConfirmWaitPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const handleResendEmail = async () => {
    try {
      await userService.resendConfirmationEmail(email);
      toast.success('Confirmation email resent. Please check your email.');
    } catch (error) {
      toast.error('Failed to resend confirmation email.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Waiting for Email Confirmation</h2>
      <p>Please check your email and click on the confirmation link to activate your account.</p>
      <Button variant='primary' onClick={() => navigate('/login')} size='full-width'>Go to Login</Button>
      <Button variant='secondary' onClick={handleResendEmail} size='full-width'>Resend Confirmation Email</Button>
    </div>
  );
};

export default ConfirmWaitPage;