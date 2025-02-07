import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoCheckmarkSharp } from "react-icons/io5";
import 'react-toastify/dist/ReactToastify.css';
import './Auth.scss';
import { FormInput, Button } from '../components';
import userService from '../services/userService';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  const [resetCode, setResetCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.verifyResetCode(email, resetCode);
      setIsCodeValid(true);
      toast.dark(<div><strong>Reset code validated</strong></div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCheckmarkSharp size={24} />,
        className: "Toastify__toast--success",
      });
    } catch (error) {
      toast.dark(<div><strong>Invalid reset code</strong></div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCheckmarkSharp size={24} />,
        className: "Toastify__toast--error",
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.dark(<div><strong>Passwords do not match</strong></div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCheckmarkSharp size={24} />,
        className: "Toastify__toast--warning",
      });
      return;
    }

    try {
      await userService.resetPassword(email, resetCode, password);
      toast.dark(<div><strong>Password reset successfully</strong></div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCheckmarkSharp size={24} />,
        className: "Toastify__toast--success",
      });
      navigate('/login');
    } catch (error) {
      toast.dark(<div><strong>Error resetting password</strong></div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCheckmarkSharp size={24} />,
        className: "Toastify__toast--error",
      });
    }
  };

  return (
    <div className="auth-container">
      <h2>Reset Password</h2>
      {!isCodeValid ? (
        <form onSubmit={handleCodeSubmit}>
          <FormInput
            id='resetCode'
            name='resetCode'
            type='text'
            placeholder='Reset Code'
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            required
          />
          <Button variant='primary' type='submit' size='full-width'>Validate Code</Button>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit}>
          <FormInput
            id='password'
            name='password'
            type='password'
            label='New Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FormInput
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            label='Confirm New Password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button variant='primary' type='submit' size='full-width'>Reset Password</Button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;