import { apiClient } from "./apiClient.js";

export const userService = {
  async changePassword({ newPassword, confirmPassword }) {
    const response = await apiClient.patch("/change-password", {
      newPassword,
      confirmPassword,
    });
    return response;
  },
};
