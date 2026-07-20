// ============================================================
// navigation.js — A dónde pertenece cada rol.
// Se usa en el router para redirigir: cuando un usuario ya logueado
// entra a /login, o abre una ruta que no le corresponde, se le manda
// a su propio dashboard en vez de rebotarlo al login.
// ============================================================

import { ROLES } from "./constants.js";

export function homeForRole(roleName) {
  switch (roleName) {
    case ROLES.ADMIN:
      return "/admin";
    case ROLES.INSTRUCTOR:
      return "/tl";
    case ROLES.CODER:
      return "/dashboard";
    case ROLES.RECRUITER:
      return "/recruiter";
    default:
      return "/";
  }
}
