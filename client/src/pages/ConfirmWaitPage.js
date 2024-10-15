import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoCheckmarkSharp } from "react-icons/io5";
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
      toast.dark(<div><strong>Confirmation email</strong> has been resent. Please check your email.</div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCheckmarkSharp size={24} />,
        className: "Toastify__toast--success",
      });
      setWaitTime(9);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const { waitTime } = error.response.data;
        setWaitTime(waitTime);
        toast.dark(<div><strong>Please wait {waitTime} seconds</strong> before resending the confirmation email.</div>, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
          icon: <IoCheckmarkSharp size={24} />,
          className: "Toastify__toast--error",
        });
      } else if (error.response && error.response.data && error.response.data.error) {
        toast.dark(<div><strong>Error:</strong> {error.response.data.error}</div>, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
          icon: <IoCheckmarkSharp size={24} />,
          className: "Toastify__toast--error",
        });
      } else {
        toast.dark(<div><strong>Failed to resend confirmation email.</strong></div>, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
          icon: <IoCheckmarkSharp size={24} />,
          className: "Toastify__toast--error",
        });
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Waiting for Email Confirmation</h2>
      <p>Check your email (including spam) and click the confirmation link to activate your account.</p>
      <div className="auth-container__buttons">
        <Button variant='primary' onClick={() => navigate('/login')} size='full-width'>Login</Button>
        <Button variant='transparent' onClick={handleResendEmail} size='full-width' disabled={waitTime > 0}>
          {waitTime > 0 ? `Resend (${waitTime}s)` : 'Resend'}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmWaitPage;