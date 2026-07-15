import { navigate } from "../router/router.js";
import { validateForm } from "../utils/validators.js";
import { authService } from "../services/authService.js";
import { storage } from "../utils/storage.js";
import { setUser } from "../state/store.js";

function emailIcon() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M16.5 4.5C16.5 3.675 15.825 3 15 3H3C2.175 3 1.5 3.675 1.5 4.5V13.5C1.5 14.325 2.175 15 3 15H15C15.825 15 16.5 14.325 16.5 13.5V4.5ZM15 4.5L9 8.25L3 4.5H15ZM15 13.5H3V6L9 9.75L15 6V13.5Z" fill="currentColor"/>
  </svg>`;
}

function lockIcon() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M13.5 6H12.75V4.5C12.75 2.43 11.07 0.75 9 0.75C6.93 0.75 5.25 2.43 5.25 4.5V6H4.5C3.675 6 3 6.675 3 7.5V15C3 15.825 3.675 16.5 4.5 16.5H13.5C14.325 16.5 15 15.825 15 15V7.5C15 6.675 14.325 6 13.5 6ZM9 12.75C8.175 12.75 7.5 12.075 7.5 11.25C7.5 10.425 8.175 9.75 9 9.75C9.825 9.75 10.5 10.425 10.5 11.25C10.5 12.075 9.825 12.75 9 12.75ZM7.125 6V4.5C7.125 3.465 7.965 2.625 9 2.625C10.035 2.625 10.875 3.465 10.875 4.5V6H7.125Z" fill="currentColor"/>
  </svg>`;
}

function eyeIcon() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M9 3.375C5.25 3.375 2.0475 5.8275 0.75 9.375C2.0475 12.9225 5.25 15.375 9 15.375C12.75 15.375 15.9525 12.9225 17.25 9.375C15.9525 5.8275 12.75 3.375 9 3.375ZM9 13.125C6.93 13.125 5.25 11.445 5.25 9.375C5.25 7.305 6.93 5.625 9 5.625C11.07 5.625 12.75 7.305 12.75 9.375C12.75 11.445 11.07 13.125 9 13.125ZM9 7.125C7.755 7.125 6.75 8.13 6.75 9.375C6.75 10.62 7.755 11.625 9 11.625C10.245 11.625 11.25 10.62 11.25 9.375C11.25 8.13 10.245 7.125 9 7.125Z" fill="currentColor"/>
  </svg>`;
}

function eyeOffIcon() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M3.6 2.25L2.25 3.6L5.415 6.765C4.215 7.665 3.27 8.91 2.7 10.425C3.975 13.98 7.2 16.425 10.95 16.425C12.27 16.425 13.53 16.11 14.655 15.555L17.4 18.3L18.75 16.95L3.6 2.25ZM10.95 14.175C8.865 14.175 7.2 12.51 7.2 10.425C7.2 9.885 7.335 9.375 7.575 8.94L12.06 13.425C11.625 13.665 11.115 13.8 10.575 13.8V14.175H10.95Z" fill="currentColor"/>
    <path d="M10.95 5.625C13.035 5.625 14.7 7.29 14.7 9.375C14.7 10.035 14.535 10.65 14.25 11.19L16.44 13.38C17.61 12.315 18.495 10.95 18.975 9.375C17.7 5.82 14.475 3.375 10.725 3.375C9.405 3.375 8.145 3.69 7.02 4.245L9.21 6.435C9.75 6.165 10.365 5.985 10.95 5.985V5.625Z" fill="currentColor"/>
  </svg>`;
}

// Mapea el roleName del usuario autenticado a su ruta de destino tras el login
const ROLE_ROUTES = {
  admin: "/admin",
  coder: "/coder",
  instructor: "/tl",
  recruiter: "/recruiter",
};

// Fondo con efectos visuales y tarjeta centrada de inicio de sesión
export function LoginView() {
  return `
    <div class="relative min-h-screen flex items-center justify-center px-4 py-8 bg-bg-primary">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div class="relative w-full max-w-md">
        <a href="/" data-nav class="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors duration-200 mb-8 font-body text-sm" aria-label="Volver al inicio">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Volver al inicio
        </a>

        <div class="bg-bg-secondary border border-border-default rounded-2xl p-8 sm:p-10 shadow-2xl">
          <div class="text-center mb-8">
            <div class="flex justify-center mb-5">
              <img src="/assets/logos/horizontalLogoNegative.svg" alt="Altea — logotipo horizontal" class="w-32 h-auto" />
            </div>
            <p class="font-body text-text-secondary text-[15px] sm:text-base mt-2 leading-relaxed">
              Muestra tu trabajo. Conecta con nuevas oportunidades.
            </p>
          </div>

          <form id="login-form" novalidate>
            <div class="mb-4">
              <div class="flex items-center justify-between mb-1.5">
                <label for="email" class="font-body font-semibold text-xs text-text-primary uppercase tracking-wide">
                  Correo electrónico
                </label>
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-tertiary">
                  ${emailIcon()}
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="tu@correo.com"
                  autocomplete="email"
                  class="w-full bg-[#1a1f2e] border border-border-default rounded-xl pl-10 pr-4 py-3 font-body text-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
                  aria-describedby="email-error"
                />
              </div>
              <p id="email-error" class="text-state-error text-xs font-body mt-1.5 hidden" role="alert"></p>
            </div>

            <div class="mb-2">
              <div class="flex items-center justify-between mb-1.5">
                <label for="password" class="font-body font-semibold text-xs text-text-primary uppercase tracking-wide">
                  Contraseña
                </label>
                <a href="/forgot-password" data-nav class="font-body font-medium text-sm text-brand-primary-light hover:text-brand-primary transition-colors duration-200">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-tertiary">
                  ${lockIcon()}
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  class="w-full bg-[#1a1f2e] border border-border-default rounded-xl pl-10 pr-11 py-3 font-body text-base text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-200"
                  aria-describedby="password-error"
                />
                <button
                  id="toggle-password"
                  type="button"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-tertiary hover:text-text-secondary transition-colors duration-200"
                  aria-label="Mostrar contraseña"
                  tabindex="-1"
                >
                  ${eyeIcon()}
                </button>
              </div>
              <p id="password-error" class="text-state-error text-xs font-body mt-1.5 hidden" role="alert"></p>
            </div>

            <p id="form-error" class="text-state-error text-sm font-body text-center mb-3 hidden" role="alert"></p>

            <button
              id="submit-btn"
              type="submit"
              class="w-full rounded-xl py-3.5 font-body font-semibold text-base text-white bg-brand-primary hover:bg-brand-primary-light transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(128,68,240,0.3)]"
            >
              Iniciar sesión
            </button>
          </form>

          <div class="mt-2">
            <p class="text-text-tertiary text-sm font-body leading-relaxed text-center">
              Bienvenido nuevamente a Altea. Construye tu portafolio y conecta con nuevas oportunidades.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-center gap-4 mt-6 text-sm font-body">
          <a href="/terminos" data-nav class="text-text-tertiary hover:text-text-secondary transition-colors duration-200">
            Términos del servicio
          </a>
          <span class="text-border-default" aria-hidden="true">•</span>
          <a href="/privacidad" data-nav class="text-text-tertiary hover:text-text-secondary transition-colors duration-200">
            Política de privacidad
          </a>
        </div>
      </div>
    </div>
  `;
}

// Conecta los eventos del DOM después de renderizar el template
export function mountLoginView() {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const formError = document.getElementById("form-error");
  const toggleBtn = document.getElementById("toggle-password");
  const submitBtn = document.getElementById("submit-btn");

  function showError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
  }

  function hideError(element) {
    element.textContent = "";
    element.classList.add("hidden");
  }

  function validateEmail() {
    const { valid, errors } = validateForm({ email: emailInput.value });
    if (!valid) {
      showError(emailError, errors.email);
      emailInput.classList.add(
        "border-state-error",
        "focus:border-state-error",
      );
      return false;
    }
    hideError(emailError);
    emailInput.classList.remove(
      "border-state-error",
      "focus:border-state-error",
    );
    return true;
  }

  function validatePassword() {
    const { valid, errors } = validateForm({ password: passwordInput.value });
    if (!valid) {
      showError(passwordError, errors.password);
      passwordInput.classList.add(
        "border-state-error",
        "focus:border-state-error",
      );
      return false;
    }
    hideError(passwordError);
    passwordInput.classList.remove(
      "border-state-error",
      "focus:border-state-error",
    );
    return true;
  }

  function clearErrors() {
    hideError(emailError);
    hideError(passwordError);
    hideError(formError);
    emailInput.classList.remove(
      "border-state-error",
      "focus:border-state-error",
    );
    passwordInput.classList.remove(
      "border-state-error",
      "focus:border-state-error",
    );
  }

  emailInput.addEventListener("blur", validateEmail);

  passwordInput.addEventListener("blur", validatePassword);

  emailInput.addEventListener("input", () => {
    if (!emailError.classList.contains("hidden")) {
      validateEmail();
    }
  });

  passwordInput.addEventListener("input", () => {
    if (!passwordError.classList.contains("hidden")) {
      validatePassword();
    }
  });

  // Alterna la visibilidad de la contraseña con el botón de ojo
  toggleBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    toggleBtn.innerHTML = isPassword ? eyeOffIcon() : eyeIcon();
    toggleBtn.setAttribute(
      "aria-label",
      isPassword ? "Ocultar contraseña" : "Mostrar contraseña",
    );
  });

  // Validación, autenticación real contra el backend y redirección según roleName
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Iniciando sesión...";

    try {
      const { token, user, mustChangePassword } = await authService.login({
        email: emailInput.value,
        password: passwordInput.value,
      });

      storage.setToken(token);
      setUser({ ...user, mustChangePassword });

      if (mustChangePassword) {
        navigate("/change-password");
      } else {
        const destination = ROLE_ROUTES[user.roleName] || "/";
        navigate(destination);
      }
    } catch (error) {
      const message =
        error.status === 401
          ? "Correo o contraseña incorrectos."
          : error.status === 400
            ? "Completá todos los campos requeridos."
            : "No pudimos conectar con el servidor. Intentá de nuevo.";

      showError(formError, message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Iniciar sesión";
    }
  });

  // Intercepta enlaces con data-nav para navegar sin recargar la página
  const navLinks = document.querySelectorAll("[data-nav]");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const path = link.getAttribute("href");
      navigate(path);
    });
  });
}
