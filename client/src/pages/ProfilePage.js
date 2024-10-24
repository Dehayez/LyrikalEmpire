import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import userService from '../services/userService';
import { FormInput, Button } from '../components';

const ProfilePage = () => {
  const { user, setUser } = useUser();
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

  return (
    <div>
      <h1>Profile Page</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Email:</label>
          <p>{email}</p>
      </div>
      <div>
        <label>Username:</label>
        {isEditing ? (
          <FormInput type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        ) : (
          <p style={{ margin: '0', padding: '12px 0' }}>{username}</p>
        )}
      </div>
      {isEditing ? (
        <Button variant='primary' onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      ) : (
        <Button variant='outline' onClick={() => setIsEditing(true)}>Edit</Button>
      )}
    </div>
  );
};

export default ProfilePage;