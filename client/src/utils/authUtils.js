export const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('User is not logged in');
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };