import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { IoCheckmarkSharp } from "react-icons/io5";
import 'react-toastify/dist/ReactToastify.css';
import './Auth.scss';
import { FormInput, Button } from '../components';
import userService from '../services/userService';

const RequestPasswordResetPage = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.requestPasswordReset(email);
      toast.dark(<div><strong>Password reset code sent</strong>. Please check your email.</div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCheckmarkSharp size={24} />,
        className: "Toastify__toast--success",
      });
    } catch (error) {
      toast.dark(<div><strong>Error sending password reset code</strong></div>, {
        autoClose: 3000,
        pauseOnFocusLoss: false,
        icon: <IoCheckmarkSharp size={24} />,
        className: "Toastify__toast--error",
      });
    }
  };

  return (
    <div className="auth-container">
      <h2>Request Password Reset</h2>
      <form onSubmit={handleSubmit}>
        <FormInput
          id='email'
          name='email'
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button variant='primary' type='submit' size='full-width'>Send Reset Code</Button>
      </form>
    </div>
  );
};

export default RequestPasswordResetPage;