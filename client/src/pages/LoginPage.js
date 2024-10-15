import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Auth.scss';
import { FormInput, Button } from '../components';
import userService from '../services/userService';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.login({ identifier, password });
      localStorage.setItem('token', response.data.token);
      toast.success('Login successful');
      navigate('/');
    } catch (error) {
      toast.error('Invalid email/username or password');
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
      </form>
    </div>
  );
};

export default LoginPage;