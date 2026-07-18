import "../style.css";
import { storage } from "./utils/storage.js";
import { setUser } from "./state/store.js";
import { authService } from "./services/authService.js";
import { initRouter } from "./router/router.js";

async function bootstrap() {
  const token = storage.getToken();

  if (token) {
    try {
      const { user, mustChangePassword } = await authService.getCurrentUser();
      setUser({ ...user, mustChangePassword });
    } catch (error) {
      // Token inválido/expirado: no hay sesión real, se limpia
      // para no quedar en un estado inconsistente.
      storage.clearToken();
    }
  }

  initRouter();
}

bootstrap();
