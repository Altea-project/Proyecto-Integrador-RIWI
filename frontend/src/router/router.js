import { routes } from "./routes.js";

// Busca la primera ruta que coincida con la URL actual
function matchRoute(path) {
  return routes.find((r) => r.path === path);
}

// Renderiza la vista correspondiente y ejecuta su lógica de montaje
function render() {
  const path = window.location.pathname;
  const route = matchRoute(path);
  const appRoot = document.getElementById("app");

  if (route) {
    appRoot.innerHTML = route.view();
    if (route.mount) {
      route.mount();
    }
  }
}

// Navegación programática sin recargar la página
export function navigate(path) {
  history.pushState(null, "", path);
  render();
}

// Escucha el botón "atrás/adelante" del navegador para mantener la SPA sincronizada
export function initRouter() {
  window.addEventListener("popstate", render);
  render();
}
