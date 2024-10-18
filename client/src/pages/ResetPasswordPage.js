import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoCheckmarkSharp } from "react-icons/io5";
import 'react-toastify/dist/ReactToastify.css';
import './Auth.scss';
import { FormInput, Button } from '../components';
import userService from '../services/userService';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
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
      await userService.resetPassword(token, password);
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
      <form onSubmit={handleSubmit}>
        <FormInput
          id='password'
          name='password'
          type='password'
          placeholder='New Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FormInput
          id='confirmPassword'
          name='confirmPassword'
          type='password'
          placeholder='Confirm New Password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button variant='primary' type='submit' size='full-width'>Reset Password</Button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;