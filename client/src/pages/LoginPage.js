import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoCheckmarkSharp } from "react-icons/io5";
import 'react-toastify/dist/ReactToastify.css';
import './Auth.scss';
import { FormInput, Button } from '../components';
import { useUser } from '../contexts/UserContext';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(identifier, password);
    } catch (error) {
      toast.dark(<div><strong>{error.message}</strong></div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCheckmarkSharp size={24} />,
        className: "Toastify__toast--warning",
      });
    }
  };

  return (
    <div className="auth-container">
      <h2>Log into your account</h2>
      <form onSubmit={handleSubmit}>
        <FormInput
          id='identifier'
          name='identifier'
          type='text'
          label='Email or username*'
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <FormInput
          id='password'
          name='password'
          type='password'
          label='Password*'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <p className='link-container'>
          <span className='link' onClick={() => navigate('/request-password-reset')}>Forgot Password?</span>
        </p>
        <Button className='auth-button' variant='primary' type='submit' size='full-width'>Login</Button>
        <p className='auth-link'>Don't have an account yet? <span className='link' onClick={() => navigate('/register')}>Register</span></p>
      </form>
    </div>
  );
};

export default LoginPage;