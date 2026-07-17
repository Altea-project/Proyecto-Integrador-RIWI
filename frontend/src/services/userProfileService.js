import { apiClient } from "./apiClient.js";

export const userProfileService = {
  async getMyProfile() {
    const response = await apiClient.get("/users/me");
    return response.data.user;
  },
  async getPublicProfile(userId) {
    const response = await apiClient.get(`/users/${userId}/public`);
    return response.data.user;
  },
};
