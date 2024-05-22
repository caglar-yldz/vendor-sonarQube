import axios from "../services/axios";

export default async function FetchProjects(token) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_PORT}/api/projects`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}