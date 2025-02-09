import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import 'react-toastify/dist/ReactToastify.css';
import './Auth.scss';
import { FormInput, Button, CodeInput } from '../components';
import userService from '../services/userService';

const ConfirmEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  const [confirmationCode, setConfirmationCode] = useState(new Array(6).fill(''));
  const [isCodeValid, setIsCodeValid] = useState(false);

  const handleCodeSubmit = async (e) => {
    if (e) e.preventDefault();
    const code = confirmationCode.join('');
    try {
      await userService.verifyConfirmationCode(email, code);
      setIsCodeValid(true);
      toast.dark(<div><strong>Confirmation code validated</strong></div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCheckmarkSharp size={24} />,
        className: "Toastify__toast--success",
      });
      navigate('/login');
    } catch (error) {
      toast.dark(<div><strong>Invalid confirmation code</strong></div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCloseSharp size={24} />,
        className: "Toastify__toast--warning",
      });
    }
  };

  return (
    <div className="auth-container">
      <h2>Confirm Your Email</h2>
      <form onSubmit={handleCodeSubmit}>
        <CodeInput value={confirmationCode} onChange={setConfirmationCode} />
        <Button variant='primary' type='submit' size='full-width'>Validate Code</Button>
      </form>
    </div>
  );
};

export default ConfirmEmailPage;