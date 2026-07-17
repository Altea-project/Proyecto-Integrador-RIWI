import { apiClient } from "./apiClient.js";

export const projectService = {
  async createProject({
    title,
    description,
    repoUrl,
    imageUrl,
    isExternal,
    skillIds,
  }) {
    const response = await apiClient.post("/projects", {
      title,
      description,
      repoUrl,
      imageUrl,
      isExternal,
      skillIds,
    });
    return response.data;
  },

  async getMyProjects() {
    const response = await apiClient.get("/projects/mine");
    return response.data.projects;
  },
  async getProjectsByUserId(userId) {
    const response = await apiClient.get(`/projects/user/${userId}`);
    return response.data.projects;
  },
};
