import { useState, useEffect,useContext } from 'react';
import axios from "../services/axios";
import GlobalContext from '../context/GlobalContext';
export default function FetchProjects(token) {
  const [efforts, setEfforts] = useState([]);
  const {response} = useContext(GlobalContext);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response1 = await axios.get(
          `${import.meta.env.VITE_API_PORT}/api/effort/getEfforts/${response._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEfforts(response1.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token]);

  return efforts;
}