import { useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import axios from "../services/axios";

export default function FetchUserData({ setUser }) {
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_PORT}/api/users/current`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (token) {
      fetchUserData();
    }
  }, [token, setUser]);

  return null;
}