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
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <FormInput
          id='identifier'
          name='identifier'
          type='text'
          placeholder='Email or Username'
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <FormInput
          id='password'
          name='password'
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button variant='primary' type='submit' size='full-width'>Login</Button>
        <Button variant='transparent' type='button' size='full-width' onClick={() => navigate('/register')}>Register</Button>
        <Button variant='transparent' type='button' size='full-width' onClick={() => navigate('/request-password-reset')}>Forgot Password?</Button>
      </form>
    </div>
  );
};

export default LoginPage;