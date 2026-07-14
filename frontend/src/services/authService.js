import { apiClient } from "./apiClient.js";

export const authService = {
  async login({ email, password }) {
    const response = await apiClient.post(
      "/login",
      { email, password },
      { auth: false },
    );

    return response.data;
  },
};
