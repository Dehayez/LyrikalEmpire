import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoCheckmarkSharp } from "react-icons/io5";
import 'react-toastify/dist/ReactToastify.css';
import './Auth.scss';
import { FormInput, Button, Warning } from '../components';
import userService from '../services/userService';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await userService.register({ username, email, password });
      toast.dark(<div><strong>Registration successful</strong>. Check your email to confirm your account.</div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCheckmarkSharp size={24} />,
        className: "Toastify__toast--success",
      });
      navigate('/confirm-wait', { state: { email } });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error;
        console.log('Received error message:', errorMessage);
        if (errorMessage.includes("Invalid email address")) {
          setErrorMessage('Invalid email address');
        } else if (errorMessage.includes('Email and Username are already in use')) {
          setErrorMessage('Email and Username are already in use');
        } else if (errorMessage.includes('Email is already in use')) {
          setErrorMessage('Email is already in use');
        } else if (errorMessage.includes('Username is already in use')) {
          setErrorMessage('Username is already in use');
        }
      } else {
        toast.dark(<div><strong>Registration failed</strong></div>, {
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
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <FormInput
          id='username'
          name='username'
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <FormInput
          id='email'
          name='email'
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <Button variant='primary' type='submit' size='full-width'>Register</Button>
        <Button variant='transparent' type='button' size='full-width' onClick={() => navigate('/login')}>Login</Button>
      </form>
      {errorMessage && <Warning message={errorMessage} />}
    </div>
  );
};

export default RegisterPage;