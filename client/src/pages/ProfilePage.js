// client/src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import userService from '../services/userService';
import { FormInput, Button } from '../components';

import './ProfilePage.scss';

const ProfilePage = () => {
  const { user, setUser, logout } = useUser();
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setEmail(user.email);
    setUsername(user.username);
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateUserDetails({ email, username });
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail(user.email);
    setUsername(user.username);
    setIsEditing(false);
  };

  return (
    <div>
      <h1>Profile Page</h1>
      {error && <p>{error}</p>}
      <div>
        <p className='profile-label'>Email</p>
        <p>{email}</p>
      </div>
      <div>
        <p className='profile-label'>Username</p>
        {isEditing ? (
          <FormInput type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        ) : (
          <p style={{ margin: '0', padding: '12px 0' }}>{username}</p>
        )}
      </div>
      <div className='profile-buttons'>
        {isEditing ? (
          <div className='profile-buttons-editing'>
            <Button variant='transparent' onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant='primary' onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ) : (
            <Button variant='outline' onClick={() => setIsEditing(true)}>Edit</Button>
        )}
        
      </div>
      <Button variant='transparent' onClick={logout}>Logout</Button>
    </div>
  );
};

export default ProfilePage;