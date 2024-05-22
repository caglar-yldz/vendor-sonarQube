import { useState, useEffect } from 'react';
import axios from "../services/axios";

const useProfileFetchUserData = (token) => {
  const [user, setuser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_PORT}/api/users/current`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setuser(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };
    if (token) {
      fetchUserData();
    }
  }, [token]);

  return { user, isLoading };
};

export default useProfileFetchUserData;