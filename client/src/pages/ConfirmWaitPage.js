import React, { useState, useEffect } from 'react';
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
  const [waitTime, setWaitTime] = useState(0);

  useEffect(() => {
    let timer;
    if (waitTime > 0) {
      timer = setInterval(() => {
        setWaitTime((prevWaitTime) => prevWaitTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [waitTime]);

  const handleResendEmail = async () => {
    try {
      await userService.resendConfirmationEmail(email);
      toast.success('Confirmation email resent. Please check your email.');
      setWaitTime(9);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const { waitTime } = error.response.data;
        setWaitTime(waitTime);
        toast.error(`Please wait ${waitTime} seconds before resending the confirmation email.`);
      } else if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else {
        toast.error('Failed to resend confirmation email.');
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Waiting for Email Confirmation</h2>
      <p>Please check your email and click on the confirmation link to activate your account.</p>
      <Button variant='primary' onClick={() => navigate('/login')} size='full-width'>Go to Login</Button>
      <Button variant='secondary' onClick={handleResendEmail} size='full-width' disabled={waitTime > 0}>
        {waitTime > 0 ? `Resend Confirmation Email (${waitTime}s)` : 'Resend Confirmation Email'}
      </Button>
    </div>
  );
};

export default ConfirmWaitPage;