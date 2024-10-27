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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessages, setErrorMessages] = useState([]);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages([]);

    let isValid = true;
    const newErrorMessages = [];

    if (username.trim() === '') {
      setIsUsernameValid(false);
      newErrorMessages.push('Username is required');
      isValid = false;
    } else {
      setIsUsernameValid(true);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsEmailValid(false);
      newErrorMessages.push('Invalid email address');
      isValid = false;
    } else {
      setIsEmailValid(true);
    }

    if (password.trim() === '') {
      setIsPasswordValid(false);
      newErrorMessages.push('Password is required');
      isValid = false;
    } else {
      setIsPasswordValid(true);
    }

    if (password !== confirmPassword) {
      setIsConfirmPasswordValid(false);
      newErrorMessages.push('Passwords do not match');
      isValid = false;
    } else {
      setIsConfirmPasswordValid(true);
    }

    if (!isValid) {
      setErrorMessages(newErrorMessages);
      return;
    }

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
      if (error.message === 'Database is not reachable. Please try again later.') {
        toast.dark(<div><strong>{error.message}</strong></div>, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
          icon: <IoCheckmarkSharp size={24} />,
          className: "Toastify__toast--error",
        });
      } else if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error;
        console.log('Received error message:', errorMessage);
        if (errorMessage.includes("Invalid email address")) {
          newErrorMessages.push('Invalid email address');
          setIsEmailValid(false);
        } else if (errorMessage.includes('Email and Username are already in use')) {
          newErrorMessages.push('Email and Username are already in use');
          setIsEmailValid(false);
          setIsUsernameValid(false);
        } else if (errorMessage.includes('Email is already in use')) {
          newErrorMessages.push('Email is already in use');
          setIsEmailValid(false);
        } else if (errorMessage.includes('Username is already in use')) {
          newErrorMessages.push('Username is already in use');
          setIsUsernameValid(false);
        }
      } else {
        toast.dark(<div><strong>Registration failed</strong></div>, {
          autoClose: 3000,
          pauseOnFocusLoss: false,
          icon: <IoCheckmarkSharp size={24} />,
          className: "Toastify__toast--error",
        });
      }
      setErrorMessages(newErrorMessages);
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
          isWarning={!isUsernameValid}
        />
        <FormInput
          id='email'
          name='email'
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          isWarning={!isEmailValid}
        />
        <FormInput
          id='password'
          name='password'
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          isWarning={!isPasswordValid}
        />
        <FormInput
          id='confirmPassword'
          name='confirmPassword'
          type='password'
          placeholder='Confirm Password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          isWarning={!isConfirmPasswordValid}
        />
        {errorMessages.map((message, index) => (
          <Warning key={index} message={message} />
        ))}
        <Button className='auth-button' variant='primary' type='submit' size='full-width'>Register</Button>
        <p className='auth-link'>Already have an account? <span className='link' onClick={() => navigate('/login')}>Log in</span></p>
      </form>
    </div>
  );
};

export default RegisterPage;