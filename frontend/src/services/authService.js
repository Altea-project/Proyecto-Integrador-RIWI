import { apiClient } from "./apiClient.js";

export const authService = {
  async login({ email, password }) {
    const response = await apiClient.post(
      "/login",
      { email, password },
      { auth: false },
    );
    console.log("authService.login response:", response);
    return response.data;
  },

  // Reconstruye la sesión a partir del token guardado (usado al
  // arrancar la app, ver main.js). auth: true por defecto, así que
  // apiClient ya adjunta el Authorization: Bearer <token> solo.
  async getCurrentUser() {
    const response = await apiClient.get("/me");
    return response.data;
  },
};
