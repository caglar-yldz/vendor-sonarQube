import axios from "../services/axios";

export default function fetchUserData(token) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_PORT}/api/users/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      resolve(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      reject(error);
    }
  });
}