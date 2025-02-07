import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import 'react-toastify/dist/ReactToastify.css';
import './Auth.scss';
import { FormInput, Button, CodeInput } from '../components';
import userService from '../services/userService';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  const [resetCode, setResetCode] = useState(new Array(6).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);

  useEffect(() => {
    if (resetCode.every(val => val !== '')) {
      handleCodeSubmit();
    }
  }, [resetCode]);

  const handleCodeSubmit = async (e) => {
    if (e) e.preventDefault();
    const code = resetCode.join('');
    try {
      await userService.verifyResetCode(email, code);
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
        icon: <IoCloseSharp size={24} />,
        className: "Toastify__toast--warning",
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.dark(<div><strong>Passwords do not match</strong></div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCloseSharp size={24} />,
        className: "Toastify__toast--warning",
      });
      return;
    }

    try {
      const code = resetCode.join('');
      await userService.resetPassword(email, code, password);
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
        icon: <IoCloseSharp size={24} />,
        className: "Toastify__toast--error",
      });
    }
  };

  return (
    <div className="auth-container">
      <h2>{isCodeValid ? 'Enter New Password' : 'Enter Reset Code'}</h2>
      {!isCodeValid ? (
        <form onSubmit={handleCodeSubmit}>
          <CodeInput value={resetCode} onChange={setResetCode} />
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