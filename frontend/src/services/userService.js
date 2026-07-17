import { apiClient } from "./apiClient.js";

export const userService = {
  async changePassword({ newPassword, confirmPassword }) {
    const response = await apiClient.patch("/change-password", {
      newPassword,
      confirmPassword,
    });
    return response;
  },

  async createUser({ name, email, role, phone, document, company }) {
    const response = await apiClient.post("/users", {
      name,
      email,
      role,
      phone,
      document,
      company,
    });
    return response;
  },

  async getUsers() {
    const response = await apiClient.get("/users");
    return response;
  },

  async assignTl(userId, tlId) {
    const response = await apiClient.patch(`/users/${userId}/assign-tl`, {
      tlId,
    });
    return response;
  },

  async updateUser(userId, { name, email, phone, document, role, company }) {
    const response = await apiClient.patch(`/users/${userId}`, {
      name,
      email,
      phone,
      document,
      role,
      company,
    });
    return response;
  },

  async deleteUser(userId) {
    const response = await apiClient.delete(`/users/${userId}`);
    return response;
  },
};
