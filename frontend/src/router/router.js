import { routes } from "./routes.js";
import { getUser } from "../state/store.js";
import { homeForRole } from "../utils/navigation.js";

function matchRoute(path) {
  const pathSegments = path.split("/").filter(Boolean);

  for (const route of routes) {
    if (route.path === "*") continue; // el comodín se evalúa al final, no acá

    const routeSegments = route.path.split("/").filter(Boolean);
    if (routeSegments.length !== pathSegments.length) continue;

    const params = {};
    const isMatch = routeSegments.every((segment, i) => {
      if (segment.startsWith(":")) {
        params[segment.slice(1)] = pathSegments[i];
        return true;
      }
      return segment === pathSegments[i];
    });

    if (isMatch) return { route, params };
  }

  // Ninguna ruta real coincidió: usar el comodín "*"
  const notFound = routes.find((r) => r.path === "*");
  return notFound ? { route: notFound, params: {} } : null;
}

// Verifica si el usuario actual tiene permiso para ver esta ruta
function isAuthorized(route) {
  if (route.roles === undefined) return true;

  const user = getUser();
  if (!user) return false;

  if (route.roles === null) return true;

  return route.roles.includes(user.roleName);
}

// Renderiza la vista correspondiente y ejecuta su lógica de montaje
function render() {
  const path = window.location.pathname;
  const match = matchRoute(path);
  const appRoot = document.getElementById("app");

  if (!match) return;

  const { route, params } = match;
  const user = getUser();

  // Rutas solo-invitado (ej. /login): si ya hay sesión, se manda al
  // dashboard del rol en vez de mostrar el login otra vez (cubre el caso
  // de escribir /login a mano estando logueado).
  if (route.guestOnly && user) {
    navigate(homeForRole(user.roleName));
    return;
  }

  if (!isAuthorized(route)) {
    // Sin sesión -> al login. Con sesión pero rol equivocado (ej. un coder
    // abriendo /admin) -> a su propio home, no al login: ya está autenticado.
    navigate(user ? homeForRole(user.roleName) : "/login");
    return;
  }

  const isChangePasswordFlow = path === "/change-password";
  if (user && user.mustChangePassword && !isChangePasswordFlow) {
    navigate("/change-password");
    return;
  }

  appRoot.innerHTML = route.view(params);
  if (route.mount) {
    route.mount(params);
  }
}

// Navegación programática sin recargar la página
export function navigate(path) {
  history.pushState(null, "", path);
  render();
}

// Intercepta clics en links internos (<a href="/ruta">) para navegar sin recargar
function handleLinkClicks(event) {
  const link = event.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  if (!isInternal) return;

  event.preventDefault();
  navigate(href);
}

// Escucha el botón "atrás/adelante" del navegador para mantener la SPA sincronizada
export function initRouter() {
  window.addEventListener("popstate", render);
  document.addEventListener("click", handleLinkClicks);
  render();
}
