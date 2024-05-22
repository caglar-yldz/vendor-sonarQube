import axios from "../services/axios";

export default async function fetchUsers(token, user) {
  // if (!token || (user.role !== 'admin' && user.role !== 'project_manager')) {
  //   throw new Error('Invalid token or user');
  // }

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_PORT}/api/company/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data !== 'empty') {
      return response.data;
    } else {
      // No error logged when server returns 'empty'
      return [];
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}