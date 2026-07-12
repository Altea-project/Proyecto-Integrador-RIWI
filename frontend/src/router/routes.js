import { LoginView, mountLoginView } from "../views/LoginView.js";

// Tabla de rutas de la aplicación: ruta, vista y función de montaje
export const routes = [
  { path: "/", view: LoginView, mount: mountLoginView },
  { path: "/login", view: LoginView, mount: mountLoginView },
];
