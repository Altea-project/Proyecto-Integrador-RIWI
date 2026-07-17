import { apiClient } from "./apiClient.js";

export const projectService = {
  // HU-12 · T1 (backend) — galería de proyectos.
  async getProjects() {
    const response = await apiClient.get("/projects");
    return response.data.projects;
  },

  // HU-13 (backend) — detalle de un proyecto. Lanza el error tal cual
  // lo arma apiClient (error.status === 404 si el proyecto no existe,
  // ver apiClient.js) para que ProjectDetailView decida qué mostrar.
  async getProjectById(id) {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data.project;
  },
};
