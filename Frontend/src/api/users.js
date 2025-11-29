import axios from "../hooks/useAxios";

/**
 * Fetch all users
 * Returns array of { id, username }
 */
export const getUsers = async () => {
  try {
    const response = await axios.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Assign multiple permissions to a user
 * @param {number} userId - User ID
 * @param {array} permissionIds - Array of permission IDs
 */
export const assignUserPermissions = async (userId, permissionIds) => {
  try {
    const response = await axios.post(`/users/${userId}/permissions`, {
      permissions: permissionIds
    });
    return response.data;
  } catch (error) {
    console.error("Error assigning user permissions:", error);
    throw error;
  }
};
