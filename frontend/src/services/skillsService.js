import { apiClient } from "./apiClient.js";

export const skillService = {
  async getSkills() {
    const response = await apiClient.get("/skills");
    return response.data.skills;
  },
};
